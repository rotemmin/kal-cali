import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function updateMilestoneStatus(
  userId: string,
  topic: string,
  milestone: string
) {
  const supabase = createServerClient(cookies());

  const { data, error } = await supabase
    .from("user_activity")
    .select("topics_and_milestones, budget")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { success: false, message: "Failed to fetch user activity." };
  }

  const { topics_and_milestones, budget } = data;

  if (
    !topics_and_milestones[topic] ||
    !topics_and_milestones[topic].milestones ||
    topics_and_milestones[topic].milestones[milestone] === undefined
  ) {
    return { success: false, message: "Invalid topic or milestone." };
  }

  topics_and_milestones[topic].milestones[milestone] = 1;

  const allDone = Object.values(topics_and_milestones[topic].milestones).every(
    (status) => status === 1
  );

  let updatedBudget = budget;
  if (allDone) {
    topics_and_milestones[topic].status = 1;
    updatedBudget += 1;
  }

  const { error: updateError } = await supabase
    .from("user_activity")
    .update({
      topics_and_milestones,
      budget: updatedBudget,
    })
    .eq("id", userId);

  if (updateError) {
    return { success: false, message: "Failed to update user activity." };
  }

  return { success: true, message: "Milestone successfully updated." };
}
