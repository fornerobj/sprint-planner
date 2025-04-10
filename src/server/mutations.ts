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
import { string } from "zod";
import { getAutomaticTypeDirectiveNames } from "typescript";
import { resolve } from "path";
import { redirect } from "next/navigation";

export async function createProject(props: {
  name: string;
  description: string | null;
}) {
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized");
  if (!props.name) throw new Error("Name Missing");
  if (!props.description) throw new Error("Description Missing");

  const [newProject] = await db
    .insert(projects)
    .values({
      name: props.name,
      description: props.description,
      ownerId: user.userId,
    })
    .returning();
  if (!newProject) throw new Error("Failed to create new Project");

  const [teamMember] = await db
    .insert(projectMembers)
    .values({
      userId: user.userId,
      projectId: newProject.id,
    })
    .returning();
  if (!teamMember) {
    await db.delete(projects).where(eq(projects.id, newProject.id));
    throw new Error("Failed to create teamMember. Aborting.");
  }

  return { sucess: true };
}

export async function deleteProject({ id }: { id: number }) {
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized");

  const project = await getProjectById({ id: id });
  if (!project) throw new Error("Project does not exist");

  if (user.userId !== project.ownerId) throw new Error("Unauthorized");

  await db
    .delete(projects)
    .where(eq(projects.id, id))
    .catch((e) => {
      throw new Error("Error: ", e);
    });
  revalidatePath("/");
  return { success: true };
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
  if (!userId) throw new Error("Unauthorized");

  const projectToUpdate = await db.query.projects.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });

  if (!projectToUpdate) throw new Error("Project does not exist");
  if (projectToUpdate.ownerId !== userId)
    throw new Error("You do not own this project");

  const updateData: Record<string, string> = {};

  if (name !== undefined && name !== null) {
    updateData.name = name;
  }
  if (description !== undefined && description !== null) {
    updateData.description = description;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("Noting was passed to update");
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

export async function deleteTask({ id }: { id: number }) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const taskToDelete = await getTaskById({ id });
  if (!taskToDelete) throw new Error("Task does not exist");

  await db.delete(tasks).where(eq(tasks.id, id));

  revalidatePath(`/projects/${id}`);

  return { success: true };
}

export async function updateTaskCategory(props: {
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

  const task = await db.query.tasks.findFirst({
    where: (tasks, { eq, and }) =>
      and(eq(tasks.id, props.id), eq(tasks.userId, user.userId)),
  });

  if (!task) {
    throw new Error("Task not found, or unauthorized");
  }

  const projOfTask = await db.query.projects.findFirst({
    where: (model, { eq }) => eq(model.id, task.projectId),
  });

  if (!projOfTask) throw new Error("That task has no assigned project");

  const team = await getTeamMembers({ projectId: projOfTask.id });
  if (!team.some((teammate) => teammate.id === user.userId)) {
    throw new Error("You are not on this team");
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

export async function addTeamMember({
  projectId,
  userEmail,
}: {
  projectId: number;
  userEmail: string;
}) {
  const currentUser = await auth();
  if (!currentUser.userId) throw new Error("Unauthorized");

  const project = await getProjectById({ id: projectId });
  if (!project) throw new Error("Project does not exist");

  if (project.ownerId !== currentUser.userId) {
    throw new Error("You dont own this project");
  }

  const emailAddress = [userEmail];

  const cc = await clerkClient();
  const { data: users } = await cc.users.getUserList({ emailAddress });

  if (users.length === 0) {
    throw new Error("No user with that email is signed up yet");
  }

  const userId = users[0]!.id;

  await db.insert(projectMembers).values({
    projectId: projectId,
    userId: userId,
  });

  revalidatePath(`/projects`);
  return { success: true };
}

export async function deleteTeamMember({
  id,
  projectId,
}: {
  id: string;
  projectId: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (userId === id) throw new Error("Cannot delete project owner");

  const project = await getProjectById({ id: projectId });
  if (!project) throw new Error("Project does not exist");

  if (project.ownerId !== userId) {
    throw new Error("You dont own this project");
  }

  const teamMembers = await getTeamMembers({ projectId });

  if (teamMembers.some((obj) => obj.id === id)) {
    throw new Error("Team member does not exist");
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
  if (!userId) throw new Error("Unauthorized");

  const project = await getProjectById({ id: projectId });
  if (!project) throw new Error("Project does not exist");

  if (project.ownerId === userId) {
    throw new Error("Must reassign owner before leaving project");
  }
  const teamMembers = await getTeamMembers({ projectId });

  if (teamMembers.some((obj) => obj.id === userId)) {
    throw new Error("Team member does not exist");
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
  if (!userId) throw new Error("Unauthorized");

  const project = await getProjectById({ id: projectId });
  if (!project) throw new Error("No project exists with given ID");
  if (project.ownerId !== userId) {
    throw new Error("You do not own this project");
  }

  const existingTeamMembers = await getTeamMembers({ projectId });
  if (existingTeamMembers.some((obj) => obj.email === userEmail)) {
    throw new Error("Teammate already in the project");
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
    throw new Error("Already pending invitation for this user");
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
  return { success: true };
}

export async function acceptInvitation({
  invitationId,
}: {
  invitationId: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const invite = await getInvitationById({ invitationId });
  if (invite.status !== "pending") throw new Error("Invalid or expired invite");

  const cc = await clerkClient();
  const user = await cc.users.getUser(userId);
  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail) throw new Error("No email address found for current user");
  if (invite.invitedEmail !== userEmail) {
    throw new Error("This invite is not for you");
  }

  if (new Date(invite.expiresAt) < new Date()) {
    await db
      .update(projectInvitations)
      .set({ status: "expired" })
      .where(eq(projectInvitations.id, invitationId));
    throw new Error("Invitation has expired");
  }

  await db
    .update(projectInvitations)
    .set({ status: "accepted" })
    .where(eq(projectInvitations.id, invitationId));

  await db.insert(projectMembers).values({
    projectId: invite.projectId,
    userId,
  });

  revalidatePath("/");
  return { success: true };
}

export async function declineInvitation({
  invitationId,
}: {
  invitationId: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const invite = await getInvitationById({ invitationId });
  if (invite.status !== "pending") throw new Error("Invalid or expired invite");

  const cc = await clerkClient();
  const user = await cc.users.getUser(userId);
  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail) throw new Error("No email address found for current user");

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
  if (result.length === 0) throw new Error("Invalid or unauthorized");

  revalidatePath("/");
  return { success: true };
}
