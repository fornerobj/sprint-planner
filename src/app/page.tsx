import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ProjectList } from "./_components/ProjectList";
import { getProjectsByTeamMember } from "~/server/queries";
import { auth } from "@clerk/nextjs/server";
import type { Project } from "~/server/db/schema";
import { getTeamMembers } from "~/server/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();

  // If no user is signed in, render the SignedOut view
  if (!userId) {
    return (
      <main className="h-full p-8">
        <div className="h-full w-full text-center text-2xl">
          Please Sign In Above
        </div>
      </main>
    );
  }
  const projects = await getProjectsByTeamMember();
  const projectsWithMembers = await Promise.all(
    projects.map(async (project) => {
      const members = await getTeamMembers({ projectId: project.id });
      return { ...project, members };
    }),
  );
  return (
    <main className="h-full p-8">
      <SignedIn>
        {/* Project List*/}
        <div className="h-full rounded-md">
          <ProjectList projects={projectsWithMembers} />
        </div>
      </SignedIn>
    </main>
  );
}
