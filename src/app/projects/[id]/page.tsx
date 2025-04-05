import { Kanban } from "../_components/Kanban";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SideNav } from "../_components/SideNav";

export const dynamic = "force-dynamic";

export default async function Project({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
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
            <SideNav />
          </div>
          <div className="flex-1 p-4">
            <Kanban projectId={id} />
          </div>
        </div>
      </SignedIn>
    </main>
  );
}
