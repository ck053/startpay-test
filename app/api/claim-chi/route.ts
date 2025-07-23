import { checkchi } from "@/app/data/game";
import { NextResponse, NextRequest } from "next/server";

function removetile(list: number[], tile: number) {
    const index = list.indexOf(tile);
    list.splice(index, 1);
}

export async function POST(req: NextRequest) {
    try {
        const { userid, roomId, list } = await req.json();
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
        if (!checkchi(player.hand, roomdata.last_discard).includes(list)) {
            // remove card from hand and discard
            player.exposed.push([...list]);
            removetile(list, roomdata.last_discard);
            removetile(player.hand, list[0]);
            removetile(player.hand, list[1]);
            roomdata.listening = true;
            roomdata.current_player = 0;
            return NextResponse.json({ success:true, roomdata });
        } else {roomdata.listening = true; throw new Error("Chi is not available");} 
    } catch(error) {
        return NextResponse.json({ sucess:false, error: 'Error when trying to pon' }, { status:500 });
    }
}