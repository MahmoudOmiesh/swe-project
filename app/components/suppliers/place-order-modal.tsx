"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

// ─── Schema ────────────────────────────────────────────────────────────────

const placeOrderSchema = z.object({
  supplierId: z.string().min(1, "Select a supplier"),
  title: z.string().min(1, "Item description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  amount: z.number().min(0, "Amount must be 0 or more"),
});

type PlaceOrderFormValues = z.infer<typeof placeOrderSchema>;

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

interface PlaceOrderModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-select a supplier when opening from the detail panel. */
  defaultSupplierId?: number;
}

export function PlaceOrderModal({
  open,
  onClose,
  defaultSupplierId,
}: PlaceOrderModalProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: suppliers = [] } = useQuery(
    trpc.hotel.suppliers.list.queryOptions(),
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlaceOrderFormValues>({
    resolver: zodResolver(placeOrderSchema),
    defaultValues: {
      supplierId: defaultSupplierId ? String(defaultSupplierId) : "",
      title: "",
      quantity: "",
      amount: 0,
    },
  });

  // Reset form with the correct pre-selected supplier each time the modal opens
  useEffect(() => {
    if (open) {
      reset({
        supplierId: defaultSupplierId ? String(defaultSupplierId) : "",
        title: "",
        quantity: "",
        amount: 0,
      });
    }
  }, [open, defaultSupplierId, reset]);

  const orderMutation = useMutation(
    trpc.hotel.suppliers.placeOrder.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
        reset();
        onClose();
      },
    }),
  );

  function onSubmit(data: PlaceOrderFormValues) {
    orderMutation.mutate({
      supplierId: Number(data.supplierId),
      title: `${data.title} x ${data.quantity}`,
      amount: data.amount,
    });
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Place Order"
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
            form="place-order-form"
            disabled={orderMutation.isPending}
            className="flex items-center gap-1.5 rounded-full px-4 py-[8px] text-[11px] font-medium disabled:opacity-60"
            style={{ background: colors.gold, color: "#fff", border: "none" }}
          >
            {orderMutation.isPending && (
              <Loader2 size={11} className="animate-spin" />
            )}
            Submit
          </button>
        </>
      }
    >
      <form
        id="place-order-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <div>
          <FormLabel>Supplier</FormLabel>
          <Controller
            name="supplierId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="h-7 w-full rounded-lg text-[11px]"
                  aria-invalid={!!errors.supplierId}
                >
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="max-h-48 overflow-y-auto"
                >
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <ErrorMsg message={errors.supplierId?.message} />
        </div>

        <div>
          <FormLabel>Item</FormLabel>
          <Input
            {...register("title")}
            placeholder="e.g. Breakfast supplies"
            aria-invalid={!!errors.title}
            className="h-7 rounded-lg text-[11px]"
          />
          <ErrorMsg message={errors.title?.message} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FormLabel>Quantity</FormLabel>
            <Input
              {...register("quantity")}
              placeholder="e.g. 50 units"
              aria-invalid={!!errors.quantity}
              className="h-7 rounded-lg text-[11px]"
            />
            <ErrorMsg message={errors.quantity?.message} />
          </div>
          <div>
            <FormLabel>Amount (EGP)</FormLabel>
            <Input
              type="number"
              min={0}
              {...register("amount", { valueAsNumber: true })}
              placeholder="0"
              aria-invalid={!!errors.amount}
              className="h-7 rounded-lg text-[11px]"
            />
            <ErrorMsg message={errors.amount?.message} />
          </div>
        </div>

        {orderMutation.error && (
          <p className="rounded-md bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
            {orderMutation.error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
