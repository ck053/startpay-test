'use client';

import { useEffect } from 'react';
import { SetBoard } from '@/app/game/SetBoard.js';
import '@/app/game/game.css';

const game = () => {
    useEffect(() => {
        SetBoard();
    }, []);

    return null;
};

export default game;