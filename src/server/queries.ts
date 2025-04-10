"use server";
import "server-only";

import { eq, exists, and, or, desc } from "drizzle-orm";
import { db } from "~/server/db";
import { projectMembers, projects, tasks } from "~/server/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getMytasks() {
  const user = await auth();
  if (!user.userId) return { error: "Unathorized", data: null };

  const tasks = await db.query.tasks.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
  });

  return { error: null, data: tasks };
}

export async function getProjectTasks({ projectId }: { projectId: number }) {
  const user = await auth();
  if (!user.userId) return { error: "Unauthorized", data: null };

  const tasks = await db.query.tasks.findMany({
    where: (model, { eq }) => eq(model.projectId, projectId),
    orderBy: (model, { desc }) => desc(model.createdAt),
  });

  return { error: null, data: tasks };
}

export async function getTaskById({ id }: { id: number }) {
  const user = await auth();
  if (!user.userId) return { error: "Unauthorized", data: null };

  const task = await db.query.tasks.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });

  if (!task) return { error: "No task with that id", data: null };

  return { error: null, data: task };
}

export async function getProjectById({ id }: { id: number }) {
  const user = await auth();
  if (!user.userId) return { error: "Unauthorized", data: null };

  const project = await db.query.projects.findFirst({
    where: (model, { eq }) => eq(model.id, id),
    with: {
      tasks: true,
    },
  });

  if (!project) return { error: "No project with that id", data: null };

  return { error: null, data: project };
}

export async function getProjectsByTeamMember() {
  const user = await auth();
  if (!user.userId) return { error: "Unauthorized", data: null };

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

  return { error: null, data: projects };
}

export async function getTeamMembers({ projectId }: { projectId: number }) {
  const user = await auth();
  if (!user.userId) return { error: "Unauthorized", data: null };

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

  return { error: null, data: teamMembers };
}

export type TeamMember = {
  id: string;
  name: string;
  email: string | undefined;
  avatar: string;
};

export async function getInvitationById({
  invitationId,
}: {
  invitationId: number;
}) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized", data: null };

  const invite = await db.query.projectInvitations.findFirst({
    where: (model, { eq }) => eq(model.id, invitationId),
    with: {
      project: true,
    },
  });
  if (!invite) return { error: "Invite does not exist", data: null };

  return { error: null, data: invite };
}

export async function getInvitationsByProject({
  projectId,
}: {
  projectId: number;
}) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized", data: null };

  const project = await getProjectById({ id: projectId });
  if (!project) return { error: "Project does not exist", data: null };
  // if (project.ownerId !== userId) {
  //   throw new Error("You do not own this project");
  // }

  const invitations = await db.query.projectInvitations.findMany({
    where: (model, { eq }) => eq(model.projectId, projectId),
    orderBy: (model, { desc }) => desc(model.createdAt),
  });

  return { error: null, data: invitations };
}

export async function getMyInvitations() {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized", data: null };

  const cc = await clerkClient();
  const user = await cc.users.getUser(userId);
  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail)
    return { error: "No email address found for current user", data: null };

  const invitations = await db.query.projectInvitations.findMany({
    where: (model, { and, eq }) =>
      and(eq(model.invitedEmail, userEmail), eq(model.status, "pending")),
    with: {
      project: true,
    },
    orderBy: (model, { desc }) => desc(model.createdAt),
  });

  return { error: null, data: invitations };
}
