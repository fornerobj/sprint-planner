import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let id = 1;
  const required = [
    "Scaffold basic ui with mock data",
    "Set up database",
    "Routing/Post page",
  ];
  const in_progress = [
    "Attach db to ui",
    "Add auth",
    "Add activity creation",
    "Error management",
  ];
  const finished = [
    "delete button (with server actions???)",
    "Analytics?",
    "Rate Limiting?",
  ];

  const posts = await db.query.posts.findMany();

  return (
    <main className="flex min-h-screen flex-col gap-4">
      {/* Container for the 3 columns */}
      <div className="flex flex-1 text-center">
        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>Required</h1>
          {required.map((activity) => (
            <div key={id++} className="bg-slate-800 p-4">
              <h1>{activity}</h1>
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>In Progress</h1>
          {in_progress.map((activity) => (
            <div key={id++} className="bg-slate-800 p-4">
              <h1>{activity}</h1>
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>Finished</h1>
          {finished.map((activity) => (
            <div key={id++} className="bg-slate-800 p-4">
              <h1>{activity}</h1>
            </div>
          ))}
        </div>
      </div>
      <div>
        {posts.map((post) => (
          <div key={post.id} className="bg-slate-800 p-4">
            <h1>{post.name}</h1>
          </div>
        ))}
      </div>
    </main>
  );
}
