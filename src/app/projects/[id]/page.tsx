import { Kanban } from "../_components/Kanban";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function Project({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  return (
    <main className="flex min-h-screen flex-col gap-4">
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please Sign In Above
        </div>
      </SignedOut>
      <SignedIn>
        <Kanban projectId={id} />
      </SignedIn>
    </main>
  );
}
