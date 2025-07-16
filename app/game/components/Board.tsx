import { useEffect, useState , useRef} from 'react';

// Define the type for a tile
interface Tile {
    id: number;
    backgroundImage: string;
}
var x: number;
export default function Board() {
    x = 0;
    // State for player's hand and opponent's hand
    const [playerTiles, setPlayerTiles] = useState<Tile[]>([]);
    const [opponentTiles, setOpponentTiles] = useState<Tile[]>([]);
    const playerHandRef = useRef<HTMLDivElement>(null); // Create a ref for player hand

    // Function to update hands
    const updateHands = () => {
        x += 1;
        // Generate tiles for player (14 tiles)
        const generatedPlayerTiles: Tile[] = Array.from({ length: 14 }, (_, index) => ({
            id: index + 1,
            backgroundImage: `url('Regular/0m.png')`, // Adjust the image path as needed
        }));

        // Generate tiles for opponent (14 tiles)
        const generatedOpponentTiles: Tile[] = Array.from({ length: 14 }, (_, index) => ({
            id: index + 1,
            backgroundImage: `url('Regular/0m.png')`, // Adjust the image path as needed
        }));

        // Update state with new tiles
        setPlayerTiles(generatedPlayerTiles);
        setOpponentTiles(generatedOpponentTiles);
    };

    // Call updateHands on component mount or whenever needed
    useEffect(() => {
        updateHands(); // Call this function to initialize the hands
    }, []);

    // Update playerhand height whenever tiles are updated
    useEffect(() => {
        const setPlayerHandHeight = () => {
            if (playerHandRef.current) {
                const playerHandHeight = playerHandRef.current.offsetHeight; // Get height
                document.documentElement.style.setProperty('--playerhand-height', `${playerHandHeight}px`); // Set CSS variable
                console.log(`Setting player hand height to: ${playerHandHeight}px`); // Debugging log
            }
        };

        // Use setTimeout to ensure the height is set after rendering
        setTimeout(setPlayerHandHeight, 0); // Delay to wait for render

        // Optionally, you can also call it again after updating tiles
        return () => {
            setPlayerHandHeight(); // Cleanup to avoid memory leaks
        };
    }, [playerTiles]);
    return (
        <div class="app-container">
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
            <div className='opponent_hand_left'></div>
            <div className='opponent_hand_right'></div>
            <div className='button' onClick={updateHands}></div>
        </div>
        </div>
    );
}