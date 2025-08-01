import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    const { userid } = await req.json();
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
        return NextResponse.json({ language: user.language, animation_speed: user.animation_speed });
    } catch(error) {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}