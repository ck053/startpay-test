import { checkWin, checkpon, replay_record, checkkan, checkchi, FetchRoomData } from "@/app/data/game";
import { MahjongAction } from "@/app/game/components/Board";
import next from "next/dist/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // check if the card is valid && is player to action && player already draw
        const { tile, roomId, userid , skip} = await req.json();
        // @ts-ignore
        const roomDatalist = global.roomDatalist;

        const action: MahjongAction[] = [];
        //find the room
        const roomdata = roomDatalist[roomId];
        const player = roomdata.playerdatalist[0];
        if (!roomdata) {
            throw new Error("Room not exits");
        }
        if (!roomdata.listen) {
            throw new Error("Room not listening");
        }
        roomdata.listen = false;
        if (roomdata.current_player !== 0 && !skip) {
            roomdata.listen = true;
            throw new Error("Not in player's action");
        }
        if ((player.hand.length - 2) % 3 !== 0 && !skip) {
            roomdata.listen = true;
            throw new Error("Hands length not compatible");
        }
        // remove the card
        if (!skip) {
            const index = player.hand.indexOf(tile);
            if (index === -1) {
                roomdata.listen = true;
                throw new Error("Tile not in hand");
            }
            const [discardedTile] = player.hand.splice(index, 1);
            player.discard.push(discardedTile);
            player.last_discard = discardedTile;
            roomdata.last_discard = discardedTile;
        }
        
        // running bot AI
        // initialize the record
        const replay = [];
        // draw and discard until stop
        for (let i = roomdata.current_player + 1; i<4; i++) {
            roomdata.current_player = i;
            if (roomdata.wall.length <= 0) {
                action.push('end');
                const PublicRoomData = FetchRoomData(roomdata);
                return NextResponse.json({roomdata: PublicRoomData, action, replay});
            }
            // check if bot win
            const bot = roomdata.playerdatalist[i];
            if (roomdata.cards_remain < (84 - roomdata.round * 4) && i == roomdata.position) {
                const card = roomdata.wall.shift();
                bot.hand.push(card);
                bot.last_drawn = card;
                roomdata.cards_remain -= 1;
                replay.push({ action:'draw', value:-1, player:i });
                // trigger bot win
                action.push('bot_end');
                const PublicRoomData = FetchRoomData(roomdata);
                replay.push({ action:'bot_win', value:card, player:i });
                PublicRoomData.playerdatalist[i].hand = bot.hand;
                return NextResponse.json({roomdata: PublicRoomData, action, replay});
            } else {
                const card = roomdata.wall.pop();
                bot.hand.push(card);
                bot.last_drawn = card;
                roomdata.cards_remain -= 1;
            }            
            // record
            replay.push({ action:'draw', value:-1, player:i });
            const discardedTile = bot.hand.pop();
            bot.discard.push(discardedTile);
            bot.last_discard = discardedTile;
            roomdata.last_discard = discardedTile;
            //record
            replay.push({ action:'discard', value:discardedTile, player:i });
            // check for player action
            // check for chi
            if ( i == 3 && checkchi(player.hand, discardedTile).length > 0) {
                action.push('chi');
            }
            // check for pon
            if (checkpon(player.hand, discardedTile)) {
                action.push('pon');
            }
            // check for kan
            if (checkkan(player.hand, player.exposed, discardedTile, false) && roomdata.wall.length > 0) {
                action.push('kan');
            }
            // check for win
            // get copy of player's hand
            const hand = [...player.hand];
            // check if can win
            hand.push(discardedTile);
            if (checkWin(hand)) {
                action.push('ron');
            }
            if (action.length > 0) {
                roomdata.listen = true;
                const PublicRoomData = FetchRoomData(roomdata);
                return NextResponse.json({roomdata: PublicRoomData, action, replay});
            }
        }
        roomdata.current_player = 0;
        roomdata.listen = true;
        const PublicRoomData = FetchRoomData(roomdata);
        return NextResponse.json({roomdata: PublicRoomData, action, replay});
    } catch(error) {
        console.log("Error when handling discard:", error)
        return NextResponse.json({success: false, error: "Error when handling discard:"},{status: 500})
    }
}