import { createClient } from "@/lib/supabase/server";

export async function updateMilestoneStatus(
  userId: string,
  topic: string,
  milestone: string
) {
  const supabase = createClient();

  // Fetch the user's current progress
  const { data, error } = await supabase
    .from("user_activity")
    .select("topics_and_milestones, budget")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user activity:", error);
    return { success: false, message: "Failed to fetch user activity" };
  }

  const { topics_and_milestones, budget } = data;

  // Check if the topic and milestone exist
  if (
    topics_and_milestones[topic] &&
    topics_and_milestones[topic].milestones[milestone] !== undefined
  ) {
    topics_and_milestones[topic].milestones[milestone] = 1;

    // Check if all milestones for the topic are completed
    const allDone = Object.values(
      topics_and_milestones[topic].milestones
    ).every((status) => status === 1);

    if (allDone) {
      topics_and_milestones[topic].status = 1; // Mark the topic as done

      // Increment the user's budget by 1 coin
      const updatedBudget = budget + 1;

      // Update the database
      const { error: updateError } = await supabase
        .from("user_activity")
        .update({
          topics_and_milestones,
          budget: updatedBudget,
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating user activity:", updateError);
        return { success: false, message: "Failed to update user activity" };
      }

      return {
        success: true,
        message: "Milestone and topic updated successfully",
      };
    }
  } else {
    return { success: false, message: "Invalid topic or milestone" };
  }

  // Update the database for milestone completion only
  const { error: milestoneError } = await supabase
    .from("user_activity")
    .update({ topics_and_milestones })
    .eq("user_id", userId);

  if (milestoneError) {
    console.error("Error updating milestone status:", milestoneError);
    return { success: false, message: "Failed to update milestone status" };
  }

  return { success: true, message: "Milestone updated successfully" };
}
