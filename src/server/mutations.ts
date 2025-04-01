"use server";
import "server-only";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { activities } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function createActivity(props: {
  content: string;
  category: string;
}) {
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized");
  if (!props.content) throw new Error("Content Missing");
  if (!props.category) throw new Error("Category Missing");

  db.insert(activities).values({
    userId: user.userId,
    category: props.category,
    title: props.content,
  });
}
export async function getMyActivities() {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const activities = await db.query.activities.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
  });

  return activities;
}
