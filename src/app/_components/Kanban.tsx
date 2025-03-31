import { CreateActivity } from "./CreateActivity";
import { Task } from "./Task";
import { getMyActivities } from "~/server/queries";

export async function Kanban() {
  const activities = await getMyActivities();
  const required = activities.filter(
    (activity) => activity.category === "Required",
  );
  const in_progress = activities.filter(
    (activity) => activity.category === "In_Progress",
  );
  const finished = activities.filter(
    (activity) => activity.category === "Finished",
  );

  return (
    <div className="flex flex-col gap-6 p-4">
      <CreateActivity />
      <div className="flex flex-1 text-center">
        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>Required</h1>
          {required.map((activity) => (
            <Task key={activity.id} activity={activity} />
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>In Progress</h1>
          {in_progress.map((activity) => (
            <Task key={activity.id} activity={activity} />
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>Finished</h1>
          {finished.map((activity) => (
            <Task key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}
