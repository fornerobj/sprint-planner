import { getProjectsByTeamMember } from "~/server/queries";

export async function ProjectList() {
  const projects = await getProjectsByTeamMember();

  return (
    <div className="flex flex-col gap-4 text-center text-lg">
      <h1>Your projects</h1>
      {projects.map((project) => (
        <h2 key={project.id}>{project.name}</h2>
      ))}
    </div>
  );
}
