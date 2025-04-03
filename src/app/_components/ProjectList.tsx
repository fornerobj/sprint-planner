"use client";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import type { Project } from "~/server/db/schema";
import { ProjectDetails } from "./ProjectDetails";

export function ProjectList({ projects }: { projects: Project[] }) {
  const [selectedProject, setSelectedProject] = useState<Project>();

  return (
    <div className="flex gap-4">
      <div className="flex w-1/4 flex-col gap-4 rounded-lg bg-slate-800 text-center text-2xl">
        <div className="p-4">
          <h1 className="pb-2 text-3xl underline">Your projects</h1>
          <div className="flex flex-col">
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
      </div>
      {selectedProject && <ProjectDetails project={selectedProject} />}
    </div>
  );
}
