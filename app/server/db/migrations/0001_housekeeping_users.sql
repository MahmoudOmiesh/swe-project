-- Drop the old FK from housekeeping_tasks → housekeeping_staff and the staff table.
ALTER TABLE "housekeeping_tasks" DROP CONSTRAINT IF EXISTS "housekeeping_tasks_assigned_to_id_housekeeping_staff_id_fk";--> statement-breakpoint
DROP TABLE IF EXISTS "housekeeping_staff" CASCADE;--> statement-breakpoint

-- Convert assigned_to_id from integer to text so it can reference user.id.
-- Existing values are dropped (they pointed at the old housekeeping_staff
-- table which no longer exists).
ALTER TABLE "housekeeping_tasks"
  ALTER COLUMN "assigned_to_id" DROP DEFAULT,
  ALTER COLUMN "assigned_to_id" SET DATA TYPE text USING NULL;--> statement-breakpoint

UPDATE "housekeeping_tasks" SET "assigned_to_id" = NULL;--> statement-breakpoint

ALTER TABLE "housekeeping_tasks" ADD CONSTRAINT "housekeeping_tasks_assigned_to_id_user_id_fk"
  FOREIGN KEY ("assigned_to_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- Default user role is now 'user' (no privileges); managers/receptionists/
-- housekeeping must be granted explicitly via DB update.
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';
