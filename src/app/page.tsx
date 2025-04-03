import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ProjectList } from "./_components/ProjectList";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <main className="flex h-full flex-col bg-white p-8">
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please Sign In Above
        </div>
      </SignedOut>
      <SignedIn>
        {/* Project List*/}
        <div className="h-full w-1/3 rounded-md bg-slate-800">
          <ProjectList />
        </div>
      </SignedIn>
    </main>
  );
}
