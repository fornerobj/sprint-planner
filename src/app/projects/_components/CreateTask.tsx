"use client";
import { useState } from "react";
import type { TaskCategory } from "~/server/db/schema";
import { createTask } from "~/server/mutations";
import { PlusSignWithCirlce } from "~/app/_utils/Icons";

export function CreateTask({
  category,
  projectId,
}: {
  category: TaskCategory;
  projectId: number;
}) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setError(null);
      await createTask({ content, category, projectId });
      setContent("");
      console.log("Task created");
    } catch (error) {
      console.error("Error creating task:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create task",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="flex items-center rounded-md bg-slate-800 p-4">
      <form action={handleSubmit} className="w-full">
        <div className="flex w-full justify-between gap-2">
          <label htmlFor="content"></label>
          <input
            id="content"
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="grow rounded border border-slate-700 p-2 text-white"
            placeholder="Add a new task"
            required
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="justify-self-end hover:cursor-pointer"
            disabled={isSubmitting}
          >
            <PlusSignWithCirlce />
          </button>
        </div>
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </form>
    </div>
  );
}
