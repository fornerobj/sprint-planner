"use client";

import { useState } from "react";
import type { Project } from "~/server/db/schema";
import type { TeamMember } from "~/server/queries";
import { useRouter } from "next/navigation";
import { CreateProject } from "./CreateProject";
import ProjectDescriptionBoard from "./ProjectDescriptionBoard";
import { Star } from "../_utils/Icons";

type ProjectWithTeamMembers = Project & {
  members: TeamMember[];
};

export function ProjectList({
  projects,
  userId,
}: {
  projects: ProjectWithTeamMembers[];
  userId: string;
}) {
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithTeamMembers | null>(null);
  const router = useRouter();

  const handleProjectDeleted = () => {
    setSelectedProject(null);
  };

  return (
    <div className="flex gap-4">
      <div className="flex w-1/4 flex-col gap-4 rounded-lg bg-slate-800 text-center text-2xl">
        <div className="p-4">
          <div className="flex justify-around pb-4">
            <h1 className="pb-2 text-3xl underline">Your projects</h1>
            <CreateProject />
          </div>
          <div className="flex flex-col">
            {projects.map((project) => (
              <div key={project.id} className="flex justify-around">
                <button
                  key={project.id!}
                  onClick={() => {
                    if (selectedProject?.id !== project.id) {
                      setSelectedProject(project);
                    } else {
                      setSelectedProject(null);
                    }
                  }}
                  className={`w-3/4 truncate hover:cursor-pointer hover:text-blue-500 ${
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
        <ProjectDescriptionBoard
          project={selectedProject}
          onDelete={handleProjectDeleted}
        />
      )}
    </div>
  );
}
