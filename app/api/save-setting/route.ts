import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    const { userid, lang_set, speed_set } = await req.json();
    try {  
        const client = await connectToDatabase();
        const db = client.db('mahjong_game');
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ userId: userid });
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Invalid user ID" },
                { status: 401 }
            );
        }
        await usersCollection.updateOne(
            { userId: userid },
            { "$set": { "language": lang_set, "animation_speed": speed_set } }
        );

    } catch(error) {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}