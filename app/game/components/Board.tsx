import { useEffect, useState } from 'react';

// Define the type for a tile
interface Tile {
    id: number;
    backgroundImage: string;
}

export default function Board() {
    // State for player's hand and opponent's hand
    const [playerTiles, setPlayerTiles] = useState<Tile[]>([]);
    const [opponentTiles, setOpponentTiles] = useState<Tile[]>([]);
    const [imageIndex, setImageIndex] = useState(10); // Start from image 10

    // Function to update hands
    const updateHands = () => {
        // Generate tiles for player (14 tiles)
        const generatedPlayerTiles: Tile[] = Array.from({ length: 14 }, (_, index) => ({
            id: index + 1,
            backgroundImage: `url('Regular/${imageIndex + index}.png')`, // Use current index
        }));

        // Generate tiles for opponent (14 tiles)
        const generatedOpponentTiles: Tile[] = Array.from({ length: 14 }, (_, index) => ({
            id: index + 1,
            backgroundImage: `url('Regular/${imageIndex + index}.png')`, // Use current index
        }));

        // Update state with new tiles
        setPlayerTiles(generatedPlayerTiles);
        setOpponentTiles(generatedOpponentTiles);

        // Increment the image index for the next refresh
        setImageIndex(prevIndex => prevIndex + 14); // Increase by 14 for the next set
    };

    // Call updateHands on component mount
    useEffect(() => {
        updateHands(); // Call this function to initialize the hands
    }, []);

    return (
        <div className="gameboard">
            <div className='playerhand'>
                {playerTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        style={{ backgroundImage: tile.backgroundImage }} 
                        className="tile"
                    ></div>
                ))}
            </div>
            <div className="opponent_hand_middle">
                {opponentTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        style={{ backgroundImage: tile.backgroundImage }} 
                        className="tile"
                    ></div>
                ))}
            </div>
            <button 
                onClick={updateHands} 
                className="refresh-button"
            >
                Refresh Tiles
            </button>
        </div>
    );
}