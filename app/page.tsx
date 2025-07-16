'use client';

import { useEffect, useState } from 'react';
import { ITEMS, Item } from '@/app/data/items';
import { Purchase, CurrentPurchaseWithSecret } from '@/app/types';

// Import components
import LoadingState from '@/app/components/LoadingState';
import ErrorState from '@/app/components/ErrorState';
import ItemsList from '@/app/components/ItemsList';
import PurchaseHistory from '@/app/components/PurchaseHistory';
import PurchaseSuccessModal from '@/app/components/PurchaseSuccessModal';
import RefundInstructionsModal from '@/app/components/RefundInstructionsModal';
import StartButton from './components/StartButton';
import ShowBalance from './components/ShowBalance';

export default function Home() {
  const [initialized, setInitialized] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    type: 'purchase' | 'refund' | null;
    purchase?: CurrentPurchaseWithSecret;
  }>({ type: null });
  const [username, setUsername] = useState<string>('')

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

  // Close modals
  const handleCloseModal = () => {
    setModalState({ type: null });
  };

  // Loading state
  if (!initialized || isLoading) {
    return <LoadingState />;
  }

  // Error state (including not in Telegram)
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Main app UI
  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      <ShowBalance />
      <h1>Hi {username}!</h1>
      <StartButton />
    </div>
  );
}
