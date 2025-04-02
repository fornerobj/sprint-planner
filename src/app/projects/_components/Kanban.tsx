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
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-bold">{project.name}</h2>
      <div className="flex flex-1 text-center">
        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>Required</h1>
          {required.map((task) => (
            <Task key={task.id} task={task} />
          ))}
          <CreateTask category="Required" />
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>In Progress</h1>
          {in_progress.map((task) => (
            <Task key={task.id} task={task} />
          ))}
          <CreateTask category="In_Progress" />
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <h1>Finished</h1>
          {finished.map((task) => (
            <Task key={task.id} task={task} />
          ))}
          <CreateTask category="Finished" />
        </div>
      </div>
    </div>
  );
}
