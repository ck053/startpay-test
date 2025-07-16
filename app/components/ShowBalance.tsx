'use client'; // This component needs to run on the client side

import Link from 'next/link';

const ShowBalance = () => {
    // Assume we have a user's balance (for demonstration purposes)
    const userBalance = 100; // Replace with actual balance logic

    return (
        <Link href="/purchase">
            <button style={{
                padding: '10px 20px',
                fontSize: '16px',
                color: 'white',
                backgroundColor: '#0070f3', // Blue background
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
            }}>
                Balance: ${userBalance}
            </button>
        </Link>
    );
};

export default ShowBalance;