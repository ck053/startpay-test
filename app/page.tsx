'use client';

import { useEffect, useState} from 'react';
// Import components
import LoadingState from '@/app/components/LoadingState';
import ErrorState from '@/app/components/ErrorState';
import ShowBalance from '@/app/components/ShowBalance';
import Board from './game/components/Board';
import '@/app/game/game.css';

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

  function navigateTo(path: string) {
    // Hide all pages
    document.querySelectorAll<HTMLElement>('.page').forEach(page => {
      page.style.display = 'none';
    });
    
    // Show the requested page
    const element = document.getElementById(path);
    if (element) {
      element.style.display = 'block';
    }
    // Update browser history (optional)
    history.pushState({}, '', `#${path}`);
  }
  
  // Initialize - show home page by default
  window.addEventListener('DOMContentLoaded', () => {
    navigateTo('home');
    
    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
      const path = window.location.hash.substring(1) || 'home';
      navigateTo(path);
    });
  });
  // Handle start game request
  const handleClick = async (path: string) => {
    try {
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

        console.log('roomId: ', roomId);
        console.log('roomData: ', roomData);

        await navigateTo(path);
    } catch (error) {
        console.error('Error creating room:', error);
    }
};

  // Main app UI
  return (
    <div className="">
      <div id='home' className='page' style={{zIndex: '1'}}>
        <ShowBalance />
        <h1>Hi {username}!</h1>
        <h1>Welcome to Our Site</h1>
        <button onClick={() => handleClick('game') } className='button'>
          Go to Game Page
        </button>
      </div>
      <div id='game' className='page' style={{display: 'none', zIndex: '0'}}>
        <Board />
      </div>
    </div>
  );
}
