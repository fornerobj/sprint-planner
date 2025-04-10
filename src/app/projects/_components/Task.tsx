"use client";

import { useState, useOptimistic, startTransition } from "react";
import type { TaskCategory } from "~/server/db/schema";
import { updateTaskCategory } from "~/server/mutations";
import { TrashIcon } from "~/app/_utils/Icons";
import { deleteTask } from "~/server/mutations";

type Task = {
  id: number;
  title: string;
  category: TaskCategory;
};

export function TaskCard({ task }: { task: Task }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const [optimisticTask, setOptimisticTask] = useOptimistic(
    task,
    (state, newCategory: TaskCategory) => ({
      ...state,
      category: newCategory,
    }),
  );

  const moveTask = async (newCategory: TaskCategory) => {
    if (newCategory === optimisticTask.category || isUpdating) return;

    setIsUpdating(true);

    startTransition(() => {
      setOptimisticTask(newCategory);
    });

    try {
      await updateTaskCategory({
        id: task.id,
        newCategory,
      });
    } catch (error) {
      console.error("Error updating task", error);
      startTransition(() => {
        setOptimisticTask(task.category);
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const canMoveLeft = optimisticTask.category !== "Required";
  const canMoveRight = optimisticTask.category !== "Finished";

  const prevCategory =
    optimisticTask.category === "In_Progress"
      ? "Required"
      : optimisticTask.category === "Finished"
        ? "In_Progress"
        : null;

  const nextCategory =
    optimisticTask.category === "Required"
      ? "In_Progress"
      : optimisticTask.category === "In_Progress"
        ? "Finished"
        : null;

  return (
    <div className="flex items-center rounded-md bg-slate-800 p-4 shadow-md transition-all duration-150 hover:bg-slate-700">
      {canMoveLeft && (
        <button
          onClick={() => moveTask(prevCategory as TaskCategory)}
          disabled={isUpdating}
          className="mr-3 flex h-8 w-8 items-center justify-center rounded-md text-gray-300 transition-colors hover:cursor-pointer hover:bg-slate-600 hover:text-white disabled:opacity-50"
          aria-label="Move Left"
        >
          ←
        </button>
      )}

      <h1 className="flex-1 truncate font-medium">{optimisticTask.title}</h1>

      <div className="ml-2 flex space-x-2">
        {isUpdating && (
          <span className="self-center text-xs text-gray-400">Updating...</span>
        )}
        {canMoveRight && (
          <button
            onClick={() => moveTask(nextCategory as TaskCategory)}
            disabled={isUpdating}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-slate-600 hover:text-white disabled:opacity-50"
            aria-label="Move right"
          >
            →
          </button>
        )}
        <button
          onClick={() => deleteTask({ id: task.id })}
          disabled={isUpdating}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
          aria-label="Delete task"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
