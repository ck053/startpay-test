import { NextResponse, NextRequest } from "next/server";
import { checkWin } from "@/app/data/game";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    try {
        const { userid, roomId } = await req.json();
        // @ts-ignore
        const roomDatalist = global.roomDatalist;
        
        // find the room
        const roomdata = roomDatalist[roomId];
        if (!roomdata || roomdata.userid !== userid) {
            throw new Error("Room not exits or userid not matching");
        }
        if (!roomdata.listen) {
            throw new Error("Room not listening");
        }
        roomdata.listen = false;
        const playerhand = [...roomdata.playerdatalist[0].hand]
        const last_discard = roomdata.last_discard;
        playerhand.push(last_discard);
        // check if player's hand is winning
        if (checkWin(playerhand)) {
            // update roomdata
            roomdata.finished = true;
            // add balance
            const client = await connectToDatabase();
            const db = client.db('mahjong_game')
            const usersCollection = db.collection('users');
            const roomsCollection = db.collection('rooms');
            const balanceHistoryCollection = db.collection('balance_history');
            const addbalance = roomdata.stars*2;
            // Update user balance
            await usersCollection.updateOne(
                { userId: userid },
                { $inc: { balance: +addbalance } }
            );
            // Update room data
            await roomsCollection.updateOne(
                { roomId: roomId },
                { $set: { ...roomdata } }
            );
            // remove roomdata from list
            delete roomDatalist[roomId];
            // update balance_history
            await balanceHistoryCollection.insertOne({
                userId: userid,
                roomId,
                amount: addbalance,
                createdAt: new Date(),
            })
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