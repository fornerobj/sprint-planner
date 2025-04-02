import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { tasks } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }

    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (!existingTask.length || existingTask[0]?.userId !== userId) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 },
      );
    }

    const category = await req.json();

    if (
      !category ||
      !["Required", "In_Progress", "Finished"].includes(category)
    ) {
      return NextResponse.json({ error: "Invalid Category" }, { status: 400 });
    }

    const updatedTask = await db
      .update(tasks)
      .set({ category, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();

    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    console.error("error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task :(" },
      { status: 500 },
    );
  }
}
