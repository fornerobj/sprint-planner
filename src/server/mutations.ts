"use server";

import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import {
  projects,
  tasks,
  projectMembers,
  projectInvitations,
} from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import type { TaskCategory } from "~/server/db/schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import {
  getInvitationById,
  getProjectById,
  getTaskById,
  getTeamMembers,
} from "./queries";
import { redirect } from "next/navigation";
import { error } from "console";

export async function createProject(props: {
  name: string;
  description: string | null;
}) {
  const user = await auth();

  if (!user.userId) return { error: "Unauthorized" };
  if (!props.name) return { error: "No name given" };
  if (!props.description) return { error: "No description given" };

  const [newProject] = await db
    .insert(projects)
    .values({
      name: props.name,
      description: props.description,
      ownerId: user.userId,
    })
    .returning();
  if (!newProject) return { error: "Failed to add project" };

  const [teamMember] = await db
    .insert(projectMembers)
    .values({
      userId: user.userId,
      projectId: newProject.id,
    })
    .returning();
  if (!teamMember) {
    await db.delete(projects).where(eq(projects.id, newProject.id));
    return { error: "Failed to add you as teammate" };
  }

  return { error: true };
}

export async function deleteProject({ id }: { id: number }) {
  const user = await auth();

  if (!user.userId) return { error: "Unauthorized" };

  const project = await getProjectById({ id: id });
  if (!project) return { error: "No project owner" };

  if (user.userId !== project.data?.ownerId)
    return { error: "You are not the owner" };

  await db
    .delete(projects)
    .where(eq(projects.id, id))
    .catch((e) => {
      return { error: "Failed to delete project" };
    });
  revalidatePath("/");
  return { error: null };
}

export async function updateProject({
  id,
  name,
  description,
}: {
  id: number;
  name?: string | null;
  description?: string | null;
}) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const projectToUpdate = await db.query.projects.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });

  if (!projectToUpdate) return { error: "Unauthorized" };
  if (projectToUpdate.ownerId !== userId) return { error: "Unauthorized" };

  const updateData: Record<string, string> = {};

  if (name !== undefined && name !== null) {
    updateData.name = name;
  }
  if (description !== undefined && description !== null) {
    updateData.description = description;
  }

  if (Object.keys(updateData).length === 0) {
    return { error: "Unauthorized" };
  }

  await db.update(projects).set(updateData).where(eq(projects.id, id));

  revalidatePath(`/projects/${id}`);
}

export async function createTask(props: {
  content: string;
  category: TaskCategory;
  projectId: number;
}) {
  const user = await auth();

  if (!user.userId) return { error: "Unauthorized" };
  if (!props.content) return { error: "Unauthorized" };
  if (!props.category) return { error: "Unauthorized" };
  if (!props.projectId) return { error: "Unauthorized" };

  if (!["Required", "In_Progress", "Finished"].includes(props.category)) {
    return { error: "Unauthorized" };
  }

  const project = await db.query.projects.findFirst({
    where: (model, { eq }) => eq(model.id, props.projectId),
  });

  if (!project) return { error: "Unauthorized" };

  const newTask = await db
    .insert(tasks)
    .values({
      userId: user.userId,
      category: props.category,
      title: props.content,
      projectId: props.projectId,
    })
    .returning();
  if (!newTask) return { error: "Unauthorized" };

  revalidatePath("/");
  return { error: null };
}

export async function deleteTask({ id }: { id: number }) {
  const user = await auth();
  if (!user.userId) return { error: "Unauthorized" };

  const taskToDelete = await getTaskById({ id });
  if (!taskToDelete) return { error: "Unauthorized" };

  await db.delete(tasks).where(eq(tasks.id, id));

  revalidatePath(`/projects/${id}`);

  return { error: null };
}

export async function updateTaskCategory(props: {
  id: number;
  newCategory: TaskCategory;
}) {
  const user = await auth();

  if (!user.userId) return { error: "Unauthorized" };
  if (!props.id) return { error: "Unauthorized" };
  if (!props.newCategory) return { error: "Unauthorized" };

  if (!["Required", "In_Progress", "Finished"].includes(props.newCategory)) {
    return { error: "Unauthorized" };
  }

  const task = await db.query.tasks.findFirst({
    where: (tasks, { eq, and }) =>
      and(eq(tasks.id, props.id), eq(tasks.userId, user.userId)),
  });

  if (!task) {
    return { error: "Unauthorized" };
  }

  const projOfTask = await db.query.projects.findFirst({
    where: (model, { eq }) => eq(model.id, task.projectId),
  });

  if (!projOfTask) return { error: "Unauthorized" };

  const team = await getTeamMembers({ projectId: projOfTask.id });
  if (team.error || !team.data) return { error: team.error };
  if (!team.data.some((teammate) => teammate.id === user.userId)) {
    return { error: "Unauthorized" };
  }

  await db
    .update(tasks)
    .set({
      category: props.newCategory,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, props.id));

  revalidatePath("/");

  return { error: null };
}

export async function addTeamMember({
  projectId,
  userEmail,
}: {
  projectId: number;
  userEmail: string;
}) {
  const currentUser = await auth();
  if (!currentUser.userId) return { error: "Unauthorized" };

  const project = await getProjectById({ id: projectId });
  if (project.error || !project.data) return { error: project.error };

  if (project.data.ownerId !== currentUser.userId) {
    return { error: "Unauthorized" };
  }

  const emailAddress = [userEmail];

  const cc = await clerkClient();
  const { data: users } = await cc.users.getUserList({ emailAddress });

  if (users.length === 0) {
    return { error: "Unauthorized" };
  }

  const userId = users[0]!.id;

  await db.insert(projectMembers).values({
    projectId: projectId,
    userId: userId,
  });

  revalidatePath(`/projects`);
  return { error: null };
}

export async function deleteTeamMember({
  id,
  projectId,
}: {
  id: string;
  projectId: number;
}) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  if (userId === id) return { error: "Unauthorized" };

  const project = await getProjectById({ id: projectId });
  if (project.error || !project.data) return { error: project.error };

  if (project.data.ownerId !== userId) {
    return { error: "Unauthorized" };
  }

  const teamMembers = await getTeamMembers({ projectId });
  if (teamMembers.error || !teamMembers.data) return { error: project.error };

  if (!teamMembers.data.some((obj) => obj.id === id)) {
    return { error: "Teammember doesnt exist" };
  }

  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, id),
      ),
    );
  revalidatePath(`/projects/${projectId}`);
}

export async function leaveTeam({ projectId }: { projectId: number }) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const project = await getProjectById({ id: projectId });
  if (project.error || !project.data) return { error: project.error };

  if (project.data.ownerId === userId) {
    return { error: "Unauthorized" };
  }
  const teamMembers = await getTeamMembers({ projectId });
  if (teamMembers.error || !teamMembers.data) return { error: project.error };

  if (teamMembers.data.some((obj) => obj.id === userId)) {
    return { error: "Unauthorized" };
  }

  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    );
  redirect("/projects");
}

export async function inviteTeamMember({
  projectId,
  userEmail,
}: {
  projectId: number;
  userEmail: string;
}) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const project = await getProjectById({ id: projectId });
  if (project.error || !project.data) return { error: project.error };
  if (project.data.ownerId !== userId) {
    return { error: "Unauthorized" };
  }

  const existingTeamMembers = await getTeamMembers({ projectId });
  if (existingTeamMembers.error || !existingTeamMembers.data)
    return { error: project.error };
  if (existingTeamMembers.data.some((obj) => obj.email === userEmail)) {
    return { error: "Unauthorized" };
  }

  const existingInvitation = await db.query.projectInvitations.findFirst({
    where: (invitation, { and, eq }) =>
      and(
        eq(invitation.projectId, projectId),
        eq(invitation.invitedEmail, userEmail),
        eq(invitation.status, "pending"),
      ),
  });
  if (existingInvitation) {
    return { error: "Unauthorized" };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(projectInvitations).values({
    projectId,
    invitedEmail: userEmail,
    invitedBy: userId,
    status: "pending",
    expiresAt,
  });

  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}

export async function acceptInvitation({
  invitationId,
}: {
  invitationId: number;
}) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const invite = await getInvitationById({ invitationId });
  if (invite.error || !invite.data) return { error: invite.error };
  if (invite.data.status !== "pending")
    return { error: "Invite it no longer pending" };

  const cc = await clerkClient();
  const user = await cc.users.getUser(userId);
  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail) return { error: "Unauthorized" };
  if (invite.data.invitedEmail !== userEmail) {
    return { error: "Unauthorized" };
  }

  if (new Date(invite.data.expiresAt) < new Date()) {
    await db
      .update(projectInvitations)
      .set({ status: "expired" })
      .where(eq(projectInvitations.id, invitationId));
    return { error: "Unauthorized" };
  }

  await db
    .update(projectInvitations)
    .set({ status: "accepted" })
    .where(eq(projectInvitations.id, invitationId));

  await db.insert(projectMembers).values({
    projectId: invite.data.projectId,
    userId,
  });

  revalidatePath("/");
  return { error: null };
}

export async function declineInvitation({
  invitationId,
}: {
  invitationId: number;
}) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const invite = await getInvitationById({ invitationId });
  if (invite.error || !invite.data) return { error: invite.error };
  if (invite.data.status !== "pending")
    return { error: "Invite is not pending" };

  const cc = await clerkClient();
  const user = await cc.users.getUser(userId);
  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail) return { error: "Unauthorized" };

  const result = await db
    .update(projectInvitations)
    .set({ status: "declined" })
    .where(
      and(
        eq(projectInvitations.id, invitationId),
        eq(projectInvitations.invitedEmail, userEmail),
        eq(projectInvitations.status, "pending"),
      ),
    )
    .returning();
  if (result.length === 0) return { error: "Unauthorized" };

  revalidatePath("/");
  return { error: null };
}
