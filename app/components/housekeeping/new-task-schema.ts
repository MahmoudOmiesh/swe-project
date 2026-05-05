import { z } from "zod";

export const newTaskSchema = z.object({
  type: z.enum(["cleaning", "maintenance"], {
    error: "Please select a task type",
  }),
  roomId: z.string().min(1, "Please select a room"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title is too long"),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
  assignedToId: z.string().min(1, "Please assign this task to a staff member"),
});

export type NewTaskFormValues = z.infer<typeof newTaskSchema>;
