import { createClient } from "@/lib/supabase/server";
export async function updateMilestoneStatus(
  userId: string,
  topic: string,
  milestone: string
) {
  const supabase = createClient();
  console.log("Fetching user activity for:", userId);

  const { data, error } = await supabase
    .from("user_activity")
    .select("topics_and_milestones")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user activity:", error);
    return { success: false, message: "Failed to fetch user activity" };
  }

  console.log("Current topics_and_milestones:", data.topics_and_milestones);

  const { topics_and_milestones } = data;

  // Check if topic and milestone exist
  if (
    topics_and_milestones[topic] &&
    topics_and_milestones[topic].milestones[milestone] !== undefined
  ) {
    topics_and_milestones[topic].milestones[milestone] = 1;

    // Check if all milestones are done for the topic
    const allDone = Object.values(
      topics_and_milestones[topic].milestones
    ).every((status) => status === 1);
    if (allDone) {
      topics_and_milestones[topic].status = 1; // Mark topic as complete
    }

    console.log("Updated topics_and_milestones:", topics_and_milestones);
  } else {
    console.error("Invalid topic or milestone:", { topic, milestone });
    return { success: false, message: "Invalid topic or milestone" };
  }

  const { error: updateError } = await supabase
    .from("user_activity")
    .update({ topics_and_milestones })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Error updating user activity:", updateError);
    return { success: false, message: "Failed to update user activity" };
  }

  console.log("Milestone updated successfully");
  return { success: true, message: "Milestone updated successfully" };
}
