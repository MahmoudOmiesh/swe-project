"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Schema ────────────────────────────────────────────────────────────────

const addRoomSchema = z.object({
  number: z
    .string()
    .min(1, "Room number is required")
    .max(4, "Room number is too long"),
  type: z.enum(["single", "double", "suite"], {
    message: "Please select a room type",
  }),
  floor: z.coerce
    .number()
    .int("Floor must be a whole number")
    .min(1, "Floor must be at least 1")
    .max(3, "Floor must be at most 3"),
  capacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(4, "Capacity must be at most 4"),
  ratePerNight: z.coerce
    .number()
    .int("Rate must be a whole number")
    .min(0, "Rate must be at least 0")
    .max(1000, "Rate must be at most 1000"),
});

type AddRoomFormValues = z.input<typeof addRoomSchema>;
type AddRoomFormOutput = z.output<typeof addRoomSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────

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

function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-0.5 text-[9px] text-red-500">{message}</p>;
}

// ─── Component ─────────────────────────────────────────────────────────────

interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddRoomModal({ open, onClose }: AddRoomModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddRoomFormValues>({
    resolver: zodResolver(addRoomSchema),
    defaultValues: {
      number: "",
      type: undefined,
      floor: 1,
      capacity: 1,
      ratePerNight: 0,
    },
  });

  const createMutation = useMutation(
    trpc.hotel.rooms.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
        reset();
        onClose();
      },
    }),
  );

  function onSubmit(data: AddRoomFormOutput) {
    createMutation.mutate(data);
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Add Room"
      onClose={handleClose}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full px-4 py-[8px] text-[11px] font-medium"
            style={{
              background: colors.cream2,
              border: `0.5px solid ${colors.border2}`,
              color: colors.textSub,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-room-form"
            disabled={createMutation.isPending}
            className="flex items-center gap-1.5 rounded-full px-4 py-[8px] text-[11px] font-medium disabled:opacity-60"
            style={{ background: colors.gold, color: "#fff", border: "none" }}
          >
            {createMutation.isPending && (
              <Loader2 size={11} className="animate-spin" />
            )}
            Submit
          </button>
        </>
      }
    >
      <form
        id="add-room-form"
        onSubmit={handleSubmit((data) => onSubmit(data as AddRoomFormOutput))}
        className="flex flex-col gap-3"
      >
        <div>
          <FormLabel>Room number</FormLabel>
          <Input
            {...register("number")}
            placeholder="e.g. 101"
            aria-invalid={!!errors.number}
            className="h-7 rounded-lg text-[11px]"
          />
          <ErrorMsg message={errors.number?.message} />
        </div>

        <div>
          <FormLabel>Type</FormLabel>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="h-7 w-full rounded-lg text-[11px]"
                  aria-invalid={!!errors.type}
                >
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <ErrorMsg message={errors.type?.message} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FormLabel>Floor</FormLabel>
            <Input
              type="number"
              min={1}
              {...register("floor")}
              aria-invalid={!!errors.floor}
              className="h-7 rounded-lg text-[11px]"
            />
            <ErrorMsg message={errors.floor?.message} />
          </div>

          <div>
            <FormLabel>Capacity</FormLabel>
            <Input
              type="number"
              min={1}
              {...register("capacity")}
              aria-invalid={!!errors.capacity}
              className="h-7 rounded-lg text-[11px]"
            />
            <ErrorMsg message={errors.capacity?.message} />
          </div>
        </div>

        <div>
          <FormLabel>Rate per night (EGP)</FormLabel>
          <Input
            type="number"
            min={0}
            {...register("ratePerNight")}
            aria-invalid={!!errors.ratePerNight}
            className="h-7 rounded-lg text-[11px]"
          />
          <ErrorMsg message={errors.ratePerNight?.message} />
        </div>

        {createMutation.error && (
          <p className="rounded-md bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
            {createMutation.error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
