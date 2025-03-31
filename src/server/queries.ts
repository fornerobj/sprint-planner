import "server-only";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { activities } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function getMyActivities() {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const activities = await db.query.activities.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
  });

  return activities;
}
