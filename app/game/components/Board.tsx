import { useEffect, useState , useRef} from 'react';

// Define the type for a tile
interface Tile {
    id: number;
    backgroundImage: string;
}
var x: number;
export default function Board() {
    // State for player's hand and opponent's hand
    const [playerTiles, setPlayerTiles] = useState<Tile[]>([]);
    const [opponentTiles, setOpponentTiles] = useState<Tile[]>([]);
    const [leftTiles, setLeftTiles] = useState<Tile[]>([]);
    const [rightTiles, setRightTiles] = useState<Tile[]>([]);
    const owndiscard = useRef<HTMLDivElement>(null);
    const oppdiscard = useRef<HTMLDivElement>(null);
    const leftdiscard = useRef<HTMLDivElement>(null);
    const rightdiscard = useRef<HTMLDivElement>(null);
    const centerboardheight = useRef<HTMLDivElement>(null);

    // Function to update hands
    const updateHands = () => {
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
        discardboardupdate()
    }, []);

    const discardboardupdate = () => {
        let own_discard_height = owndiscard.current?.offsetHeight || 0;
        let opp_discard_height = oppdiscard.current?.offsetHeight || 0;
        let left_discard_width = leftdiscard.current?.offsetWidth || 0;
        let right_discard_width = rightdiscard.current?.offsetWidth || 0;
        let centerboard_height = centerboardheight.current?.offsetHeight || 0;

        let owndiscardtransform = (centerboard_height + own_discard_height) / 2;
        let oppdiscardtransform = (centerboard_height + opp_discard_height) / 2;

        if (owndiscard.current) {
            owndiscard.current.style.transform = `translateY(${owndiscardtransform}px)`;
        }
        if (oppdiscard.current) {
            oppdiscard.current.style.transform = `translateY(-${oppdiscardtransform}px)`;
        }
        let leftdiscardtransform = (centerboard_height + left_discard_width) / 2;
        let rightdiscardtransform = (centerboard_height + right_discard_width) / 2;

        if (leftdiscard.current) {
            leftdiscard.current.style.transform = `translateX(-${leftdiscardtransform}px)`;
        }
        if (rightdiscard.current) {
            rightdiscard.current.style.transform = `translateX(${rightdiscardtransform}px)`;
        }
    };

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
            <div className="owndiscard" id="owndiscard" ref={owndiscard}>
            <div className="discardtile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            <div className="discardtile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            <div className="discardtile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            <div className="discardtile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            <div className="discardtile" style={{ backgroundImage: `url('Regular/11.png')`}}></div>
            </div>
            <div className="oppdiscard" id="oppdiscard" ref={oppdiscard}>
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
            <div className="leftdiscard" id="leftdiscard" ref={leftdiscard}>
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
            <div className="rightdiscard" id="rightdiscard" ref={rightdiscard}>
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