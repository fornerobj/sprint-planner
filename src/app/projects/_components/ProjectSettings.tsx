"use client";
import {
  deleteTeamMember,
  inviteTeamMember,
  updateProject,
} from "~/server/mutations";
import type { Project } from "~/server/db/schema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TeamMember } from "~/server/queries";
import { TrashIcon } from "~/app/_utils/Icons";
import { ErrorPopup } from "./ErrorPopout";

export function ProjectSettings({
  project,
  team,
  invites,
}: {
  project: Project;
  team: TeamMember[];
  invites: any[];
}) {
  if (!project) return <h1>You have no project</h1>;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleUpdateProject(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;

      const res = await updateProject({
        id: project.id,
        name: name || null,
        description: description || null,
      });
      if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  }

  const [isInviting, setIsInviting] = useState(false);
  async function handleInviteTeamMember(formData: FormData) {
    setIsInviting(true);
    setError(null);
    try {
      const email = formData.get("email") as string;
      const res = await inviteTeamMember({
        projectId: project.id,
        userEmail: email,
      });
      console.log(res);
      if (res?.error) {
        setError(res.error);
      }

      // Clear the form
      formData.set("email", "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send invitation",
      );
    } finally {
      setIsInviting(false);
    }
  }

  const [deleting, setDeleting] = useState(false);
  async function handleDeleteTeamMember(id: string, projectId: number) {
    setDeleting(true);
    setError(null);

    try {
      const res = await deleteTeamMember({ id, projectId });
      if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete team member",
      );
    } finally {
      setDeleting(false);
    }
  }

  const clearError = () => setError(null);

  return (
    <>
      <ErrorPopup message={error} onClose={clearError} />
      <div className="flex justify-around">
        <div className="flex">
          <form className="flex flex-col gap-4" action={handleUpdateProject}>
            <label className="bg-slate-900 pl-4">
              Update Name:
              <input
                defaultValue={project?.name}
                className="m-4"
                type="text"
                name="name"
              />
            </label>
            <label className="h-32 bg-slate-900 pl-4">
              Update Description:
              <input
                defaultValue={project?.description || "Add a description"}
                className="h-24 p-4"
                type="text"
                name="description"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Project"}
            </button>
          </form>
        </div>
        <div className="flex flex-col">
          <form className="flex flex-col gap-4" action={handleInviteTeamMember}>
            <label className="bg-slate-900 pl-4">
              Invite by email:
              <input className="m-4" type="email" name="email" required />
            </label>
            <button
              type="submit"
              disabled={isInviting}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-600 disabled:opacity-50"
            >
              {isInviting ? "Sending..." : "Send Invitation"}
            </button>
          </form>

          <div className="p-4">
            {team.map((t) => (
              <div key={t.id} className="flex p-1">
                <li>{t.email}</li>
                <button
                  disabled={deleting}
                  onClick={() => handleDeleteTeamMember(t.id, project.id)}
                  className="hover:cursor-pointer"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 p-4">
            <h2 className="text-xl">Pending Invitations</h2>
            {invites.length === 0 ? (
              <p className="text-slate-400">No pending invitations</p>
            ) : (
              invites
                .filter((inv) => inv.status === "pending")
                .map((invitation) => (
                  <div key={invitation.id} className="flex items-center p-1">
                    <li className="flex-1">{invitation.invitedEmail}</li>
                    <span className="text-sm text-yellow-500">Pending</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
