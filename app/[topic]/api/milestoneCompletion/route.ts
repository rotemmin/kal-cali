import { NextRequest, NextResponse } from "next/server";
import { handleMilestoneCompletion } from "@/lib/supabase/handleMilestoneCompletion";

export async function POST(req: NextRequest) {
  try {
    const { userId, topic, milestone } = await req.json();

    if (!userId || !topic || !milestone) {
      return NextResponse.json(
        { success: false, message: "Invalid parameters" },
        { status: 400 }
      );
    }

    const result = await handleMilestoneCompletion(userId, topic, milestone);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("Error in milestoneCompletion API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
