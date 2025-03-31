"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Activity = {
  id: number;
  title: string;
  category: "Required" | "In_Progress" | "Finished";
};

export function Task({ activity }: { activity: Activity }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const moveTask = async (
    newCategory: "Required" | "In_Progress" | "Finished",
  ) => {
    if (newCategory === activity.category || isUpdating) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/activities/${activity.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: newCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update activity");
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating activity", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const canMoveLeft = activity.category !== "Required";
  const canMoveRight = activity.category !== "Finished";

  const prevCategory =
    activity.category === "In_Progress"
      ? "Required"
      : activity.category === "Finished"
        ? "In_Progress"
        : null;

  const nextCategory =
    activity.category === "Required"
      ? "In_Progress"
      : activity.category === "In_Progress"
        ? "Finished"
        : null;

  return (
    <div className="flex items-center rounded-md bg-slate-800 p-4">
      {canMoveLeft && (
        <button
          onClick={() => moveTask(prevCategory as "Required" | "In_Progress")}
          disabled={isUpdating}
          className="mr-3 text-gray-400 hover:text-white disabled:opacity-50"
          aria-label="Move Left"
        >
          ←
        </button>
      )}

      <h1 className="flex-1">{activity.title}</h1>

      {canMoveRight && (
        <button
          onClick={() => moveTask(nextCategory as "In_Progress" | "Finished")}
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
