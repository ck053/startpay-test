import { NextRequest, NextResponse } from "next/server";
import { initializeRoomData } from "@/app/data/game";
import { useImperativeHandle } from "react";

// @ts-ignore
if (!global.roomDatalist) {
    // @ts-ignore
    global.roomDatalist = {};
}
// @ts-ignore
const roomDatalist = global.roomDatalist;
// @ts-ignore
const userdata = global.userdata;

function getNormalRandom(mean = 12, stdDev = 3) {
    // Box-Muller transform to generate normally distributed numbers
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Avoid log(0)
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return Math.floor(z * stdDev + mean);
}

function generateWinningHand(wall: number[]) {
    let win_hand = [];

    // Helper: Count occurrences of a tile in the wall
    const countTiles = (tile: number) => wall.filter(t => t === tile).length;

    // Helper: Remove tiles from the wall
    const removeTiles = (tilesToRemove: number[]) => {
        tilesToRemove.forEach(tile => {
            const index = wall.indexOf(tile);
            if (index !== -1) wall.splice(index, 1);
        });
    };

    // 1. Generate 4 sets (triplets/sequences)
    while (win_hand.length < 12) {
        const isTriplet = Math.random() < 0.3; // 30% triplet, 70% sequence

        if (isTriplet) {
            // --- TRIPLET LOGIC ---
            const randomTile = wall[Math.floor(Math.random() * wall.length)];
            if (countTiles(randomTile) >= 3) {
                win_hand.push(randomTile, randomTile, randomTile);
                removeTiles([randomTile, randomTile, randomTile]);
            }
        } else {
            // --- SEQUENCE LOGIC ---
            const randomTile = wall[Math.floor(Math.random() * wall.length)];
            const sequencePattern = Math.floor(Math.random() * 3); // 0,1,2 (33% each)

            let sequence;
            if (sequencePattern === 0) sequence = [randomTile, randomTile+1, randomTile+2];
            else if (sequencePattern === 1) sequence = [randomTile-1, randomTile, randomTile+1];
            else sequence = [randomTile-2, randomTile-1, randomTile];

            // Check if all sequence tiles exist in the wall
            const sequenceValid = sequence.every(tile => wall.includes(tile));
            if (sequenceValid) {
                win_hand.push(...sequence);
                removeTiles(sequence);
            }
        }
    }

    // 2. Generate the pair
    while (true) {
        const randomTile = wall[Math.floor(Math.random() * wall.length)];
        if (countTiles(randomTile) >= 2) {
            win_hand.push(randomTile, randomTile);
            removeTiles([randomTile, randomTile]);
            break;
        }
    }

    return win_hand.sort((a, b) => a - b);
}

// Define the POST method handler
export async function POST(req: NextRequest) {
    const { userid, star_to_play } = await req.json();
    // check if user valid
    if (!userdata[userid]) {
        return NextResponse.json(
            { success: false, error: "Invalid user ID"},
            { status: 400 }
        );
    }
    const playerstars = userdata[userid].balance;
    if (playerstars < star_to_play || star_to_play < 0) {
        return NextResponse.json(
            { success: false, error: "Invalid stars"},
            { status: 400 }
        );
    }
    // Logic to create a room and initialize data
    const roomId = generateRoomId(); // Function to generate a unique room ID
    const [roomData, PublicRoomData] = initializeRoomData(star_to_play); // Function to initialize room data
    // generate bot winning round
    // TODO: Add winning round setting
    const Avg_win_round = getNormalRandom(10,3);
    roomData.round = Avg_win_round;
    // generate winning bot
    const randomInt = Math.floor(Math.random() * 3) + 1;
    roomData.position = randomInt;
    // generate the winning hand
    const win_hand = generateWinningHand(roomData.wall);
    // switch winning hand with bot hand
    roomData.wall.push(...roomData.playerdatalist[randomInt].hand);
    const randomIndex = Math.floor(Math.random() * 14);
    const [tile] = win_hand.splice(randomIndex, 1);
    roomData.wall.unshift(tile);
    roomData.playerdatalist[randomInt].hand = win_hand;
    // Put roomData into roomDatalist
    console.log(roomData);
    roomDatalist[roomId] = roomData;
    // remove stars on start
    userdata[userid].balance -= star_to_play;
    // Send the room data back to the client
    return NextResponse.json({ roomId, roomData: PublicRoomData });
}

function generateRoomId(): string {
    return Math.random().toString(36).substring(2, 15); // Simple random ID
}