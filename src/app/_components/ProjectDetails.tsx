"use server";
import type { Project } from "~/server/db/schema";
import { getTeamMembers } from "~/server/queries";
import { redirect } from "next/navigation";

export async function ProjectDetails({ project }: { project: Project }) {
  const members = await getTeamMembers({ projectId: project.id });
  return (
    <div className="flex flex-1 flex-col items-start rounded-lg bg-slate-800 p-4">
      <h1 className="text-3xl">{project.name}</h1>
      <h2 className="text-xl">{project.description}</h2>
      <h2 className="text-xl">Team members:</h2>
      {members.map((member) => (
        <h1 key={member.id}>{member.name}</h1>
      ))}

      <button
        className="text-xl hover:cursor-pointer hover:text-blue-500"
        onClick={() => redirect(`/projects/${project.id}`)}
      >
        Go to project
      </button>
    </div>
  );
}
