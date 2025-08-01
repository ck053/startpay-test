import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase, Collection } from "@/lib/mongodb";

// Define TypeScript interface for user data
interface User {
  userId: string;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await req.text();

    // Validate userId
    if (!userId || typeof userId !== 'string') {
      console.log('Invalid user ID:', userId);
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = client.db('mahjong_game');
    const usersCollection = db.collection('users') as Collection<User>;

    // Find or create user
    const result = await usersCollection.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          balance: 0,
          language: 'null',
          createdAt: new Date()
        },
        $set: {
          updatedAt: new Date()
        }
      },
      {
        upsert: true,
        returnDocument: 'after' // Returns the updated document
      }
    );
    if (result)
    if (result.balance == undefined) {
      throw new Error("Failed to create/find user");
    }

    // Return the user's balance
    if (result)
    return NextResponse.json({
      success: true,
      balance: result.balance
    });
    throw new Error("No result found");

  } catch (error) {
    console.error("Error in user balance endpoint:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}