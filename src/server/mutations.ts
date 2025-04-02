"use server";
import "server-only";

import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { projects, tasks } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import type { TaskCategory } from "~/server/db/schema";
import { revalidatePath } from "next/cache";

export async function createProject(props: {
  name: string;
  description: string | null;
}) {
  "use server";
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized");
  if (!props.name) throw new Error("Name Missing");
  if (!props.description) throw new Error("Description Missing");

  const newProject = await db
    .insert(projects)
    .values({
      name: props.name,
      description: props.description,
    })
    .returning();
  if (!newProject) throw new Error("Failed to create new Project");

  return { sucess: true };
}

export async function createTask(props: {
  content: string;
  category: TaskCategory;
  projectId: number;
}) {
  "use server";
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized");
  if (!props.content) throw new Error("Content Missing");
  if (!props.category) throw new Error("Category Missing");
  if (!props.projectId) throw new Error("Project Missing");

  if (!["Required", "In_Progress", "Finished"].includes(props.category)) {
    throw new Error("Invalid category");
  }

  const project = await db.query.projects.findFirst({
    where: (model, { eq }) => eq(model.id, props.projectId),
  });

  if (!project) throw new Error("Project does not exist");

  const newTask = await db
    .insert(tasks)
    .values({
      userId: user.userId,
      category: props.category,
      title: props.content,
      projectId: props.projectId,
    })
    .returning();
  if (!newTask) throw new Error("No new task, or unauthorized");

  revalidatePath("/");
  return { success: true };
}

export async function updateTaskCategory(props: {
  id: number;
  newCategory: TaskCategory;
}) {
  "use server";
  console.log("Creating...");
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized");
  if (!props.id) throw new Error("Content Missing");
  if (!props.newCategory) throw new Error("Category Missing");

  if (!["Required", "In_Progress", "Finished"].includes(props.newCategory)) {
    throw new Error("Invalid category");
  }

  const task = await db.query.tasks.findFirst({
    where: (tasks, { eq, and }) =>
      and(eq(tasks.id, props.id), eq(tasks.userId, user.userId)),
  });

  if (!task) {
    throw new Error("Task not found, or unauthorized");
  }

  await db
    .update(tasks)
    .set({
      category: props.newCategory,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, props.id));

  revalidatePath("/");

  return { success: true };
}
