'use client';

import { useEffect, useState } from 'react';

export default function Hands() {
    const [tiles, setTiles] = useState([]);

    useEffect(() => {
        // Generate an array of 13 tiles
        const generatedTiles = Array.from({ length: 13 }, (_, index) => ({
            id: index + 1,
            backgroundImage: `url('Regular/0m.png')`, // Adjust the image path as needed
        }));

        setTiles(generatedTiles);
    }, []);

    return (
        <div className="playerhand">
            {tiles.map(tile => (
                <div 
                    key={tile.id} 
                    style={{ backgroundImage: tile.backgroundImage }} 
                    className="tile"
                ></div>
            ))}
        </div>
    );
}