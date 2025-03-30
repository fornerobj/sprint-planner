import { db } from "~/server/db";
import { activities } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const required = await db
    .select()
    .from(activities)
    .where(eq(activities.category, "Required"));

  const in_progress = await db
    .select()
    .from(activities)
    .where(eq(activities.category, "In_Progress"));

  const finished = await db
    .select()
    .from(activities)
    .where(eq(activities.category, "Finished"));

  return (
    <main className="flex min-h-screen flex-col gap-4">
      {/* Container for the 3 columns */}
      <div className="flex flex-1 text-center">
        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>Required</h1>
          {required.map((activity) => (
            <div key={activity.id} className="bg-slate-800 p-4">
              <h1>{activity.title}</h1>
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>In Progress</h1>
          {in_progress.map((activity) => (
            <div key={activity.id} className="bg-slate-800 p-4">
              <h1>{activity.title}</h1>
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>Finished</h1>
          {finished.map((activity) => (
            <div key={activity.id} className="bg-slate-800 p-4">
              <h1>{activity.title}</h1>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
