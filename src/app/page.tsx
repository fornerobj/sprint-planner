import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ProjectList } from "./_components/ProjectList";
import { getProjectsByTeamMember } from "~/server/queries";
import { auth } from "@clerk/nextjs/server";
import type { Project } from "~/server/db/schema";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await auth();
  const projects: Project[] = [];
  if (user) {
    const projects = await getProjectsByTeamMember();
  }
  return (
    <main className="h-full p-8">
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please Sign In Above
        </div>
      </SignedOut>
      <SignedIn>
        {/* Project List*/}
        <div className="h-full rounded-md">
          <ProjectList projects={projects} />
        </div>
      </SignedIn>
    </main>
  );
}
