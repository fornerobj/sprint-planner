import { TaskCard } from "./Task";
import { CreateTask } from "./CreateTask";
import type { Project, Task } from "~/server/db/schema";

type propType = Project & {
  tasks: Task[];
};

export function Kanban({ project }: { project: propType }) {
  const tasks = project.tasks;
  if (!tasks || !project) {
    return null;
  }

  const required = tasks.filter((task) => task.category === "Required");
  const in_progress = tasks.filter((task) => task.category === "In_Progress");
  const finished = tasks.filter((task) => task.category === "Finished");

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden py-4 pr-4">
      <h2 className="pl-6 text-3xl font-bold">{project.name}</h2>
      <div className="flex max-h-full flex-1 overflow-hidden text-center">
        <div className="flex max-h-full flex-1 flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold">Required</h1>
          <CreateTask category="Required" projectId={project.id} />
          <div className="flex flex-col gap-4 overflow-y-auto">
            {required.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div className="flex max-h-full flex-1 flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold">In Progress</h1>
          <CreateTask category="In_Progress" projectId={project.id} />
          <div className="flex flex-col gap-4 overflow-y-auto">
            {in_progress.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div className="flex max-h-full flex-1 flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold">Finished</h1>
          <CreateTask category="Finished" projectId={project.id} />
          <div className="flex flex-col gap-4 overflow-y-auto">
            {finished.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
