import { MahjongAction } from "@/app/game/components/Board";
import { NextRequest, NextResponse } from "next/server";
import { checkWin, checkkan } from "@/app/data/game";

export async function POST(req: NextRequest) {
    try {
        const {userid, roomId} = await req.json();
        const action: MahjongAction[] = [];
        // @ts-ignore
        const roomDatalist = global.roomDatalist;
        
        //find the room
        const roomdata = roomDatalist[roomId];
        if (!roomdata) {
            throw new Error("Room not exits");
        }
        const player = roomdata.playerdatalist[0];
        //deal a card to current player
        if (roomdata['wall'].length <= 0) {
            action.push('end');
            return NextResponse.json({action, new_tile: 11})
        }
        if (!roomdata.listen) {
            throw new Error("Room not listening");
        }
        roomdata.listen = false;
        if (roomdata.current_player !== 0) {
            roomdata.listen = true;
            throw new Error("Not player's turn to draw");
        }
        if ((player.hand.length - 1) % 3 !== 0) {
            roomdata.listen = true;
            throw new Error("Hands length not compatible");
        }
        const card = roomdata['wall'].pop();
        player.hand.push(card);
        player.last_drawn = card;

        // check for actions
        // check kan
        if (checkkan(player.hand, player.exposed) && roomdata.wall.length > 0) {
            action.push('kan');
        }
        // check win
        if (checkWin(player.hand)) {
            action.push('tsumo');
        }
        //update the hands with possible actions
        roomdata.listen = true;
        return NextResponse.json({ action , new_tile: card})

    } catch (error) {
        console.log("Error when trying to deal:", error)
        return NextResponse.json({success: false, error: "Error when trying to deal:"},{status: 500})
    }
}