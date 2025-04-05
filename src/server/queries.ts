"use server";
import "server-only";

import { eq, exists, and, or } from "drizzle-orm";
import { db } from "~/server/db";
import { projectMembers, tasks } from "~/server/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getMytasks() {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const tasks = await db.query.tasks.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
  });

  return tasks;
}

export async function getProjectTasks({ projectId }: { projectId: number }) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const tasks = await db.query.tasks.findMany({
    where: (model, { eq }) => eq(model.projectId, projectId),
    orderBy: (model, { desc }) => desc(model.createdAt),
  });

  return tasks;
}

export async function getTaskById({ id }: { id: number }) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const task = await db.query.tasks.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });

  if (!task) throw new Error("No task exists with that ID");

  return task;
}

export async function getProjectById({ id }: { id: number }) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const project = await db.query.projects.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });

  return project;
}

export async function getProjectsByTeamMember() {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const projects = await db.query.projects.findMany({
    where: (model, { eq, or }) =>
      or(
        eq(model.ownerId, user.userId),
        exists(
          db
            .select()
            .from(projectMembers)
            .where(
              and(
                eq(projectMembers.projectId, model.id),
                eq(projectMembers.userId, user.userId),
              ),
            ),
        ),
      ),
    with: {
      tasks: true,
    },
  });

  return projects;
}

export async function getTeamMembers({ projectId }: { projectId: number }) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const projectTeamMembers = await db.query.projectMembers.findMany({
    where: (model, { eq }) => eq(model.projectId, projectId),
  });

  const teamMemberIds = projectTeamMembers.map((member) => member.userId);
  const { data } = await (
    await clerkClient()
  ).users.getUserList({ userId: teamMemberIds });

  const teamMembers = data.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.emailAddresses[0]?.emailAddress,
    avatar: user.imageUrl,
  }));

  return teamMembers;
}

export type TeamMember = {
  id: string;
  name: string;
  email: string | undefined;
  avatar: string;
};
