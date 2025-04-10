import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ProjectList } from "./_components/ProjectList";
import { MyInvitations } from "./_components/Invitations";
import {
  getMyInvitations,
  getProjectsByTeamMember,
  getTeamMembers,
} from "~/server/queries";
import { auth } from "@clerk/nextjs/server";
import { ErrorPopup } from "./projects/_components/ErrorPopout";

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
  if (projects.error) {
    return <h1>Error: {projects.error}</h1>;
  }
  const invitations = await getMyInvitations();
  if (invitations.error) {
    return <h1>Error: {invitations.error}</h1>;
  }

  const projectsWithTeamMembers = await Promise.all(
    projects.data!.map(async (project) => {
      const teamMembers = await getTeamMembers({ projectId: project.id });
      return {
        ...project,
        members: teamMembers.data ? teamMembers.data : [],
      };
    }),
  );

  return (
    <main className="h-full p-8">
      <SignedIn>
        {/* Invitation List */}
        <MyInvitations invites={invitations.data!} />
        {/* Project List*/}
        <div className="h-full rounded-md">
          <ProjectList projects={projectsWithTeamMembers} userId={userId} />
        </div>
      </SignedIn>
    </main>
  );
}
