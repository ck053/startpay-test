import { NextRequest, NextResponse } from "next/server";
import { initializeRoomData } from "@/app/data/game";
import { connectToDatabase } from "@/lib/mongodb";

// @ts-ignore
if (!global.roomDatalist) {
    // @ts-ignore
    global.roomDatalist = {};
}
// @ts-ignore
const roomDatalist = global.roomDatalist;

async function waitForSuccess(
    collection: any,
    payload: string,
    timeoutMs: number = 3000, // 3 seconds max
    intervalMs: number = 500   // Check every 500ms
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const check = await collection.findOne({ payload });
      if (check?.status === "Success") return true;
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    return false;
}

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

function generateLossingHand(wall: number[]): { hand: number[]; updatedWall: number[] } {
    const hand: number[] = [];
    const usedNumbers = new Set<number>();
    const updatedWall = [...wall];
    let i = 0;

    while (i < updatedWall.length && hand.length < 13) {
        const tile = updatedWall[i];
        if (!usedNumbers.has(tile) && 
            !usedNumbers.has(tile - 1) && 
            !usedNumbers.has(tile + 1) &&
            !usedNumbers.has(tile -2) &&
            !usedNumbers.has(tile + 2)) {
            hand.push(tile);
            usedNumbers.add(tile);
            updatedWall.splice(i, 1);
        } else {
            i++;
        }
    }
    hand.sort((a, b) => a - b);
    return { hand, updatedWall };
}

// Define the POST method handler
export async function POST(req: NextRequest) {
    const { userid, star_to_play, payload } = await req.json();
    try {
        const client = await connectToDatabase();
        const db = client.db('mahjong_game');
        const usersCollection = db.collection('users');
        const roomsCollection = db.collection('rooms');
        const user = await usersCollection.findOne({ userId: userid });
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Invalid user ID" },
                { status: 401 }
            );
        }
        // check payload
        const paymentCollection = db.collection('payment');
        const check = await paymentCollection.findOne({ payload: payload });
        if (!check) {
            return NextResponse.json(
                { success: false, error: "Invalid payload" },
                { status: 402 }
            );
        }
        if (check.userId !== userid) {
            return NextResponse.json(
                { success: false, error: "Invalid user" },
                { status: 403 }
            );
        }
        if (check.stars !== star_to_play) {
            return NextResponse.json(
                { success: false, error: "Invalid star value" },
                { status: 405 }
            );
        }
        // Retry mechanism for status
        if (check.status !== "Success") {
            const isSuccess = await waitForSuccess(paymentCollection, payload);
            if (!isSuccess) return NextResponse.json(
                { success: false, error: "Payment timeout" },
                { status: 408 } // 408 = Timeout
            );
        }
        if (check.roomId) {
            return NextResponse.json(
                { success: false, error: "Repeated payload" },
                { status: 407 }
            );
        }
        // Create room data
        const [roomData, PublicRoomData] = initializeRoomData(star_to_play, userid);
        const roomId = generateRoomId();
        // get bot star balance
        const bot = await usersCollection.findOneAndUpdate({ userId: "Bot" }, { $inc:{ balance: +star_to_play } });
        if (!bot) { return NextResponse.json(
            { success: false, error: "Bot data error" },
            { status: 408 }
        ); }
        const star_number = bot.balance;
        const difficulty = Number(process.env.DIFFICULTY);
        // increase difficulty if balance is low
        if (star_number < star_to_play * 2) {
            const Avg_win_round = getNormalRandom(4-difficulty, 1);
            roomData.round = Avg_win_round;
            // give player a worse hand
            const {hand: player_hand, updatedWall: wall} = generateLossingHand(roomData.wall);
            roomData.wall = wall;
            roomData.wall.push(...roomData.playerdatalist[0].hand);
            roomData.playerdatalist[0].hand = player_hand;
            PublicRoomData.playerdatalist[0].hand = player_hand;
        } else if (star_number < 1000) {
            const Avg_win_round = getNormalRandom(9-difficulty, 2);
            roomData.round = Avg_win_round;
        } else if (star_number < 5000) {
            const Avg_win_round = getNormalRandom(10-difficulty, 3);
            roomData.round = Avg_win_round;
        } else {
            const Avg_win_round = getNormalRandom(11-difficulty, 3);
            roomData.round = Avg_win_round;
        }
        // Generate bot data
        const randomInt = Math.floor(Math.random() * 3) + 1;
        roomData.position = randomInt;
        const win_hand = generateWinningHand(roomData.wall);
        roomData.wall.push(...roomData.playerdatalist[randomInt].hand);
        const randomIndex = Math.floor(Math.random() * 14);
        const [tile] = win_hand.splice(randomIndex, 1);
        roomData.wall.unshift(tile);
        roomData.playerdatalist[randomInt].hand = win_hand;

        // Store room in MongoDB
        await roomsCollection.insertOne({
            roomId,
            ...roomData,
            payload,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // remove unfinished room
        const roomKeyToDelete = Object.keys(roomDatalist).find(
            (key) => roomDatalist[key].userid === userid
        );
          
        if (roomKeyToDelete) {
            // Delete the room from the dictionary
            delete roomDatalist[roomKeyToDelete];
        }
        // bind payload with roomId
        await paymentCollection.updateOne(
            { payload },
            { $set: { roomId } }
        );
        roomDatalist[roomId] = roomData;
        console.log("Room created! Total room:", Object.keys(roomDatalist).length);
        return NextResponse.json({ roomId, roomData: PublicRoomData });
    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

function generateRoomId(): string {
    return Math.random().toString(36).substring(2, 15); // Simple random ID
}