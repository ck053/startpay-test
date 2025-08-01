import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    const { userId, item } = await req.json();
    // check user balance
    const client = await connectToDatabase();
    const db = client.db('mahjong_game');
    const usersCollection = db.collection('users');
    const balanceCollection = db.collection('balance_history');
    const giftsCollection = db.collection('gift_history');
    const user = await usersCollection.findOne({ userId: userId });
    if (!user) { return NextResponse.json({ error: 'No user found' }, { status: 404 }); }
    else {
        if (user.balance < item.price) { return NextResponse.json({ error: 'User balance not enough' }, { status: 402 }); }
        const BOT_TOKEN = process.env.BOT_TOKEN;
        if (!BOT_TOKEN) {
            return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
        }
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendGift`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                gift_id: item.gift_id,
                text: "A gift from mahjong game",
            })
        })
        //console.log(response);
        if (!response.ok) { return NextResponse.json({ error: 'send gift error' }, { status: 401 }); }
        // remove balance from user
        await usersCollection.findOneAndUpdate(
            { userId: userId },
            { $inc: { balance: -item.price } }
        )
        // add balance history
        await balanceCollection.insertOne({
            userId,
            amount: -item.price,
            item,
            createdAt: new Date(),
        })
        // add gift history
        await giftsCollection.insertOne({
            userId,
            itemId: item.id,
            timestamp: Date.now(),
            transactionId: "null",
          });
        return NextResponse.json({ success: "true" });

    }
}