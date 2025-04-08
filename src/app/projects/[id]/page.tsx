import { Kanban } from "../_components/Kanban";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SideNav } from "../_components/SideNav";
import { ProjectSettings } from "../_components/ProjectSettings";
import type { Primitive } from "zod";
import { getProjectById, getTeamMembers } from "~/server/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Project({
  params,
  searchParams,
}: {
  params: Promise<{ id: number }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id } = await params;
  const { view } = (await searchParams) || "board";
  const project = await getProjectById({ id });
  const team = await getTeamMembers({ projectId: id });

  return (
    <main className="flex h-full max-h-fit flex-col gap-4">
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please Sign In Above
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex h-full max-h-fit">
          <div className="pt-4 pl-4">
            <SideNav projectId={id} />
          </div>
          <div className="flex-1 p-4">
            {(view === "board" || view === undefined || view === null) && (
              <Kanban projectId={id} />
            )}
            {view === "settings" && (
              <ProjectSettings project={project!} team={team} />
            )}
          </div>
        </div>
      </SignedIn>
    </main>
  );
}
