import { Task } from "./Task";
import { getProjectById, getProjectTasks } from "~/server/queries";
import { CreateTask } from "./CreateTask";

export async function Kanban({ projectId }: { projectId: number }) {
  const project = await getProjectById({ id: projectId });
  const tasks = await getProjectTasks({ projectId });

  if (!tasks || !project) {
    return null;
  }

  const required = tasks.filter((task) => task.category === "Required");
  const in_progress = tasks.filter((task) => task.category === "In_Progress");
  const finished = tasks.filter((task) => task.category === "Finished");

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden p-4">
      <h2 className="text-xl font-bold">{project.name}</h2>
      <div className="flex max-h-full flex-1 overflow-hidden text-center">
        <div className="flex max-h-full flex-1 flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold">Required</h1>
          <CreateTask category="Required" projectId={projectId} />
          <div className="flex flex-col gap-4 overflow-y-auto">
            {required.map((task) => (
              <Task key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div className="flex max-h-full flex-1 flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold">In Progress</h1>
          <CreateTask category="In_Progress" projectId={projectId} />
          <div className="flex flex-col gap-4 overflow-y-auto">
            {in_progress.map((task) => (
              <Task key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div className="flex max-h-full flex-1 flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold">Finished</h1>
          <CreateTask category="Finished" projectId={projectId} />
          <div className="flex flex-col gap-4 overflow-y-auto">
            {finished.map((task) => (
              <Task key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
