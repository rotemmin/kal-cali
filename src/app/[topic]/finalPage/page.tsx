"use client";
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/general/Header';
import NavigationButton from '@/components/general/NavigationButton';
import './finalPage.css';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
const FINAL_ANIMATION_DELAY_MS = 800;

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
  const [isLoading, setIsLoading] = useState(true);
  const [animationData, setAnimationData] = useState<any>(null);
  const [animationHasError, setAnimationHasError] = useState(false);
  const [shouldPlayAnimation, setShouldPlayAnimation] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
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
          const userMetadataRef = doc(db, 'user_metadata', user.uid);
          const userMetadataDoc = await getDoc(userMetadataRef);
          console.log('User metadata doc exists:', userMetadataDoc.exists());
          
          if (userMetadataDoc.exists()) {
            const userData = userMetadataDoc.data();
            console.log('User data:', userData);
            if (userData.gender) {
              setUserGender(userData.gender === 'male' ? 'male' : 'female');
            } else {
              setUserGender('male');
              await setDoc(userMetadataRef, { gender: 'male' }, { merge: true });
            }
          } else {
            setUserGender('male');
            await setDoc(userMetadataRef, { gender: 'male' }, { merge: true });
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

  const placeholderSrc = useMemo(() => {
    if (!normalizedTopic) return null;
    return `/stickers/finalStickersBeforeAnima/BAnima_${normalizedTopic}.svg`;
  }, [normalizedTopic]);

  const animationSrc = useMemo(() => {
    if (!normalizedTopic) return null;
    return `/stickers/finalStickersAnima/Anima_${normalizedTopic}.json`;
  }, [normalizedTopic]);

  const finalStickerSrc = useMemo(() => {
    if (!normalizedTopic) return null;
    return `/stickers/finalStickers/final_${normalizedTopic}.svg`;
  }, [normalizedTopic]);

  const shouldShowContent = Boolean(topicData && userGender && !isLoading);

  useEffect(() => {
    setAnimationData(null);
    setAnimationHasError(false);
    setShouldPlayAnimation(false);
  }, [normalizedTopic]);

  useEffect(() => {
    if (!shouldShowContent || !animationSrc) {
      return;
    }

    let isCancelled = false;

    fetch(animationSrc)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load animation ${animationSrc}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!isCancelled) {
          setAnimationData(data);
          setShouldPlayAnimation(false);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch final animation:', error);
        if (!isCancelled) {
          setAnimationHasError(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [animationSrc, shouldShowContent]);

  useEffect(() => {
    if (!animationData || animationHasError) {
      return;
    }

    setShouldPlayAnimation(false);
    const timer = setTimeout(() => {
      setShouldPlayAnimation(true);
    }, FINAL_ANIMATION_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [animationData, animationHasError]);

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
      <main className={`final-page ${shouldShowContent ? '' : 'loading-state'}`}>
        {shouldShowContent ? (
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

              {placeholderSrc && (
                <div className="placeholder-container">
                  <Image
                    src={animationHasError && finalStickerSrc ? finalStickerSrc : placeholderSrc}
                    alt="Animation placeholder"
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                    className="placeholder-image"
                  />

                  {animationData && shouldPlayAnimation && !animationHasError && (
                    <div className="animation-container">
                      <Lottie
                        animationData={animationData}
                        loop={false}
                        autoplay
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className="final-message"
              dangerouslySetInnerHTML={{
                __html: topicData?.final[userGender ?? 'male'] ?? ''
              }}
            />

            <button
              onClick={handleReturnHomeClick}
              className="return-button"
            >
              בחזרה לדף הבית
            </button>
          </div>
        ) : (
          <div className="loading-placeholder">
            <div className="loading-spinner" />
            <p>טוען את הדף הסופי...</p>
          </div>
        )}

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