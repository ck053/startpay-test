'use client';

import { useRouter } from 'next/router'; // Import useRouter for navigation
import { useState } from 'react';

const handleClick = async () => {
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

        // Navigate to the game page with room data
        router.push({
            pathname: '/game', // Adjust the path to your game page
            query: { roomId, ...roomData }, // Pass room data as query parameters
        });
    } catch (error) {
        console.error('Error creating room:', error);
    }
};

export default function StartButton() {
    const router = useRouter(); // Initialize useRouter

    return (
        <div>
            <h1>Welcome to Our Site</h1>
            <button className="button" onClick={handleClick}>
                Go to Game Page
            </button>
        </div>
    );
}