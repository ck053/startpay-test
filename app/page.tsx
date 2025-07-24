'use client';

import { useEffect, useState, useRef} from 'react';
// Import components
import LoadingState from '@/app/components/LoadingState';
import ErrorState from '@/app/components/ErrorState';
import ShowBalance from '@/app/components/ShowBalance';
import Board from './game/components/Board';
import '@/app/game/game.css';
import { roomdata, sorthand, replay_record, getPossibleKan, checkchi } from './data/game';
import { MahjongAction } from './game/components/Board'
import { NextResponse } from 'next/server';
import { gsap } from 'gsap';

export default function Home() {
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [userid, setUserId] = useState<string>('');
  const [hand, setHand] = useState<number[]>([]);
  const [roomData, setRoomData] = useState<roomdata>(
    {
      current_player: -1,
      cards_remain: -1,
      last_discard: -1,
      wall: [],
      playerdatalist: [
        {
          position: 0,
          exposed: [],
          last_drawn:-1,
          discard:[],
          name: '',
          hand: []
        },
        {
          position: 1,
          exposed: [],
          last_drawn:-1,
          discard:[],
          name: '',
          hand: []
        },
        {
          position: 2,
          exposed: [],
          last_drawn:-1,
          discard:[],
          name: '',
          hand: []
        },
        {
          position: 3,
          exposed: [],
          last_drawn:-1,
          discard:[],
          name: '',
          hand: []
        }
      ],
      stars: 0,
      listen: false
    }
  );
  const [roomId, setRoomId] = useState<string>('');
  const [actions, setActions] = useState<MahjongAction[]>([]);
  const [balance, setBalance] = useState<number>(-1);
  const [starsCount, setStarsCount] = useState(1);
  const [kan_list, setKan_list] = useState<number[][]>([]);
  const [chi_list, setChi_list] = useState<number[][]>([]);
  const centerboard = useRef<HTMLDivElement>(null);
  const playerHandRef = useRef<HTMLDivElement>(null);
  const leftHandRef = useRef<HTMLDivElement>(null);
  const rightHandRef = useRef<HTMLDivElement>(null);
  const oppHandRef = useRef<HTMLDivElement>(null);
  const owndiscard = useRef<HTMLDivElement>(null);
  const oppdiscard = useRef<HTMLDivElement>(null);
  const leftdiscard = useRef<HTMLDivElement>(null);
  const rightdiscard = useRef<HTMLDivElement>(null);
  const playerExposedRef = useRef<HTMLDivElement>(null);
  const choosetileRef = useRef<HTMLDivElement>(null);

  const fetchBalance = async (userid: string) => {
    try {
      const response = await fetch('/api/get-balance', {
        method: 'POST',
        body: userid
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      } else {
        console.log(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      console.log('Network error');
    } 
  };

  useEffect(() => {
    // Import TWA SDK dynamically to avoid SSR issues
    const initTelegram = async () => {
      try {
        // Dynamic import of the TWA SDK
        const WebApp = (await import('@twa-dev/sdk')).default;
        
        // Check if running within Telegram
        const isTelegram = WebApp.isExpanded !== undefined;
        
        if (isTelegram) {
          // Initialize Telegram Web App
          WebApp.ready();
          WebApp.expand();
          
          // Get user ID from initData
          if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
            // Access user data directly from the WebApp object
            const user = WebApp.initDataUnsafe.user;
            setUserId(user.id?.toString() || '');
            await fetchBalance(user.id?.toString());
            const userName = user.first_name || '';
            const userLastName = user.last_name || '';
            setUsername(`${userName}${userLastName ? ' ' + userLastName : ''}`);
          } else {
            setError('No user data available from Telegram');
            setIsLoading(false);
          }
        } else {
          // Not in Telegram, set an error message
          setError('This application can only be accessed from within Telegram');
          setIsLoading(false);
        }

        setInitialized(true);
        setIsLoading(false);
      } catch (e) {
        console.error('Failed to initialize Telegram Web App:', e);
        setError('Failed to initialize Telegram Web App');
        setInitialized(true);
        setIsLoading(false);
      }
    };

    

    initTelegram();
  }, []);

  // Handle retry on error
  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (!initialized || isLoading) {
    return <LoadingState />;
  }

  // Error state (including not in Telegram)
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  function navigateTo(path: string) {
    // Hide all pages
    document.querySelectorAll<HTMLElement>('.page').forEach(page => {
      page.style.display = 'none';
    });
    
    // Show the requested page
    const element = document.getElementById(path);
    if (element) {
      element.style.display = 'block';
    }
    // Update browser history (optional)
    history.pushState({}, '', `#${path}`);
  }
  
  // Initialize - show home page by default
  window.addEventListener('DOMContentLoaded', () => {
    navigateTo('home');
    
    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
      const path = window.location.hash.substring(1) || 'home';
      navigateTo(path);
    });
  });

  // Handle start game request
  const handleStartGame = async (path: string) => {
    try {
        const response = await fetch('/api/createRoom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userid, starsCount })
        });

        if (!response.ok) {
            throw new Error('Failed to create room');
        }

        // get roomdata
        const { roomId, roomData } = await response.json();
        setRoomId(roomId);

        // show game page
        await navigateTo(path);
        
        // update player hand
        setHand([...roomData.playerdatalist[0].hand]);

        // ask for first tile
        const ready = await fetch( '/api/deal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userid, roomId}),
        });

        if (!ready.ok) {
          throw new Error ('Server not ready');
        }

        const { action, new_tile } = await ready.json();
        console.log('New tile:', new_tile);

        // update player hand
        roomData.playerdatalist[0].hand.push(new_tile);
        setRoomData(roomData);
        setHand([...roomData.playerdatalist[0].hand]);
        // handle button
        setActions(action);

    } catch (error) {
        console.error('Error creating room:', error);
    }
};

  const getoppCoordinates = (element: HTMLElement): { x: number; y: number; width: number; height: number } => {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
    };
  };

  const getcenterCoordinates = (element: HTMLElement): { x: number; y: number } => {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
  };
  
  async function animateAction(action: replay_record, temp_hand: number[], id: number): Promise<void> {
    if(action.action == 'draw'){
        if (!centerboard.current) return;
            const { x: centerX, y: centerY } = getcenterCoordinates(centerboard.current);
        switch (action.player) {
          case 1:
            if (!rightHandRef.current) return;
            const { x: RightX, y: RightY, width: RightW, height:RightH } = getoppCoordinates(rightHandRef.current);
            const RightstartX = centerX - RightX - RightW / 2 / 4 * 3;
            const RightstartY = centerY - RightY - RightW / 2;
            const RighttileElement = document.createElement('div');
            RighttileElement.style.backgroundImage = `url('Regular/RightBack.png')`;
            // hanle start position
            RighttileElement.style.setProperty('--start-x', `${RightstartX}px`);
            RighttileElement.style.setProperty('--start-y', `${RightstartY}px`);
            RighttileElement.className = 'tile-animate turned_tile';
            RighttileElement.id = 'HandtoRemove';
            rightHandRef.current?.appendChild(RighttileElement);
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
          case 2:
            if (!oppHandRef.current) return;
            const { x: OppX, y: OppY, width: OppW, height:OppH } = getoppCoordinates(oppHandRef.current);
            const OppstartX = centerX - OppX - OppH / 2 / 4 * 3;
            const OppstartY = centerY - OppY - OppH / 2;
            const OpptileElement = document.createElement('div');
            OpptileElement.style.backgroundImage = `url('Regular/OppBack.png')`;
            // hanle start position
            OpptileElement.style.setProperty('--start-x', `${OppstartX}px`);
            OpptileElement.style.setProperty('--start-y', `${OppstartY}px`);
            OpptileElement.className = 'tile-animate tile';
            OpptileElement.id = 'HandtoRemove';
            oppHandRef.current?.appendChild(OpptileElement);
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
          case 3:
            if (!leftHandRef.current) return;
            const { x: LeftX, y: LeftY, width: LeftW, height:LeftH } = getoppCoordinates(leftHandRef.current);
            const LeftstartX = centerX - LeftX - LeftW / 2 / 4 * 3;
            const LeftstartY = centerY - LeftY - LeftW / 2 - LeftW / 4 * 3 * 13;
            const LefttileElement = document.createElement('div');
            LefttileElement.style.backgroundImage = `url('Regular/LeftBack.png')`;
            // hanle start position
            LefttileElement.style.setProperty('--start-x', `${LeftstartX}px`);
            LefttileElement.style.setProperty('--start-y', `${LeftstartY}px`);
            LefttileElement.className = 'tile-animate turned_tile';
            LefttileElement.id = 'HandtoRemove';
            leftHandRef.current?.appendChild(LefttileElement);
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
          }
        } else if (action.action == 'discard') {
          switch (action.player) {
            case 0:
              // locate the tile
              const play_tile = playerHandRef.current?.querySelector(`[data-tile-id="${id}"]`) as HTMLElement;
              if (!play_tile) return;
              // get tile coordinate
              const { x: play_tile_X, y: play_tile_Y, width: play_tile_width, height: play_tile_height} = getoppCoordinates(play_tile);
              // add an invisible tile
              const tempdiscardtile = document.createElement('div');
              tempdiscardtile.className = 'discardtile';
              tempdiscardtile.style.backgroundImage = `url('Regular/Back.png')`;
              tempdiscardtile.style.visibility = 'hidden';
              owndiscard.current?.appendChild(tempdiscardtile);
              // get target coordinate
              const { x: target_X, y: target_Y, width: target_width, height: target_height } = getoppCoordinates(tempdiscardtile);
              // calculate the starting position
              const OwnstartX = play_tile_X - target_X - target_width / 2;
              const OwnstartY = play_tile_Y - target_Y - target_height / 2;
              // remove the tile
              setHand([...temp_hand]);
              tempdiscardtile.remove();
              // add the tile
              const OwntileElement = document.createElement('div');
              OwntileElement.style.backgroundImage = `url('Regular/${action.value}.png')`;
              OwntileElement.style.setProperty('--start-x', `${OwnstartX}px`);
              OwntileElement.style.setProperty('--start-y', `${OwnstartY}px`);
              OwntileElement.className = 'tile-animate discardtile';
              OwntileElement.id = 'HandtoRemove';
              owndiscard.current?.appendChild(OwntileElement);
              await new Promise(resolve => setTimeout(resolve, 500));
              break;
            case 1:
              if (!rightHandRef.current) return;
              const { x: RightHandX, y: RightHandY, width: RightHandW, height:RightHandH } = getoppCoordinates(rightHandRef.current);
              if (!rightdiscard.current) return;
              const { x: RightDiscardX, y: RightDiscardY, width: RightDiscardW, height:RightDiscardH } = getoppCoordinates(rightdiscard.current);
              const RighttileElement = document.createElement('div');
              const RightstartX = RightHandX - RightDiscardX - RightDiscardH / 2 / 4 * 3; 
              const RightstartY = RightHandY - RightDiscardY - RightDiscardH / 2;
              RighttileElement.style.backgroundImage = `url('Regular/${action.value+200}.png')`;
              RighttileElement.style.setProperty('--start-x', `${RightstartX}px`);
              RighttileElement.style.setProperty('--start-y', `${RightstartY}px`);
              RighttileElement.className = 'tile-animate right_discardtile';
              RighttileElement.id = 'HandtoRemove';
              rightHandRef.current?.querySelector('#HandtoRemove')?.remove();
              rightdiscard.current?.appendChild(RighttileElement);
              await new Promise(resolve => setTimeout(resolve, 500));
              break;
            case 2:
              if (!oppHandRef.current) return;
              const { x: OppHandX, y: OppHandY, width: OppHandW, height:OppHandH } = getoppCoordinates(oppHandRef.current);
              if (!oppdiscard.current) return;
              const { x: OppDiscardX, y: OppDiscardY, width: OppDiscardW, height:OppDiscardH } = getoppCoordinates(oppdiscard.current);
              const OpptileElement = document.createElement('div');
              const OppstartX = OppHandX - OppDiscardX - OppDiscardH / 2 / 4 * 3; 
              const OppstartY = OppHandY - OppDiscardY - OppDiscardH / 2;
              OpptileElement.style.backgroundImage = `url('Regular/${action.value+300}.png')`;
              OpptileElement.style.setProperty('--start-x', `${OppstartX}px`);
              OpptileElement.style.setProperty('--start-y', `${OppstartY}px`);
              OpptileElement.className = 'tile-animate opp_discardtile';
              OpptileElement.id = 'HandtoRemove';
              oppHandRef.current?.querySelector('#HandtoRemove')?.remove();
              oppdiscard.current?.appendChild(OpptileElement);
              await new Promise(resolve => setTimeout(resolve, 500));
              break;
            case 3:
              if (!leftHandRef.current) return;
              const { x: LeftHandX, y: LeftHandY, width: LeftHandW, height:LeftHandH } = getoppCoordinates(leftHandRef.current);
              if (!leftdiscard.current) return;
              const { x: LeftDiscardX, y: LeftDiscardY, width: LeftDiscardW, height:LeftDiscardH } = getoppCoordinates(leftdiscard.current);
              const LefttileElement = document.createElement('div');
              const LeftstartX = LeftHandX - LeftDiscardX - LeftDiscardH / 2 / 4 * 3;
              const LeftstartY = LeftHandY + LeftDiscardY - LeftDiscardH / 2;
              LefttileElement.style.backgroundImage = `url('Regular/${action.value+100}.png')`;
              LefttileElement.style.setProperty('--start-x', `${LeftstartX}px`);
              LefttileElement.style.setProperty('--start-y', `${LeftstartY}px`);
              LefttileElement.className = 'tile-animate left_discardtile';
              LefttileElement.id = 'HandtoRemove';
              leftHandRef.current?.querySelector('#HandtoRemove')?.remove();
              leftdiscard.current?.appendChild(LefttileElement);
              await new Promise(resolve => setTimeout(resolve, 500));
              break;
            }
        } else console.warn(`Unknown action: ${action.action}`);
  }
  async function animateAllActions(replay: replay_record[], temp_hand: number[], id: number) {
    for (const action of replay) {
      await animateAction(action, temp_hand, id); // Wait for each animation to finish
    }
    console.log("All animations completed!");
  }

  // Handle discard
  const handleDiscardTile = async (tile: number, id: number, skip: boolean = false) => {
    // disable the choose UI
    if (choosetileRef.current){
      choosetileRef.current.style.display = 'none';
    }
    // send request to server
      const response = await fetch( '/api/discard', {
        method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tile, roomId, userid , skip}),
      });
      if (!response.ok) {console.log("Server rejected discard"); return;}
      setActions([]);
      // run animation by replay
      const { roomdata, action: discard_action, replay} = await response.json()
      if (!skip) replay.unshift({action: 'discard', value: tile, player: 0});
      console.log('Replay:', replay);
      const hand_played = [...roomdata.playerdatalist[0].hand];
      await animateAllActions(replay, hand_played, id);
      if (discard_action.includes('end')) {
        // trigger end game
        console.log("end triggered")
        // navigateTo('game_over')
        fetchBalance(userid);
        await navigateTo('game_over');
        return;
      }
      // update player hand & discard
        setRoomData(roomdata);
        const player = roomdata.playerdatalist[0];
        player.hand = sorthand(player.hand);
        while (document.querySelector('#HandtoRemove')){
          document.querySelector('#HandtoRemove')?.remove();
        }
        setHand([...player.hand]);
      // update button if out-turn action available
      if (discard_action.length > 0) {
        // update actions
        setActions(discard_action);
      }
      // Ask for a draw if it's player's turn
      if (roomdata.current_player == 0) {
        console.log("Asking for deal:", roomData);
        const ready = await fetch( '/api/deal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userid, roomId}),
        });
  
        if (!ready.ok) {
          throw new Error ('Server not ready');
        }
  
        const { action:draw_action , new_tile } = await ready.json();
        if (draw_action.includes('end')) {
          // trigger end game
          console.log("end triggered")
          // navigateTo('game_over')
          fetchBalance(userid);
          await navigateTo('game_over');
          return;
        }
        
        // update roomdata
        setRoomData(roomdata);
        // update player hand
        player.hand.push(new_tile);
        console.log("new player hand:", player.hand)
        setHand([...player.hand]);
        // update actions
        setActions(draw_action);
      }
      
  };

  const handleAction = async (action: MahjongAction) => {
    try {
      switch(action){
        case 'chi':
          // get possible chi list
          const chi_list = checkchi(roomData.playerdatalist[0].hand, roomData.last_discard);
          if (chi_list.length > 1) {
            setChi_list(chi_list);
            if (choosetileRef.current){
              choosetileRef.current.style.display = 'flex';
            }
            return;
          } else if (chi_list.length == 1) {
            if (choosetileRef.current){
              choosetileRef.current.style.display = 'none';
            }
            const chi_response = await fetch( '/api/claim-chi', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({userid, roomId, list: chi_list[0]})
            });
            if (!chi_response.ok) { console.log("Server rejected chi"); return; }
            // bring choosing UI if > 1 combination
            // update data & screen
            const { roomdata } = await chi_response.json();
            setRoomData(roomdata);
            setHand([...roomdata.playerdatalist[0].hand]);
            // remove button
            setActions([]);
            return;
          } return;
        case 'pon':
          const pon_response = await fetch( '/api/claim-pon', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({userid, roomId}),
          });
          if (!pon_response.ok) { console.log("Server rejected pon"); return; }
          // update data & screen
          const { roomdata } = await pon_response.json();
          setRoomData(roomdata);
          setHand([...roomdata.playerdatalist[0].hand]);
          // remove button
          setActions([]);
          return;
        case 'kan':
          if (roomData.current_player !== 0) {
            // open kan
            const kan_response = await fetch( '/api/claim-kan', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({userid, roomId, tile: -1}),
            });
            if (!kan_response.ok) { console.log("Server rejected kan"); return; }
            // update data & screen
            const { roomdata } = await kan_response.json();
            setRoomData(roomdata);
            setHand([...roomdata.playerdatalist[0].hand]);
            // remove button
            setActions([]);
            // Ask for a draw
            const ready = await fetch( '/api/deal', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({userid, roomId}),
            });
            if (!ready.ok) {
              throw new Error ('Server not ready');
            }
            const { action:draw_action , new_tile } = await ready.json();
            // update roomdata
            setRoomData(roomdata);
            roomdata.playerdatalist[0].hand.push(new_tile);
            setHand([...roomdata.playerdatalist[0].hand]);
            // update actions
            setActions(draw_action);
            return;
            } else {
              // add kan or closed kan
              // get possible kan
              const kan_list = getPossibleKan(roomData.playerdatalist[0].hand, roomData.playerdatalist[0].exposed);
              // create button with kan list
              if (kan_list.length > 1) {
                setKan_list(kan_list);
                if (choosetileRef.current){
                  choosetileRef.current.style.display = 'flex';
                }
                return;
              } else {
                const kan_response = await fetch( '/api/claim-kan', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({userid, roomId, tile: kan_list[0][0]}),
                });
                if (!kan_response.ok) { console.log("Server rejected kan"); return; }
                // update data & screen
                const { roomdata } = await kan_response.json();
                setRoomData(roomdata);
                setHand([...roomdata.playerdatalist[0].hand]);
                // remove button
                setActions([]);
                // Ask for a draw
                const ready = await fetch( '/api/deal', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({userid, roomId}),
                });
                if (!ready.ok) {
                  throw new Error ('Server not ready');
                }
                const { action:draw_action , new_tile } = await ready.json();
                // update roomdata
                setRoomData(roomdata);
                roomdata.playerdatalist[0].hand.push(new_tile);
                setHand([...roomdata.playerdatalist[0].hand]);
                // update actions
                setActions(draw_action);
              }
            }
          return;
        case 'ron':
          // confirm the win
          const ron_response = await fetch( '/api/claim-ron', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({userid, roomId}),
          });
          if (!ron_response.ok) { console.log("Server rejected ron"); return; }
          fetchBalance(userid);
          navigateTo('win');
          return;
        case 'tsumo':
          // confirm the win
          const tsumo_response = await fetch( '/api/claim-tsumo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({userid, roomId}),
          });
          if (!tsumo_response.ok) { console.log("Server rejected tsumo"); return; }
          fetchBalance(userid);
          navigateTo('win');
          return;
        case 'skip':
          // send skip action to server
          setActions([]);
          if (roomData.current_player !== 0) handleDiscardTile(-1, -1, true);

          return;
      }
    } catch(error) {
      console.error('Error handling action:', error);
      return;
    }
    
  }

  const HandleAction = async (value: number, type: string, list: number[]) => {
    try{
    // kan
      if (type == 'kan') {
        const kan_response = await fetch( '/api/claim-kan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userid, roomId, tile: value}),
        });
        if (!kan_response.ok) { console.log("Server rejected kan"); return; }
        // update data & screen
        const { roomdata } = await kan_response.json();
        setRoomData(roomdata);
        setHand([...roomdata.playerdatalist[0].hand]);
        // remove button
        if (choosetileRef.current){
          choosetileRef.current.style.display = 'none';
        }
        setActions([]);
        // Ask for a draw
        const ready = await fetch( '/api/deal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userid, roomId}),
        });
        if (!ready.ok) {
          throw new Error ('Server not ready');
        }
        const { action:draw_action , new_tile } = await ready.json();
        // update roomdata
        setRoomData(roomdata);
        roomdata.playerdatalist[0].hand.push(new_tile);
        setHand([...roomdata.playerdatalist[0].hand]);
        // update actions
        setActions(draw_action);
        return;
      } else if (type == 'chi') {
        if (choosetileRef.current){
          choosetileRef.current.style.display = 'none';
        }
        const chi_response = await fetch( '/api/claim-chi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userid, roomId, list})
        });
        if (!chi_response.ok) { console.log("Server rejected chi"); return; }
        // update data & screen
        const { roomdata } = await chi_response.json();
        setRoomData(roomdata);
        setHand([...roomdata.playerdatalist[0].hand]);
        // remove button
        setActions([]);
        return;
      } else {
        return;
      }
    } catch(error) {
      console.error('Error Handling chosen kan/pon:', error);
      return;
    }
  }
  // Main app UI

  const adjuststars = (value: number) => {
    if ((starsCount + value) >= 0) {
      setStarsCount(prevCount => prevCount + value);
    }
  };

  return (
    <div className="">
      <div id='home' className='page' style={{zIndex: '1'}}>
        <ShowBalance balance={balance}/>
        <h1>Hi {username}!</h1>
        <h1>Welcome to Our Site</h1>
        <div className="stars-selector">
          <span className="stars-label"> Stars to play: </span>
          <button className="stars-button minus" id="decreaseStars" onClick={() => adjuststars(-1)}>-</button>
          <span className="stars-count" id="starsCount" > {starsCount} ⭐</span>
          <button className="stars-button plus" id="increaseStars" onClick={() => adjuststars(1)}>+</button>
        </div>
        <button onClick={() => handleStartGame('game') } className='button'>
          Go to Game Page
        </button>
      </div>
      <div id='game' className='page' style={{display: 'none', zIndex: '0'}}>
        <Board 
          hand={hand} 
          setHand={setHand}
          roomData={roomData}
          setRoomData={setRoomData} 
          onDiscardTile={handleDiscardTile}
          handleAction = {handleAction}
          HandleAction={HandleAction}
          actions={actions}
          setActions={setActions}
          // @ts-ignore
          centerboard={centerboard}
          // @ts-ignore
          playerHandRef={playerHandRef}
          // @ts-ignore
          leftHandRef={leftHandRef}
          // @ts-ignore
          rightHandRef={rightHandRef}
          // @ts-ignore
          oppHandRef={oppHandRef}
          // @ts-ignore
          owndiscard={owndiscard}
          // @ts-ignore
          oppdiscard={oppdiscard}
          // @ts-ignore
          leftdiscard={leftdiscard}
          // @ts-ignore
          rightdiscard={rightdiscard}
          // @ts-ignore
          choosetileRef={choosetileRef}
          kan_list={kan_list}
          chi_list={chi_list}
          />
      </div>
      <div id='game_over' className='page' style={{display: 'none', zIndex: '0'}}>
        <h1> Game Over </h1>
        <button onClick={() => handleStartGame('game')} className='button'>
          Play Again
        </button>
        <button onClick={() => navigateTo('home')} className='button'>
          Go Home
        </button>
      </div>
      <div id='win' className='page' style={{display: 'none', zIndex: '0'}}>
        <h1> You Win! </h1>
        <button onClick={() => handleStartGame('game')} className='button'>
          Play Again
        </button>
        <button onClick={() => navigateTo('home')} className='button'>
          Go Home
        </button>
      </div>
    </div>
  );
}
