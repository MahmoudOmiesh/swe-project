"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";

import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { newTaskSchema, type NewTaskFormValues } from "./new-task-schema";

// ─── Layout helpers (match booking panel look) ─────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-[7px] text-[9px] font-medium uppercase tracking-widest"
      style={{ color: colors.textMuted }}
    >
      {children}
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-[3px] text-[9px] font-medium uppercase tracking-[0.08em]"
      style={{ color: colors.textMuted }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: "0.5px", background: colors.border2 }} />;
}

function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-0.5 text-[9px] text-red-500">{message}</p>;
}

// ─── Panel ──────────────────────────────────────────────────────────────────

interface NewTaskPanelProps {
  onClose: () => void;
}

export function NewTaskPanel({ onClose }: NewTaskPanelProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ── Form setup ──────────────────────────────────────────────────────────────

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewTaskFormValues>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: {
      type: undefined,
      roomId: "",
      title: "",
      priority: "medium",
      notes: "",
      assignedToId: "",
    },
  });

  // ── Queries ─────────────────────────────────────────────────────────────────

  const { data: availableRooms = [], isLoading: roomsLoading } = useQuery(
    trpc.hotel.housekeeping.availableRooms.queryOptions(),
  );

  const { data: staff = [], isLoading: staffLoading } = useQuery(
    trpc.hotel.housekeeping.staff.queryOptions(),
  );

  // ── Mutation ────────────────────────────────────────────────────────────────

  const createTask = useMutation(
    trpc.hotel.housekeeping.createTask.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
        onClose();
      },
    }),
  );

  function onSubmit(data: NewTaskFormValues) {
    createTask.mutate({
      roomId: Number(data.roomId),
      type: data.type,
      title: data.title,
      priority: data.priority,
      notes: data.notes || undefined,
      assignedToId: data.assignedToId ? Number(data.assignedToId) : undefined,
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <aside
      className="flex h-full w-[264px] shrink-0 flex-col overflow-y-auto"
      style={{
        background: colors.cream,
        borderLeft: `0.5px solid ${colors.border}`,
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-3 p-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div
              className="mb-[3px] text-[9px] font-medium uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              New task
            </div>
            <div
              className="font-display text-[16px]"
              style={{ color: colors.text }}
            >
              Housekeeping task
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 rounded-md p-1 transition-colors hover:bg-[#F0EBE0]"
            aria-label="Close panel"
          >
            <X size={14} style={{ color: colors.textMuted }} />
          </button>
        </div>

        <Divider />

        {/* ── Task details ─────────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Task details</SectionLabel>

          <div className="flex flex-col gap-[7px]">
            {/* Type */}
            <div>
              <FormLabel>Type</FormLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="h-6 w-full rounded-lg text-[11px]"
                      aria-invalid={!!errors.type}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <ErrorMsg message={errors.type?.message} />
            </div>

            {/* Title */}
            <div>
              <FormLabel>Title</FormLabel>
              <Input
                {...register("title")}
                placeholder="e.g. Guest checked out"
                aria-invalid={!!errors.title}
                className="h-6 rounded-lg text-[11px]"
              />
              <ErrorMsg message={errors.title?.message} />
            </div>

            {/* Priority */}
            <div>
              <FormLabel>Priority</FormLabel>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-6 w-full rounded-lg text-[11px]">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Notes */}
            <div>
              <FormLabel>Notes (optional)</FormLabel>
              <Textarea
                {...register("notes")}
                placeholder="Additional details…"
                className="min-h-[72px] rounded-lg text-[11px]"
              />
            </div>
          </div>
        </div>

        <Divider />

        {/* ── Assignment ───────────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Assignment</SectionLabel>

          <div className="flex flex-col gap-[7px]">
            {/* Room */}
            <div>
              <FormLabel>Room</FormLabel>
              <Controller
                name="roomId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="h-6 w-full rounded-lg text-[11px]"
                      aria-invalid={!!errors.roomId}
                    >
                      <SelectValue
                        placeholder={
                          roomsLoading ? "Loading rooms…" : "Select a room"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="max-h-48 overflow-y-auto"
                    >
                      {availableRooms.length === 0 && !roomsLoading && (
                        <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
                          No rooms available
                        </div>
                      )}
                      {availableRooms.map((room) => (
                        <SelectItem key={room.id} value={String(room.id)}>
                          {room.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <ErrorMsg message={errors.roomId?.message} />
            </div>

            {/* Staff */}
            <div>
              <FormLabel>Assign to (optional)</FormLabel>
              <Controller
                name="assignedToId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-6 w-full rounded-lg text-[11px]">
                      <SelectValue
                        placeholder={
                          staffLoading ? "Loading staff…" : "Select staff"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="max-h-48 overflow-y-auto"
                    >
                      {staff.length === 0 && !staffLoading && (
                        <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
                          No staff available
                        </div>
                      )}
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        {/* ── Mutation error feedback ─────────────────────────────────────── */}
        {createTask.error && (
          <p className="rounded-md bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
            {createTask.error.message}
          </p>
        )}

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <div className="mt-auto flex flex-col gap-[6px] pt-2">
          <button
            type="submit"
            disabled={createTask.isPending}
            className="flex w-full items-center justify-center gap-1.5 rounded-full py-[7px] text-[11px] font-medium transition-opacity hover:opacity-80 disabled:opacity-60"
            style={{
              background: colors.gold,
              color: "#fff",
              border: "none",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {createTask.isPending && (
              <Loader2 size={12} className="animate-spin" />
            )}
            Create task
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full py-[7px] text-[11px] font-medium transition-colors hover:bg-[#F0EBE0]"
            style={{
              background: "transparent",
              color: colors.textSub,
              border: `0.5px solid ${colors.border}`,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </aside>
  );
}
