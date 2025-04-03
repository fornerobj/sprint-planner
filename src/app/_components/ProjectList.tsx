"use client";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import type { Project } from "~/server/db/schema";

export function ProjectList({ projects }: { projects: Project[] }) {
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  return (
    <div className="flex gap-4">
      <div className="flex w-1/4 flex-col gap-4 rounded-lg bg-slate-800 text-center text-2xl">
        <div className="p-4">
          <h1 className="pb-2 text-3xl underline">Your projects</h1>
          {projects.map((project) => (
            <button
              key={project.id}
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
        <div className="flex-1 rounded-lg bg-slate-800 p-4">
          <h1 className="text-3xl">{selectedProject.name}</h1>
          <h2>{selectedProject.description}</h2>
        </div>
      )}
    </div>
  );
}
