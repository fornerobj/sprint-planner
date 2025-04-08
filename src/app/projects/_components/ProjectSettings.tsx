"use client";
import {
  addTeamMember,
  deleteTeamMember,
  updateProject,
} from "~/server/mutations";
import { getProjectById } from "~/server/queries";
import type { Project } from "~/server/db/schema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TeamMember } from "~/server/queries";
import { TrashIcon } from "~/app/_utils/Icons";
import { setEnvironmentData } from "worker_threads";

export function ProjectSettings({
  project,
  team,
}: {
  project: Project;
  team: TeamMember[];
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

      await updateProject({
        id: project.id,
        name: name || null,
        description: description || null,
      });

      // Refresh the page to show the updates
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  }

  const [isAdding, setIsAdding] = useState(false);

  async function handleAddTeamMember(formData: FormData) {
    setIsAdding(true);
    setError(null);
    try {
      const email = formData.get("email") as string;

      await addTeamMember({ projectId: project.id, userEmail: email });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add team member",
      );
      alert(err);
    } finally {
      setIsAdding(false);
    }
  }

  const [deleting, setDeleting] = useState(false);
  async function handleDeleteTeamMember(id: string, projectId: number) {
    setDeleting(true);
    setError(null);

    try {
      await deleteTeamMember({ id, projectId });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete team member",
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
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
        <form className="flex flex-col gap-4" action={handleAddTeamMember}>
          <label className="bg-slate-900 pl-4">
            Team Member email:
            <input className="m-4" type="text" name="email" />
          </label>
          <button
            type="submit"
            disabled={isAdding}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:cursor-pointer hover:bg-blue-600 disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add Teammember"}
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
      </div>
    </div>
  );
}
