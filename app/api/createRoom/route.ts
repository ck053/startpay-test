import { NextRequest, NextResponse } from "next/server";
import { initializeRoomData } from "@/app/data/game";

// @ts-ignore
if (!global.roomDatalist) {
    // @ts-ignore
    global.roomDatalist = {};
  }
  
// @ts-ignore
const roomDatalist = global.roomDatalist;
// @ts-ignore
const userdata = global.userdata;
// Define the POST method handler
export async function POST(req: NextRequest) {
    const { userid, starsCount } = await req.json();
    // check if user valid
    if (!userdata[userid]) {
        return NextResponse.json(
            { success: false, error: "Invalid user ID"},
            { status: 400 }
        );
    }
    const playerstars = userdata[userid].balance;
    if (playerstars < starsCount || starsCount < 0) {
        return NextResponse.json(
            { success: false, error: "Invalid stars"},
            { status: 400 }
        );
    }
    // Logic to create a room and initialize data
    const roomId = generateRoomId(); // Function to generate a unique room ID
    const [roomData, PublicRoomData] = initializeRoomData(starsCount); // Function to initialize room data
    // Put roomData into roomDatalist
    roomDatalist[roomId] = roomData;
    // remove stars on start
    userdata[userid].balance -= starsCount;
    // Send the room data back to the client
    return NextResponse.json({ roomId, roomData: PublicRoomData });
}

function generateRoomId(): string {
    return Math.random().toString(36).substring(2, 15); // Simple random ID
}