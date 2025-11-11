"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/general/Header';
import NavigationButton from '@/components/general/NavigationButton';
import './finalPage.css';

interface TopicData {
  final: {
    male: string;
    female: string;
  };
}

export default function FinalPage() {
  const auth = getAuth();
  const params = useParams();
  const router = useRouter();
  const { topic } = params;
  const normalizedTopic = typeof topic === 'string' ? topic.replace(/-/g, "_") : '';

  const [userGender, setUserGender] = useState<'male' | 'female' | null>(null);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [showSticker, setShowSticker] = useState(false);
  const [animateToNotebook, setAnimateToNotebook] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show sticker with delay for entrance animation
    const showTimer = setTimeout(() => {
      setShowSticker(true);
    }, 500);

    // Start animation to notebook after 3 seconds
    const animateTimer = setTimeout(() => {
      setAnimateToNotebook(true);
    }, 3000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(animateTimer);
    };
  }, []);

  useEffect(() => {
    const loadTopicData = async () => {
      try {
        console.log('Loading topic data for:', normalizedTopic);
        const response = await fetch(`/api/topics/${normalizedTopic}`);
        if (!response.ok) {
          throw new Error('Failed to load topic data');
        }
        const data = await response.json();
        console.log('Loaded topic data:', data);
        setTopicData(data);
      } catch (error) {
        console.error("Failed to load topic data:", error);
        try {
          const data = require(`@/lib/content/topics/${normalizedTopic}.json`);
          console.log('Loaded topic data from file:', data);
          setTopicData(data);
        } catch (fallbackError) {
          console.error("Failed to load topic data from file:", fallbackError);
        }
      }
    };

    const loadUserPreferences = async () => {
      try {
        const user = auth.currentUser;
        console.log('Current user:', user);
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          console.log('User doc exists:', userDoc.exists());
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data:', userData);
            if (userData.gender) {
              setUserGender(userData.gender === 'male' ? 'male' : 'female');
            } else {
              setUserGender('male');
              await setDoc(userDocRef, { gender: 'male' }, { merge: true });
            }
          } else {
            setUserGender('male');
            await setDoc(userDocRef, { gender: 'male' });
          }
        }
      } catch (error) {
        console.error("Failed to load user preferences:", error);
        setUserGender('male');
      } finally {
        setIsLoading(false);
      }
    };

    loadTopicData();
    loadUserPreferences();
  }, [normalizedTopic, auth]);

  // Add debug logs before the early return
  console.log('Debug state:', { topicData, userGender, isLoading });

  if (!topicData || !userGender || isLoading) {
    console.log('Returning null because:', { 
      noTopicData: !topicData, 
      noUserGender: !userGender, 
      isLoading 
    });
    return null;
  }

  const handleReturnHomeClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/homePage';
    } else {
      router.push('/homePage');
    }
  };

  return (
    <div className="rtl">
      <Header />
      <main className="final-page">
        <div className="content-container">
          <div className="image-wrapper">
            <div className="cochevet-container">
              <Image
                src={userGender === 'male' ? '/icons/cochav.svg' : '/icons/cochevet.svg'}
                alt={userGender === 'male' ? '/icons/cochav.svg' : '/icons/Cochevet.svg'}
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>

            <div className={`sticker-container ${showSticker ? 'show-sticker' : ''} ${animateToNotebook ? 'animate-to-notebook' : ''}`}>
              <Image
                src={`/stickers/finalStickers/final_${normalizedTopic}.svg`}
                alt="Topic Sticker"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>

          <div 
            className="final-message"
            dangerouslySetInnerHTML={{
              __html: topicData.final[userGender]
            }}
          />

          <button 
            onClick={handleReturnHomeClick}
            className="return-button"
          >
            בחזרה לדף הבית
          </button>
        </div>

        <div className="nav-buttons">
          <NavigationButton
            icon={"/icons/dictionary.svg"}
            link="/dictionary"
            position="right"
            altText="Dictionary"
          />
          <NavigationButton
            icon={"/icons/notebook.svg"}
            link={`/personal_notebook?${topic ? `topic=${topic}` : ""}`}
            position="left"
            altText="Notebook"
          />
        </div>
      </main>
    </div>
  );
}