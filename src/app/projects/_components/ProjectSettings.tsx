"use client";
import { updateProject } from "~/server/mutations";
import { getProjectById } from "~/server/queries";
import type { Project } from "~/server/db/schema";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProjectSettings({ project }: { project: Project }) {
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
    </div>
  );
}
