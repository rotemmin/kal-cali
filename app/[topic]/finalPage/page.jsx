"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/lib/components/Header';
import NavigationButton from '@/components/NavigationButton';
import dictionaryIcon from '@/public/icons/dictionary.svg';
import notebookIcon from '@/public/icons/notebook.svg';
import './finalPage.css';

export default function FinalPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const { topic } = params;
  const normalizedTopic = topic.replace(/-/g, "_");

  const [userGender, setUserGender] = useState(null);
  const [topicData, setTopicData] = useState(null);
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
        const data = require(`@/lib/content/topics/${normalizedTopic}.json`);
        setTopicData(data);
      } catch (error) {
        console.error("Failed to load topic data:", error);
      }
    };

    const loadUserPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase
            .from('user_metadata')
            .select('sex')
            .eq('id', session.user.id)
            .single();

          if (!error) {
            setUserGender(data?.sex === 'male' ? 'male' : 'female');
          }
        }
      } catch (error) {
        console.error("Failed to load user preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopicData();
    loadUserPreferences();
  }, [normalizedTopic, supabase]);

  if (!topicData || !userGender || isLoading) return null;

  return (
    <div className="rtl">
      <Header />
      <main className="final-page">
        <div className="content-container">
          <div className="image-wrapper">
            <div className="cochevet-container">
              <Image
                src={userGender === 'male' ? '/cochav.svg' : '/cochevet.svg'}
                alt={userGender === 'male' ? 'Cochav' : 'Cochevet'}
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>

            <div className={`sticker-container ${showSticker ? 'show-sticker' : ''} ${animateToNotebook ? 'animate-to-notebook' : ''}`}>
              <Image
                src={`/icons/stickers/final_${normalizedTopic}.svg`}
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
            onClick={() => router.push('/homePage')}
            className="return-button"
          >
            בחזרה לדף הבית
          </button>
        </div>

        <div className="nav-buttons">
          <NavigationButton
            icon={dictionaryIcon}
            link="/dictionary"
            position="right"
            altText="Dictionary"
          />
          <NavigationButton
            icon={notebookIcon}
            link={`/personal_notebook?${topic ? `topic=${topic}` : ""}`}
            position="left"
            altText="Notebook"
          />
        </div>
      </main>
    </div>
  );
}