import { NextRequest, NextResponse } from "next/server";
import { updateMilestoneStatus } from "@/lib/supabase/userActivity";
export async function POST(req: NextRequest) {
  try {
    const { userId, topic, milestone } = await req.json();
    console.log("Request received with:", { userId, topic, milestone });

    if (!userId || !topic || !milestone) {
      console.error("Invalid parameters:", { userId, topic, milestone });
      return NextResponse.json(
        { success: false, message: "Invalid parameters" },
        { status: 400 }
      );
    }

    const result = await updateMilestoneStatus(userId, topic, milestone);
    console.log("Update result:", result);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
