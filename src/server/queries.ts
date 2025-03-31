import "server-only";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { activities } from "~/server/db/schema";

export async function getActivities() {
  const activities = await db.query.activities.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  });

  return activities;
}

export async function getRequiredActivities() {
  const required = await db
    .select()
    .from(activities)
    .where(eq(activities.category, "Required"));

  return required;
}

export async function getInProgressActivities() {
  const in_progress = await db
    .select()
    .from(activities)
    .where(eq(activities.category, "In_Progress"));
  return in_progress;
}

export async function getFinishedActivities() {
  const finished = await db
    .select()
    .from(activities)
    .where(eq(activities.category, "Finished"));
  return finished;
}
