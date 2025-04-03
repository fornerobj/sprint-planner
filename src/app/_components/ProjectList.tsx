"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import type { Project } from "~/server/db/schema";
import { getTeamMembers } from "~/server/queries";
import type { TeamMember } from "~/server/queries";
import { LoadingSpinner } from "../_utils/LoadingSpinner";
import { useRouter } from "next/navigation";

export function ProjectList({
  projects,
  userId,
}: {
  projects: Project[];
  userId: string;
}) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch team members when a project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchTeamMembers(selectedProject.id);
    } else {
      setTeamMembers([]);
    }
  }, [selectedProject]);

  const fetchTeamMembers = async (projectId: number) => {
    setLoading(true);
    try {
      const members = await getTeamMembers({ projectId });
      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  function Star() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex w-1/4 flex-col gap-4 rounded-lg bg-slate-800 text-center text-2xl">
        <div className="p-4">
          <h1 className="pb-2 text-3xl underline">Your projects</h1>
          <div className="flex flex-col">
            {projects.map((project) => (
              <div key={project.id} className="flex justify-around">
                <button
                  key={project.id!}
                  onClick={() => {
                    if (selectedProject?.id !== project.id) {
                      setSelectedProject(project);
                    } else {
                      router.push(`/projects/${selectedProject.id}`);
                    }
                  }}
                  className={`hover:cursor-pointer hover:text-blue-500 ${
                    selectedProject?.id === project.id ? "text-blue-500" : ""
                  }`}
                >
                  {project.name}
                </button>
                {project.ownerId === userId && <Star />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedProject && (
        <div className="flex flex-1 flex-col items-start rounded-lg bg-slate-800 p-4">
          <h1 className="text-3xl">{selectedProject.name}</h1>
          <h2 className="text-xl">{selectedProject.description}</h2>

          {loading ? (
            <LoadingSpinner />
          ) : teamMembers.length > 0 ? (
            <>
              <h2 className="mt-4 text-xl">Team members:</h2>
              {teamMembers.map((member) => (
                <h1 key={member.id}>{member.name}</h1>
              ))}
            </>
          ) : (
            <>
              <h2 className="mt-4 text-xl">Team members:</h2>
              <h2>No team members yet</h2>
            </>
          )}

          <button
            onClick={() => router.push(`/projects/${selectedProject.id}`)}
            className="mt-6 rounded bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            Open Project Board
          </button>
        </div>
      )}
    </div>
  );
}
