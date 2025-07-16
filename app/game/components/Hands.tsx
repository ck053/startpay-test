'use client';

import { useEffect, useState } from 'react';

// Define the type for a tile
interface Tile {
    id: number;
    backgroundImage: string;
}

export default function Hands() {
    // Specify the type of tiles state as Tile[]
    const [tiles, setTiles] = useState<Tile[]>([]);

    useEffect(() => {
        // Clear existing tiles
        setTiles([]);

        // Generate an array of 13 tiles
        const generatedTiles: Tile[] = Array.from({ length: 13 }, (_, index) => ({
            id: index + 1,
            backgroundImage: `url('Regular/0m.png')`, // Corrected image path
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