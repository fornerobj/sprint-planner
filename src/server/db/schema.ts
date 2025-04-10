import { sql, relations } from "drizzle-orm";
import { index, pgTableCreator, pgEnum } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferColumnsDataTypes } from "drizzle-orm";

export const createTable = pgTableCreator((name) => `sprint-planner_${name}`);

export const categoryEnum = pgEnum("category", [
  "Required",
  "In_Progress",
  "Finished",
]);

export const projects = createTable("project", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  ownerId: d.varchar("userId", { length: 256 }),
  name: d.text("name").notNull(),
  description: d.text("description"),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
  members: many(projectMembers),
}));

export const projectMembers = createTable("project_member", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  projectId: d
    .integer()
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: d.varchar("userId", { length: 256 }).notNull(), // Clerk user ID
  //role: d.varchar({ length: 50 }).default("member").notNull(), // Optional: for role-based permissions
  addedAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
}));

export const tasks = createTable(
  "task",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({ length: 256 }).notNull(),
    category: categoryEnum("category").notNull(),
    userId: d.varchar("userId", { length: 256 }).notNull(),
    projectId: d.integer().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("title_idx").on(t.title)],
);

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}));

export const projectInvitations = createTable("project_invitation", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  projectId: d
    .integer()
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  invitedEmail: d.varchar("email", { length: 256 }).notNull(),
  invitedBy: d.varchar("userId", { length: 256 }).notNull(),
  status: d.varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  expiresAt: d.timestamp({ withTimezone: true }).notNull(),
}));

export const projectInvitationRelations = relations(
  projectInvitations,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectInvitations.id],
      references: [projects.id],
    }),
  }),
);

export type TaskCategory = "Required" | "In_Progress" | "Finished";
export type Task = typeof tasks.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectInvitationType = typeof projectInvitations.$inferSelect;
