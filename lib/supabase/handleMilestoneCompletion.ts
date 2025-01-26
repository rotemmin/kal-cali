import { updateMilestoneStatus } from "@/lib/supabase/userActivity";

export async function handleMilestoneCompletion(
  userId: string,
  topic: string,
  milestone: string
) {
  try {
    const result = await updateMilestoneStatus(userId, topic, milestone);
    if (!result.success) {
      console.error("Failed to update milestone:", result.message);
      return { success: false, message: result.message };
    }
    return { success: true, message: "Milestone successfully updated." };
  } catch (error) {
    console.error("Error handling milestone completion:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
