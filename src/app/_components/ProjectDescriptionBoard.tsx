import type { Project } from "~/server/db/schema";
import type { TeamMember } from "~/server/queries";
import { deleteProject } from "~/server/mutations";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProjectWithTeamMember = Project & {
  members: TeamMember[];
};

export default function ProjectDescriptionBoard({
  project,
  onDelete,
}: {
  project: ProjectWithTeamMember;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await deleteProject({ id: project.id });
      onDelete(); // Call the callback to notify parent
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-start gap-4 rounded-lg bg-slate-800 p-4">
      <h1 className="text-3xl">{project.name}</h1>
      <h2 className="text-xl">{project.description}</h2>
      {project.members?.length > 0 ? (
        <div>
          <h2 className="text-xl">Team members:</h2>
          {project.members.map((member) => (
            <h1 key={member.id}>{member.name}</h1>
          ))}
        </div>
      ) : (
        <div>
          <h2 className="text-xl">Team members:</h2>
          <h2>No team members yet</h2>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => router.push(`/projects/${project.id}`)}
          className="rounded bg-blue-600 px-4 py-2 hover:cursor-pointer hover:bg-blue-700"
        >
          Open Project
        </button>
        <button
          onClick={handleDeleteProject}
          disabled={isDeleting}
          className="rounded bg-red-600 px-4 py-2 hover:cursor-pointer hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete Project"}
        </button>
      </div>
    </div>
  );
}
