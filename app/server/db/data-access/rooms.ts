import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { rooms } from "@/server/db/schema";

type RoomServiceMode = "cleaning" | "maintenance";

/**
 * List all rooms with minimal reservation data —
 * just enough to compute status and display cards.
 */
export async function listRooms() {
  return db.query.rooms.findMany({
    with: {
      reservations: {
        where: (reservations, { eq }) => eq(reservations.status, "checked-in"),
        columns: {
          id: true,
          checkOutAt: true,
        },
        with: {
          guest: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
        },
        limit: 1,
      },
    },
    orderBy: (rooms, { asc }) => [asc(rooms.number)],
  });
}

/** Get a single room by ID with its active reservation. */
export async function getRoomById(id: number) {
  return db.query.rooms.findFirst({
    where: eq(rooms.id, id),
    with: {
      reservations: {
        where: (reservations, { eq }) => eq(reservations.status, "checked-in"),
        with: {
          guest: true,
          services: {
            with: { service: true },
            orderBy: (rs, { asc }) => [asc(rs.createdAt)],
          },
        },
        limit: 1,
      },
    },
  });
}

/** Get a single room by its room number. */
export async function getRoomByNumber(number: string) {
  return db.query.rooms.findFirst({
    where: eq(rooms.number, number),
  });
}

/** Update a room's service mode (cleaning, maintenance, or null to clear). */
export async function updateRoomServiceMode(
  id: number,
  serviceMode: RoomServiceMode | null,
  maintenanceNote?: string,
) {
  const [updated] = await db
    .update(rooms)
    .set({
      serviceMode,
      maintenanceNote:
        serviceMode === "maintenance" ? (maintenanceNote ?? null) : null,
    })
    .where(eq(rooms.id, id))
    .returning();

  return updated;
}
