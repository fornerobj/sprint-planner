"use client";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import type { Project } from "~/server/db/schema";
import type { TeamMember } from "~/server/queries";
interface ProjectWithMembers extends Project {
  members: TeamMember[];
}

type ProjectListProps = {
  projects: ProjectWithMembers[];
};

export function ProjectList({ projects }: ProjectListProps) {
  const [selectedProject, setSelectedProject] = useState<
    ProjectWithMembers | undefined
  >();

  return (
    <div className="flex gap-4">
      <div className="flex w-1/4 flex-col gap-4 rounded-lg bg-slate-800 text-center text-2xl">
        <div className="p-4">
          <h1 className="pb-2 text-3xl underline">Your projects</h1>
          {projects.map((project) => (
            <button
              key={project.id!}
              onClick={() => {
                if (selectedProject !== project) {
                  setSelectedProject(project);
                } else {
                  redirect(`/projects/${project.id}`);
                }
              }}
              className="hover:cursor-pointer hover:text-blue-500"
            >
              {project.name}
            </button>
          ))}
        </div>
      </div>
      {selectedProject && (
        <div className="flex flex-1 flex-col items-start rounded-lg bg-slate-800 p-4">
          <h1 className="text-3xl">{selectedProject.name}</h1>
          <h2 className="text-xl">{selectedProject.description}</h2>
          <h2 className="text-xl">Team members:</h2>
          {selectedProject.members.map((member) => (
            <h1 key={member.id}>{member.name}</h1>
          ))}

          <button
            className="text-xl hover:cursor-pointer hover:text-blue-500"
            onClick={() => redirect(`/projects/${selectedProject.id}`)}
          >
            Go to project
          </button>
        </div>
      )}
    </div>
  );
}
