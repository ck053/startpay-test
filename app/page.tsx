'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter for navigation

// Import components
import LoadingState from '@/app/components/LoadingState';
import ErrorState from '@/app/components/ErrorState';
import ShowBalance from '@/app/components/ShowBalance';

export default function Home() {
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [userid, setUserId] = useState<string>('');

  useEffect(() => {
    // Import TWA SDK dynamically to avoid SSR issues
    const initTelegram = async () => {
      try {
        // Dynamic import of the TWA SDK
        const WebApp = (await import('@twa-dev/sdk')).default;
        
        // Check if running within Telegram
        const isTelegram = WebApp.isExpanded !== undefined;
        
        if (isTelegram) {
          // Initialize Telegram Web App
          WebApp.ready();
          WebApp.expand();
          
          // Get user ID from initData
          if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
            // Access user data directly from the WebApp object
            const user = WebApp.initDataUnsafe.user;
            setUserId(user.id?.toString() || '');
            const userName = user.first_name || '';
            const userLastName = user.last_name || '';
            setUsername(`${userName}${userLastName ? ' ' + userLastName : ''}`);
          } else {
            setError('No user data available from Telegram');
            setIsLoading(false);
          }
        } else {
          // Not in Telegram, set an error message
          setError('This application can only be accessed from within Telegram');
          setIsLoading(false);
        }

        setInitialized(true);
        setIsLoading(false);
      } catch (e) {
        console.error('Failed to initialize Telegram Web App:', e);
        setError('Failed to initialize Telegram Web App');
        setInitialized(true);
        setIsLoading(false);
      }
    };

    initTelegram();
  }, []);

  // Handle retry on error
  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (!initialized || isLoading) {
    return <LoadingState />;
  }

  // Error state (including not in Telegram)
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Handle start game request

  const handleClick = async () => {
    try {
        const router = useRouter();
        const response = await fetch('/api/createRoom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to create room');
        }

        const { roomId, roomData } = await response.json();

        // Navigate to the game page with room data
        router.push({
            pathname: '/game', // Adjust the path to your game page
            query: { roomId, ...roomData }, // Pass room data as query parameters
        });
    } catch (error) {
        console.error('Error creating room:', error);
    }
};

  // Main app UI
  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      <ShowBalance />
      <h1>Hi {username}!</h1>
      <h1>Welcome to Our Site</h1>
      <button className="button" onClick={handleClick}>
        Go to Game Page
      </button>
    </div>
  );
}
