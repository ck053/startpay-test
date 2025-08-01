import { roomdata } from '@/app/data/game';
import { useEffect, useState , useRef} from 'react';
import { Translations } from '@/app/types/en';

// Define the type for a tile
interface Tile {
    id: number;
    value: number;
    backgroundImage: string;
}

interface ExposedTile {
    id: number;
    value: number;
    backgroundImage: string;
    style: { marginRight: '2vh' } | {};
}

interface KanTile {
    id: string;
    groupIndex: number;
    type: string;
    value: number;
    backgroundImage: string;
    marginRight: string;
    list: number[];
}

type BoardProps = {
    hand: number[];
    roomData: roomdata;
    actions: MahjongAction[];
    setHand: React.Dispatch<React.SetStateAction<number[]>>;
    setRoomData: React.Dispatch<React.SetStateAction<roomdata>>;
    setActions: React.Dispatch<React.SetStateAction<MahjongAction[]>>;
    onDiscardTile: (tileValue: number, id: number) => Promise<void>;
    handleAction: (action: MahjongAction) => Promise<void>;
    HandleAction: (value: number, type: string, list: number[]) => Promise<void>;
    centerboard: React.RefObject<HTMLDivElement>;
    playerHandRef: React.RefObject<HTMLDivElement>;
    leftHandRef: React.RefObject<HTMLDivElement>;
    rightHandRef: React.RefObject<HTMLDivElement>;
    oppHandRef: React.RefObject<HTMLDivElement>;
    owndiscard: React.RefObject<HTMLDivElement>;
    oppdiscard: React.RefObject<HTMLDivElement>;
    leftdiscard: React.RefObject<HTMLDivElement>;
    rightdiscard: React.RefObject<HTMLDivElement>;
    playerExposedRef: React.RefObject<HTMLDivElement>;
    choosetileRef: React.RefObject<HTMLDivElement>;
    kan_list: number[][];
    chi_list: number[][];
    text: Translations;
};

export type MahjongAction = 'chi' | 'pon' | 'kan' | 'ron' | 'tsumo' | 'skip' | 'end' | 'bot_end';

export default function Board({ hand, setHand, roomData, setRoomData, onDiscardTile, actions, setActions, handleAction, HandleAction, centerboard, playerHandRef, oppHandRef, leftHandRef, rightHandRef, owndiscard, oppdiscard, leftdiscard, rightdiscard, playerExposedRef, kan_list, chi_list, choosetileRef, text }: BoardProps) {
    // State for player's hand and opponent's hand
    const [playerTiles, setPlayerTiles] = useState<Tile[]>([]);
    const [opponentTiles, setOpponentTiles] = useState<Tile[]>([]);
    const [leftTiles, setLeftTiles] = useState<Tile[]>([]);
    const [rightTiles, setRightTiles] = useState<Tile[]>([]);
    const [ownDiscardTiles, setOwnDiscardTiles] = useState<Tile[]>([]);
    const [oppDiscardTiles, setOppDiscardTiles] = useState<Tile[]>([]);
    const [leftDiscardTiles, setLeftDiscardTiles] = useState<Tile[]>([]);
    const [rightDiscardTiles, setRightDiscardTiles] = useState<Tile[]>([]);
    const [kan_listTiles, setKan_listTiles] = useState<KanTile[]>([]);
    const playerlist = roomData.playerdatalist;
    const [owndiscard_list, oppdiscard_list, leftdiscard_list, rightdiscard_list] = [playerlist[0].discard, playerlist[2].discard, playerlist[3].discard, playerlist[1].discard];
    const playerExposedList = playerlist[0].exposed;
    const [playerExposedTiles, setPlayerExposedTiles] = useState<ExposedTile[]>([]);
    
    const button_area = useRef<HTMLDivElement>(null);
    // const Xbox = useRef<HTMLDivElement>(null);
    const action_text: Record<MahjongAction, string> = {
        'chi': text['chi'],
        'pon': text['pon'],
        'kan': text['kan'],
        'ron': text['ron'],
        'tsumo': text['tsumo'],
        'skip': text['skip'],
        'end': '',
        'bot_end': '',
    }

    // Function to update hands
    const updateHands = () => {
        // Generate tiles for opponent (14 tiles)
        if (roomData.playerdatalist[2].hand.length == 0){
            const generatedOpponentTiles: Tile[] = Array.from({ length: 13 }, (_, index) => ({
                id: index + 1,
                value: -1,
                backgroundImage: `url('Regular/OppBack.png')`, // Adjust the image path as needed
            }));
            setOpponentTiles(generatedOpponentTiles);
        } else {
            const generatedOpponentTiles: Tile[] = roomData.playerdatalist[2].hand.map((value, index) =>({
                id: index+1,
                value,
                backgroundImage: `url('Regular/${value+300}.png')`,
            }));
            setOpponentTiles(generatedOpponentTiles);
        }
        
        if (roomData.playerdatalist[3].hand.length == 0) {
            const generatedLeftTiles: Tile[] = Array.from({ length: 13 }, (_, index) => ({
                id: index + 1,
                value: -1,
                backgroundImage: `url('Regular/LeftBack.png')`, // Adjust the image path as needed
            }));
            setLeftTiles(generatedLeftTiles);
        } else {
            const generatedLeftTiles: Tile[] = roomData.playerdatalist[3].hand.map((value, index) =>({
                id: index+1,
                value,
                backgroundImage: `url('Regular/${value+100}.png')`,
            }));
            setLeftTiles(generatedLeftTiles);
        }

        if (roomData.playerdatalist[1].hand.length == 0) {
            const generatedRightTiles: Tile[] = Array.from({ length: 13 }, (_, index) => ({
                id: index + 1,
                value: -1,
                backgroundImage: `url('Regular/RightBack.png')`, // Adjust the image path as needed
            }));
            setRightTiles(generatedRightTiles);
        } else {
            const generatedRightTiles: Tile[] = roomData.playerdatalist[1].hand.map((value, index) =>({
                id: index+1,
                value,
                backgroundImage: `url('Regular/${value+200}.png')`,
            }));
            setRightTiles(generatedRightTiles);
        }
        // Update state with new tiles
    };

    // Function to handle discard
    const HandleDiscard = async (value: number, id: number) => {
        //check tile's availability
        if (!hand.includes(value)) {
            return;
        }
        //send request to server
        await onDiscardTile(value, id);
    }

    // Call updateHands on component mount or whenever needed
    useEffect(() => {
        updateHands(); // Call this function to initialize the hands
        discardboardupdate();
    }, []);



    useEffect(() => {
        const newTiles = hand.map((tileValue, index) => ({
          id: index+1, // Use the tile value as ID (or generate a unique one)
          value: tileValue,
          backgroundImage: `url('Regular/${tileValue+1000}.png')`,
        }));
        setPlayerTiles(newTiles);
      }, [hand]);
    
    useEffect(() => {
        const tiles: ExposedTile[] = [];
        let idCounter = 1;
        const reversed_list = playerExposedList.reverse();
        reversed_list.forEach((group, groupIndex) => {
            group.forEach((value, tileIndexInGroup) => {
                const isLastInGroup = tileIndexInGroup === group.length - 1;
            
                tiles.push({
                    id: idCounter++,
                    value,
                    backgroundImage: `url('Regular/${value+2000}.png')`,
                    // Apply margin to the last tile in each group
                    style: isLastInGroup ? { marginRight: '2vh' } : {},
                });
            });
        });
        setPlayerExposedTiles(tiles);
    }, [playerExposedList])

    useEffect(()=> {
        const new_owndiscard = owndiscard_list.map((value, index) =>({
            id: index+1,
            value,
            backgroundImage: `url('Regular/${value}.png')`,
        }));
        const new_oppdiscard = oppdiscard_list.map((value, index) =>({
            id: index+1,
            value,
            backgroundImage: `url('Regular/${value+300}.png')`,
        }));
        const new_leftdiscard = leftdiscard_list.map((value, index) =>({
            id: index+1,
            value,
            backgroundImage: `url('Regular/${value+100}.png')`,
        }));
        const new_rightdiscard = rightdiscard_list.map((value, index) =>({
            id: index+1,
            value,
            backgroundImage: `url('Regular/${value+200}.png')`,
        }));
        setOwnDiscardTiles(new_owndiscard);
        setOppDiscardTiles(new_oppdiscard);
        setLeftDiscardTiles(new_leftdiscard);
        setRightDiscardTiles(new_rightdiscard);
    }, [owndiscard_list, oppdiscard_list, leftdiscard_list, rightdiscard_list]);

    useEffect(() => {
        discardboardupdate();
        updateHands();
    },[roomData]);

    useEffect(() => {
        discardboardupdate();
    }, [ownDiscardTiles, oppDiscardTiles, leftDiscardTiles, rightDiscardTiles]);

    useEffect(() => {
        updateKanTiles(kan_list);
    }, [kan_list]);

    useEffect(() => {
        updateChiTiles(chi_list);
    }, [chi_list]);

    useEffect(() => {
        if (!button_area.current) return;
        //update buttons
        // Clear all existing buttons
        button_area.current.innerHTML = '';

        // If no actions, just return
        if (actions.length === 0) return;

        // Create buttons for each action
        actions.forEach((action) => {
            const button = document.createElement('button');
            button.className = 'action-button'; 
            button.id = `${action}-button`;
            button.textContent = action_text[action];
        
            // Add click handler
            button.onclick = () => handleAction(action);
            
            button_area.current?.appendChild(button);
        });

        // Add skip button at the end
        const skipButton = document.createElement('button');
        skipButton.className = 'action-button';
        skipButton.id = 'skip-button';
        skipButton.textContent = action_text.skip;
        skipButton.onclick = () => handleAction('skip');
        button_area.current?.appendChild(skipButton);
    }, [actions])

    const discardboardupdate = () => {
        let own_discard_height = owndiscard.current?.offsetHeight || 0;
        let opp_discard_height = oppdiscard.current?.offsetHeight || 0;
        let left_discard_width = leftdiscard.current?.offsetWidth || 0;
        let right_discard_width = rightdiscard.current?.offsetWidth || 0;
        let centerboard_height = centerboard.current?.offsetHeight || 0;

        let up = centerboard_height / 4.8; 
        let owndiscardtransform = (centerboard_height + own_discard_height) / 2 - up;
        let oppdiscardtransform = (centerboard_height + opp_discard_height) / 2 + up;

        if (owndiscard.current) {
            owndiscard.current.style.transform = `translateY(${owndiscardtransform}px)`;
        }
        if (oppdiscard.current) {
            oppdiscard.current.style.transform = `translateY(-${oppdiscardtransform}px)`;
        }
        let leftdiscardtransform = (centerboard_height + left_discard_width) / 2;
        let rightdiscardtransform = (centerboard_height + right_discard_width) / 2;

        if (leftdiscard.current) {
            leftdiscard.current.style.transform = `translateX(-${leftdiscardtransform}px) translateY(-${up}px)`;
        }
        if (rightdiscard.current) {
            rightdiscard.current.style.transform = `translateX(${rightdiscardtransform}px) translateY(-${up}px)`;
        }
        if (centerboard.current) {
            centerboard.current.style.transform = `translateY(-${up}px)`;
        }
        //if (Xbox.current) {
        //    Xbox.current.style.transform = `translateY(-${up}px)`;
        //}
    };

    const Close_Choose = () => {
        if (choosetileRef.current){
            choosetileRef.current.style.display = 'none';
          }
    }

    // create choose tile button
    const updateKanTiles = (kan_list: number[][]) => {
        const newTiles = kan_list.flatMap((tileGroup, groupIndex) => {
          const shouldAddMargin = groupIndex < kan_list.length - 1;
          
          return tileGroup.map((tileValue, tileIndex) => ({
            id: `${groupIndex}-${tileIndex}`, // Unique ID
            groupIndex,
            type: 'kan',
            value: tileValue,
            backgroundImage: `url('Regular/${tileValue}.png')`,
            marginRight: (tileIndex === tileGroup.length - 1 && shouldAddMargin) ? '2vh' : '0',
            list: []
          }));
        });
      
        setKan_listTiles(newTiles);
    };

    // create choose tile button
    const updateChiTiles = (list: number[][]) => {
        const newTiles = list.flatMap((tileGroup, groupIndex) => {
          const shouldAddMargin = groupIndex < list.length - 1;
          
          return tileGroup.map((tileValue, tileIndex) => ({
            id: `${groupIndex}-${tileIndex}`, // Unique ID
            groupIndex,
            type: 'chi',
            value: tileValue,
            backgroundImage: `url('Regular/${tileValue}.png')`,
            marginRight: (tileIndex === tileGroup.length - 1 && shouldAddMargin) ? '2vh' : '0',
            list: list[groupIndex]
          }));
        });
        setKan_listTiles(newTiles);
      };

    return (
        <div className="gameboard">
            {//<div className="x-box" ref={Xbox}></div>
            }
            <div className="choosing_tile" ref={choosetileRef}>
                {kan_listTiles.map((tile) => (
                    <div
                        key={tile.id}
                        data-tile-groupindex={tile.groupIndex}
                        className="tile"
                        style={{
                            backgroundImage: tile.backgroundImage,
                            marginRight: tile.marginRight,
                        }}
                        onClick={() => HandleAction(tile.value, tile.type, tile.list)}
                    />
                    ))}
                <button className="close_button" onClick={Close_Choose}> X </button>
            </div>
            <div className='button-area' ref={button_area}></div>
            <div className="playerexposed" id="player-exposed" ref={playerExposedRef}>
                {playerExposedTiles.map(tile => (
                    <div 
                        key={tile.id}
                        style={{ backgroundImage: tile.backgroundImage, ...tile.style }} 
                        className="exposed_tile"
                    ></div>
                ))}
            </div>
            <div className='playerhand' ref={playerHandRef}>
                {playerTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        data-tile-id={tile.id}
                        style={{ backgroundImage: tile.backgroundImage }} 
                        className="large_tile"
                        onClick={() => HandleDiscard(tile.value, tile.id)}
                    ></div>
                ))}
            </div>
            <div className="opphand" ref={oppHandRef}>
                {opponentTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        style={{ backgroundImage: tile.backgroundImage }} 
                        className="tile"
                    ></div>
                ))}
            </div>
            <div className='lefthand' ref={leftHandRef}>
                {leftTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        style={{ backgroundImage: tile.backgroundImage }} 
                        className="turned_tile"
                    ></div>
                ))}
            </div>
            <div className='righthand' ref={rightHandRef}>
                {rightTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        style={{ backgroundImage: tile.backgroundImage }} 
                        className="turned_tile"
                    ></div>
                ))}
            </div>
            <div className="centerboard" id="centerboard" ref={centerboard}></div>
            <div className="owndiscard" id="owndiscard" ref={owndiscard}>
                {ownDiscardTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        className="discardtile" 
                        style={{ backgroundImage: tile.backgroundImage }}
                    ></div>
                ))}
            </div>
            <div className="oppdiscard" id="oppdiscard" ref={oppdiscard}>
                {oppDiscardTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        className="opp_discardtile" 
                        style={{ backgroundImage: tile.backgroundImage }}
                    ></div>
                ))}
            </div>
            <div className="leftdiscard" id="leftdiscard" ref={leftdiscard}>
                {leftDiscardTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        className="left_discardtile" 
                        style={{ backgroundImage: tile.backgroundImage }}
                    ></div>
                ))}
            </div>
            <div className="rightdiscard" id="rightdiscard" ref={rightdiscard}>
                {rightDiscardTiles.map(tile => (
                    <div 
                        key={tile.id} 
                        className="right_discardtile" 
                        style={{ backgroundImage: tile.backgroundImage }}
                    ></div>
                ))}
            </div>
        </div>
    );
}