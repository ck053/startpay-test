'use client';

import { useEffect, useState } from 'react';
import { ITEMS, Item } from '@/app/data/items';
import { Purchase, CurrentPurchaseWithSecret } from '@/app/types';
import '@/app/globals.css';
// Import components
import LoadingState from '@/app/components/LoadingState';
import ErrorState from '@/app/components/ErrorState';
import ItemsList from '@/app/components/ItemsList';
import PurchaseHistory from '@/app/components/PurchaseHistory';
import ShowBalance from '@/app/components/ShowBalance';
import BackButton from '@/app/components/BackButton';
import en from '../app/types/en';
type Translations = typeof en;
import zh from '../app/types/zh';
import ja from '../app/types/ja';
const resources = {
  en,
  zh,
  ja
} as const;

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
  const [username, setUsername] = useState<string>('');
  const [balance, setBalance] = useState<number>(-1);
  const [language, setLanguage] = useState<string>('en');

  const fetchBalance = async (userid: string) => {
    try {
      const response = await fetch('/api/get-balance', {
        method: 'POST',
        body: userid
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      } else {
        console.log(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      console.log('Network error');
    } 
  };

  useEffect(() => {
    // Import TWA SDK dynamically to avoid SSR issues
    const initTelegram = async () => {
      try {
        // Dynamic import of the TWA SDK
        const WebApp = (await import('@twa-dev/sdk')).default;
        const detectLanguage = () => {
          const language = WebApp.initDataUnsafe.user?.language_code;
          if (language) {
            const langCode = language.split('-')[0];
            return Object.keys(resources).includes(langCode) ? langCode : 'en';
          }
            return navigator.language.split('-')[0] || 'en';
        };
          
        setLanguage(detectLanguage());
        
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
            await fetchBalance(user.id?.toString());
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

  // Fetch purchase history
  useEffect(() => {
    if (initialized && userId) {
      fetchPurchases();
    }
  }, [initialized, userId]);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/purchases?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }
      
      const data = await response.json();
      setPurchases(data.purchases);
      fetchBalance(userId);
    } catch (e) {
      console.error('Error fetching purchases:', e);
      setError('Failed to load purchase history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(purchases)
;  }, [purchases])
  
  const handlePurchase = async (item: Item) => {
    try {
      setIsLoading(true); // Show loading indicator when starting purchase
      //if (balance < item.price) throw new Error("Not enough coins");
      const response = await fetch('/api/require-gift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, item }),
      })
      if (!response.ok) throw new Error("server rejected");
      fetchBalance(userId);
      fetchPurchases();
      setIsLoading(false);
      //TODO: success update
    } catch(error) {
      setIsLoading(false);
      console.log("Error on sending gift", error)
      alert(error)
    }
  };

  // Function to reveal secret for past purchases
  const revealSecret = async (purchase: Purchase) => {
    try {
      // Fetch the secret from the server for this purchase
      setIsLoading(true);
      const response = await fetch(`/api/get-secret?itemId=${purchase.itemId}&transactionId=${purchase.transactionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to retrieve secret code');
      }
      
      const { secret } = await response.json();
      const item = ITEMS.find(i => i.id === purchase.itemId);
      
      if (item) {
        setModalState({
          type: 'purchase',
          purchase: {
            item,
            transactionId: purchase.transactionId,
            timestamp: purchase.timestamp,
            secret
          }
        });
      }
    } catch (e) {
      console.error('Error fetching secret:', e);
      alert('Unable to retrieve the secret code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect users to the bot for refunds
  const handleRefund = (transactionId: string) => {
    setModalState({ type: 'refund' });
  };

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
      {modalState.type === 'purchase' && modalState.purchase && modalState.purchase.item && (
        <PurchaseSuccessModal
          currentPurchase={modalState.purchase}
          onClose={handleCloseModal}
        />
      )}
      
      {modalState.type === 'refund' && (
        <RefundInstructionsModal
          onClose={handleCloseModal}
        />
      )}
      <ShowBalance balance={balance} 
      //@ts-ignore
      text={resources[language].star_number}/>
      <BackButton />
      <h1 className="text-2xl font-bold mb-6 text-center">Gift Store</h1>
      
      <ItemsList 
        items={ITEMS}
        onPurchase={handlePurchase}
      />
      
      <PurchaseHistory
        purchases={purchases}
        items={ITEMS}
        onViewSecret={revealSecret}
        onRefund={handleRefund}
      />
    </div>
  );
}
