import { NextRequest, NextResponse } from "next/server";

export default function handler(req: NextRequest) {
    if (req.method === 'POST') {
        // Logic to create a room and initialize data
        const roomId = generateRoomId(); // Function to generate a unique room ID
        const roomData = initializeRoomData(roomId); // Function to initialize room data

        return NextResponse.json({ roomId, roomData }, { status: 200 });
    }
}

// Example functions (you need to implement these)
function generateRoomId() {
    return Math.random().toString(36).substring(2, 15); // Simple random ID
}

function initializeRoomData(roomId: string) {
    return {
        id: roomId,
        players: [],
        gameState: 'waiting', // Example initial state
        // Add any other initial data you need
    };
}