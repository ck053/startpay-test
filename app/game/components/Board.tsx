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
    const [leftTiles, setLeftTiles] = useState<Tile[]>([]);
    const [rightTiles, setRightTiles] = useState<Tile[]>([]);
    const playerHandRef = useRef<HTMLDivElement>(null); // Create a ref for player hand

    // Function to update hands
    const updateHands = () => {
        x += 1;
        // Generate tiles for player (14 tiles)
        const generatedPlayerTiles: Tile[] = Array.from({ length: 10 }, (_, index) => ({
            id: index + 1,
            backgroundImage: `url('Regular/11.png')`, // Adjust the image path as needed
        }));

        // Generate tiles for opponent (14 tiles)
        const generatedOpponentTiles: Tile[] = Array.from({ length: 13 }, (_, index) => ({
            id: index + 1,
            backgroundImage: `url('Regular/OppBack.png')`, // Adjust the image path as needed
        }));

        const generatedLeftTiles: Tile[] = Array.from({ length: 13 }, (_, index) => ({
            id: index + 1,
            backgroundImage: `url('Regular/LeftBack.png')`, // Adjust the image path as needed
        }))
        
        const generatedRightTiles: Tile[] = Array.from({ length: 13 }, (_, index) => ({
            id: index + 1,
            backgroundImage: `url('Regular/RightBack.png')`, // Adjust the image path as needed
        }));

        // Update state with new tiles
        setPlayerTiles(generatedPlayerTiles);
        setOpponentTiles(generatedOpponentTiles);
        setLeftTiles(generatedLeftTiles);
        setRightTiles(generatedRightTiles);
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
        <div className="gameboard">
            <div className="playerexposed" id="player-exposed">
            <div className="tile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            <div className="tile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            <div className="tile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            </div>
            <div className='playerhand'>
                {playerTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        style={{ backgroundImage: tile.backgroundImage }} 
                        className="tile"
                    ></div>
                ))}
            </div>
            <div className="opphand">
                {opponentTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        style={{ backgroundImage: tile.backgroundImage }} 
                        className="tile"
                    ></div>
                ))}
            </div>
            <div className='lefthand'>
                {leftTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        style={{ backgroundImage: tile.backgroundImage }} 
                        className="turned_tile"
                    ></div>
                ))}
            </div>
            <div className='righthand'>
                {rightTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        style={{ backgroundImage: tile.backgroundImage }} 
                        className="turned_tile"
                    ></div>
                ))}
            </div>
            <div className="centreboard" id="centerboard"></div>
            <div className="owndiscard" id="owndiscard">
            <div className="discardtile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            <div className="discardtile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            <div className="discardtile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            <div className="discardtile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            <div className="discardtile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            </div>
            <div className="oppdiscard" id="oppdiscard">
            <div className="opp_discardtile" style={{ backgroundImage: `url('Regular/311.png')`}}></div>
            <div className="opp_discardtile" style={{ backgroundImage: `url('Regular/311.png')`}}></div>
            <div className="opp_discardtile" style={{ backgroundImage: `url('Regular/311.png')`}}></div>
            <div className="opp_discardtile" style={{ backgroundImage: `url('Regular/311.png')`}}></div>
            <div className="opp_discardtile" style={{ backgroundImage: `url('Regular/311.png')`}}></div>
            <div className="opp_discardtile" style={{ backgroundImage: `url('Regular/311.png')`}}></div>
            <div className="opp_discardtile" style={{ backgroundImage: `url('Regular/311.png')`}}></div>
            <div className="opp_discardtile" style={{ backgroundImage: `url('Regular/311.png')`}}></div>
            <div className="opp_discardtile" style={{ backgroundImage: `url('Regular/311.png')`}}></div>
            </div>
            <div className="leftdiscard" id="leftdiscard">
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            <div className="left_discardtile" style={{ backgroundImage: `url('Regular/111.png')`}}></div>
            </div>
            <div className="rightdiscard" id="rightdiscard">
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            <div className="right_discardtile" style={{ backgroundImage: `url('Regular/211.png')`}}></div>
            </div>
            </div>
    );
}