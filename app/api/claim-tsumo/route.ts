import { NextResponse, NextRequest } from "next/server";
import { checkWin } from "@/app/data/game";

export async function POST(req: NextRequest) {
    try {
        const { userid, roomId } = await req.json();
        // @ts-ignore
        const roomDatalist = global.roomDatalist;
        
        // find the room
        const roomdata = roomDatalist[roomId];
        if (!roomdata) {
            throw new Error("Room not exits");
        }
        if (!roomdata.listen) {
            throw new Error("Room not listening");
        }
        roomdata.listen = false;
        if (roomdata.current_player !== 0) {
            roomdata.listen = true;
            throw new Error("Not player's turn");
        }
        const playerhand = roomdata.playerdatalist[0].hand
        // check if player's hand is winning
        if (checkWin(playerhand)) {
            // add balance
            // @ts-ignore
            global.userdata[userid].balance += roomdata.stars * 2;
            // return confirm (not listening)
            return NextResponse.json({ success: true })
        } else {
            roomdata.listen = true;
            throw new Error("Hand is not winning");
        }

} catch(error) {
    console.log('Error when trying to claim win:', error);
    return NextResponse.json({success: false, error: "Error when trying to claim win:"},{status: 500})
}
}