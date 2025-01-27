import { supabase } from '@/lib/supabase/client';

export async function updateMilestoneStatus(
  userId: string,
  topic: string,
  milestone: string
) {
  // שליפת הנתונים הקיימים
  const { data, error } = await supabase
    .from("user_activity")
    .select("topics_and_milestones, budget")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { success: false, message: "Failed to fetch user activity." };
  }

  const { topics_and_milestones, budget } = data;

  // בדיקת תקינות הנתיבים
  if (
    !topics_and_milestones[topic] ||
    !topics_and_milestones[topic].milestones ||
    topics_and_milestones[topic].milestones[milestone] === undefined
  ) {
    return { success: false, message: "Invalid topic or milestone." };
  }

  // עדכון סטטוס המיילסטון
  topics_and_milestones[topic].milestones[milestone] = 1;

  // בדיקה האם כל המיילסטונים בנושא הושלמו
  const allDone = Object.values(topics_and_milestones[topic].milestones).every(
    (status) => status === 1
  );

  // עדכון תקציב אם הושלם נושא
  let updatedBudget = budget;
  if (allDone) {
    topics_and_milestones[topic].status = 1;
    updatedBudget += 1;
  }

  // עדכון בדאטהבייס
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