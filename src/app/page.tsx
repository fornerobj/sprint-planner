import Link from "next/link";

export default function HomePage() {
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
  return (
    <main className="">
      <div className="flex flex-col">
        <header className="flex h-8 justify-around">
          <h1>KANBAN</h1>
          <p>Sign in</p>
          <p>Home</p>
        </header>
        <div className="flex text-center">
          <div className="flex h-full w-1/3 flex-col">
            <h1>Required</h1>
            {required.map((activity) => (
              <div key={id++} className="bg-slate-500 p-4">
                <h1>{activity}</h1>
              </div>
            ))}
          </div>
          <div className="flex h-full w-1/3 flex-col">
            <h1>In Progress</h1>
            {in_progress.map((activity) => (
              <div key={id++} className="bg-slate-500 p-4">
                <h1>{activity}</h1>
              </div>
            ))}
          </div>
          <div className="flex h-full w-1/3 flex-col">
            <h1>Finished</h1>
            {finished.map((activity) => (
              <div key={id++} className="bg-slate-500 p-4">
                <h1>{activity}</h1>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
