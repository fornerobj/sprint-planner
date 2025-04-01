"use client";

import { useState, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import type { TaskCategory } from "~/server/db/schema";
import { updateActivityCategory } from "~/server/mutations";

type Activity = {
  id: number;
  title: string;
  category: TaskCategory;
};

export function Task({ activity }: { activity: Activity }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const [optimisticActivity, setOptimisticActivity] = useOptimistic(
    activity,
    (state, newCategory: TaskCategory) => ({
      ...state,
      category: newCategory,
    }),
  );

  const moveTask = async (newCategory: TaskCategory) => {
    if (newCategory === optimisticActivity.category || isUpdating) return;

    setIsUpdating(true);

    setOptimisticActivity(newCategory);

    try {
      await updateActivityCategory({
        id: activity.id,
        newCategory,
      });

      router.refresh();
    } catch (error) {
      console.error("Error updating activity", error);
      setOptimisticActivity(activity.category);
    } finally {
      setIsUpdating(false);
    }
  };

  const canMoveLeft = optimisticActivity.category !== "Required";
  const canMoveRight = optimisticActivity.category !== "Finished";

  const prevCategory =
    optimisticActivity.category === "In_Progress"
      ? "Required"
      : optimisticActivity.category === "Finished"
        ? "In_Progress"
        : null;

  const nextCategory =
    optimisticActivity.category === "Required"
      ? "In_Progress"
      : optimisticActivity.category === "In_Progress"
        ? "Finished"
        : null;

  return (
    <div className="flex items-center rounded-md bg-slate-800 p-4">
      {canMoveLeft && (
        <button
          onClick={() => moveTask(prevCategory as TaskCategory)}
          disabled={isUpdating}
          className="mr-3 text-gray-400 hover:text-white disabled:opacity-50"
          aria-label="Move Left"
        >
          ←
        </button>
      )}

      <h1 className="flex-1">{optimisticActivity.title}</h1>

      {canMoveRight && (
        <button
          onClick={() => moveTask(nextCategory as TaskCategory)}
          disabled={isUpdating}
          className="mr-3 text-gray-400 hover:text-white disabled:opacity-50"
          aria-label="Move right"
        >
          →
        </button>
      )}

      {isUpdating && (
        <span className="ml-2 text-xs text-gray-400">Updating...</span>
      )}
    </div>
  );
}
