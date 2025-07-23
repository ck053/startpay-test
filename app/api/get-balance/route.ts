import { NextResponse, NextRequest } from "next/server";

// Define types for your user data structure
type UserData = {
    [userId: string]: {
      balance: number;
      // Add other user properties here as needed
    };
  };
  
  // Initialize global userdata with proper typing
  declare global {
    namespace NodeJS {
      interface Global {
        userdata: UserData;
      }
    }
  }

// @ts-ignore
if (!global.userdata) {
    // @ts-ignore
    global.userdata = {};
}

export async function POST(req: NextRequest) {
  try {
    const userId = await req.text();

    // Validate userId is not empty
    if (!userId || typeof userId !== 'string') {
        console.log('Invalid user ID:', userId);
        return NextResponse.json(
            { success: false, error: "Invalid user ID"},
            { status: 400 }
        );
    }

    // Initialize user data if it doesn't exist
    // @ts-ignore
    if (!global.userdata[userId]) {
        // @ts-ignore
        global.userdata[userId] = {
        balance: 0, // Default balance
      };
    }

    // Return the user's balance
    return NextResponse.json({
      success: true,
      // @ts-ignore
      balance: global.userdata[userId].balance
    });

  } catch (error) {
    console.error("Error in user balance endpoint:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}