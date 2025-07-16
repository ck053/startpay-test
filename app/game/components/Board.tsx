'use client';

import Hands from './Hands'; // Adjust the import path as necessary

export default function Board() {
    return (
        <div className="gameboard">
            <Hands />
            <div className="opponent_hand_middle"></div>
        </div>
    );
}