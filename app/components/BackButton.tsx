'use client'; // This component needs to run on the client side

import { useRouter } from 'next/navigation';

const BackButton = () => {
    const router = useRouter();

    const handleGoBack = () => {
        router.back(); // Navigate to the previous page
    };

    return (
        <button
            onClick={handleGoBack}
            style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '10px 15px',
                fontSize: '16px',
                color: 'white',
                backgroundColor: '#0070f3', // Blue background
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
            }}
        >
            Go Back
        </button>
    );
};

export default BackButton;