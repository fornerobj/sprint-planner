import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export function TopNav() {
  return (
    <nav className="flex h-20 w-full items-center justify-between border-b p-4 text-xl font-semibold">
      <div>Sprint Planner</div>
      <div>
        <SignedOut>
          <SignInButton>
            <button className="hover:cursor-pointer">Sign In</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
