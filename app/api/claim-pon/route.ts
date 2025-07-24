import { checkpon, FetchRoomData } from "@/app/data/game";
import { NextResponse, NextRequest } from "next/server";

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
        const player = roomdata.playerdatalist[0];
        // check if pon available
        if (checkpon(player.hand, roomdata.last_discard)) {
            // remove card from hand and discard
            const index = player.hand.indexOf(roomdata.last_discard);
            const exposedTile = player.hand.splice(index, 2);
            exposedTile.push(roomdata.playerdatalist[roomdata.current_player].discard.pop());
            player.exposed.push(exposedTile);
            roomdata.listening = true;
            roomdata.current_player = 0;
            const PublicRoomData = FetchRoomData(roomdata);
            return NextResponse.json({ success:true, roomdata:PublicRoomData });
        } else {roomdata.listening = true; throw new Error("Pon is not available");} 
    } catch(error) {
        return NextResponse.json({ sucess:false, error: 'Error when trying to pon' }, { status:500 });
    }
}