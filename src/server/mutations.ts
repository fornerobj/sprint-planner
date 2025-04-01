"use server";
import "server-only";

import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { activities } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import type { TaskCategory } from "~/server/db/schema";

export async function createActivity(props: {
  content: string;
  category: TaskCategory;
}) {
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized");
  if (!props.content) throw new Error("Content Missing");
  if (!props.category) throw new Error("Category Missing");

  if (!["Required", "In_Progress", "Finished"].includes(props.category)) {
    throw new Error("Invalid category");
  }

  db.insert(activities).values({
    userId: user.userId,
    category: props.category,
    title: props.content,
  });
  return { success: true };
}

export async function updateActivityCategory(props: {
  id: number;
  newCategory: TaskCategory;
}) {
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized");
  if (!props.id) throw new Error("Content Missing");
  if (!props.newCategory) throw new Error("Category Missing");

  if (!["Required", "In_Progress", "Finished"].includes(props.newCategory)) {
    throw new Error("Invalid category");
  }

  const activity = await db.query.activities.findFirst({
    where: (activities, { eq, and }) =>
      and(eq(activities.id, props.id), eq(activities.userId, user.userId)),
  });

  if (!activity) throw new Error("Activity not found, or unauthorized");

  await db
    .update(activities)
    .set({
      category: props.newCategory,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, props.id));

  return { success: true };
}
