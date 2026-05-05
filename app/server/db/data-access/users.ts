import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";

/** List all users, ordered by most recently created. */
export async function listUsers() {
  return db.query.user.findMany({
    orderBy: (u, { desc }) => [desc(u.createdAt)],
  });
}

/** Update a user's role. Returns the updated row, or undefined if not found. */
export async function updateUserRole(id: string, role: string) {
  const [row] = await db
    .update(user)
    .set({ role })
    .where(eq(user.id, id))
    .returning();
  return row;
}
