import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { activities } from "~/server/db/schema";
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
      return NextResponse.json(
        { error: "Invalid activity id" },
        { status: 400 },
      );
    }

    const existingActivity = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id))
      .limit(1);

    if (!existingActivity.length || existingActivity[0]?.userId !== userId) {
      return NextResponse.json(
        { error: "Activity not found or unauthorized" },
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

    const updatedActivity = await db
      .update(activities)
      .set({ category, updatedAt: new Date() })
      .where(eq(activities.id, id))
      .returning();

    return NextResponse.json(updatedActivity[0]);
  } catch (error) {
    console.error("error updating activity:", error);
    return NextResponse.json(
      { error: "Failed to update activity :(" },
      { status: 500 },
    );
  }
}
