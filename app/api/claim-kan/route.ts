import { checkkan } from "@/app/data/game";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { userid, roomId, tile } = await req.json();
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
        // open kan
        if (roomdata.current_player !== 0) {
            console.log("case 1");
            // check if kan available
            if (checkkan(player.hand, roomdata.last_discard)) {
                // remove card from hand and discard
                const index = player.hand.indexOf(roomdata.last_discard);
                const exposedTile = player.hand.splice(index, 3);
                exposedTile.push(roomdata.playerdatalist[roomdata.current_player].discard.pop());
                player.exposed.push(exposedTile);
                roomdata.listening = true;
                roomdata.current_player = 0;
                return NextResponse.json({ success:true, roomdata });
        } else {roomdata.listening = true; throw new Error("Pon is not available");} 
        }
        // closed kan or add kan
        else {
            // check available
            const kan_index = checkkan(player.hand, player.exposed, tile);
            const tile_index = player.hand.indexOf(tile);
            switch (kan_index) {
                // closed kan
                case 2:
                    console.log("case 2");
                    // remove 4 tile from hand
                    const closed_exposedTile = player.hand.splice(tile_index, 4);
                    player.exposed.push(closed_exposedTile);
                    roomdata.listening = true;
                    return NextResponse.json({ success:true, roomdata });
                // add kan
                case 3:
                    console.log("case 3");
                    //remove drawn tile
                    let pon_finded = false;
                    const [add_exposedTile] = player.hand.splice(tile_index, 1);
                    player.exposed.forEach((element: number[], index: number) => {
                        if (element[0] == add_exposedTile && element[1] == add_exposedTile) {
                            pon_finded = true;
                            const matchingPonIndex = index;
                            // 3. Add the 4th tile to make it a Kan 
                            player.exposed[matchingPonIndex].push(add_exposedTile);
                            roomdata.listening = true;
                        }
                    });
                    if (!pon_finded)
                    throw new Error("No matching pon finded");
                    else
                    return NextResponse.json({ success:true, roomdata });
            }
        }
    } catch(error) {
        console.log(error);
        return NextResponse.json({ sucess:false, error: 'Error when trying to pon' }, { status:500 });
    }
}