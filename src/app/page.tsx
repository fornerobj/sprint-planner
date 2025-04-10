import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ProjectList } from "./_components/ProjectList";
import {
  getMyInvitations,
  getProjectsByTeamMember,
  getTeamMembers,
} from "~/server/queries";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();

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
  const invitations = await getMyInvitations();

  return (
    <main className="h-full p-8">
      <SignedIn>
        {/* Project List*/}
        <div className="h-full rounded-md">
          <ProjectList projects={projects} userId={userId} />
        </div>
      </SignedIn>
    </main>
  );
}
