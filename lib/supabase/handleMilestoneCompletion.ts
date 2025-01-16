import { updateMilestoneStatus } from "@/lib/supabase/userActivity";

/**
 * Handles completion of a milestone by calling the `updateMilestoneStatus` function.
 * @param userId - The ID of the user.
 * @param topic - The topic containing the milestone.
 * @param milestone - The milestone to mark as complete.
 * @returns Success or failure result.
 */
export async function handleMilestoneCompletion(
  userId: string,
  topic: string,
  milestone: string
) {
  if (!userId || !topic || !milestone) {
    return { success: false, message: "Invalid parameters" };
  }

  const result = await updateMilestoneStatus(userId, topic, milestone);
  return result;
}
