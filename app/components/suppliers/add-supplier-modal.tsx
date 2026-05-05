"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { EG_PHONE_RE, EG_PHONE_ERROR } from "@/utils/validation/phone";
import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";

// ─── Schema ────────────────────────────────────────────────────────────────

const addSupplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .refine((v) => EG_PHONE_RE.test(v), EG_PHONE_ERROR),
  notes: z.string().optional(),
});

type AddSupplierFormValues = z.infer<typeof addSupplierSchema>;

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

interface AddSupplierModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddSupplierModal({ open, onClose }: AddSupplierModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddSupplierFormValues>({
    resolver: zodResolver(addSupplierSchema),
    defaultValues: {
      name: "",
      category: "",
      phone: "",
      notes: "",
    },
  });

  const createMutation = useMutation(
    trpc.hotel.suppliers.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
        reset();
        onClose();
      },
    }),
  );

  function onSubmit(data: AddSupplierFormValues) {
    createMutation.mutate(data);
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Add Supplier"
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
            form="add-supplier-form"
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
        id="add-supplier-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <div>
          <FormLabel>Name</FormLabel>
          <Input
            {...register("name")}
            placeholder="Supplier name"
            aria-invalid={!!errors.name}
            className="h-7 rounded-lg text-[11px]"
          />
          <ErrorMsg message={errors.name?.message} />
        </div>

        <div>
          <FormLabel>Category</FormLabel>
          <Input
            {...register("category")}
            placeholder="e.g. Food & Beverages"
            aria-invalid={!!errors.category}
            className="h-7 rounded-lg text-[11px]"
          />
          <ErrorMsg message={errors.category?.message} />
        </div>

        <div>
          <FormLabel>Phone</FormLabel>
          <Input
            {...register("phone")}
            placeholder="01x xxxx xxxx"
            aria-invalid={!!errors.phone}
            className="h-7 rounded-lg text-[11px]"
          />
          <ErrorMsg message={errors.phone?.message} />
        </div>

        <div>
          <FormLabel>Notes (optional)</FormLabel>
          <Textarea
            {...register("notes")}
            placeholder="Any additional details..."
            className="min-h-[60px] rounded-lg text-[11px]"
          />
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
