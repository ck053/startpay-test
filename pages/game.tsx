'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Board from '@/app/game/components/Board';
import '@/app/game/game.css';

export default function game() {
    const router = useRouter();
    const { roomId, players, gameState } = router.query; // Extract room data from query

    useEffect(() => {
        if (roomId) {
            // Initialize your game with the room data
            console.log('Room ID:', roomId);
            console.log('Players:', players);
            console.log('Game State:', gameState);
            // Add your game initialization logic here
        }
    }, [roomId]);
    return <Board />;
};