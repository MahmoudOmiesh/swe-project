import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { addDays } from "date-fns";

import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  newBookingSchema,
  type NewBookingFormValues,
} from "./new-booking-schema";
import type { BookingDetail } from "./booking-detail-panel";

// ─── Layout helpers (match existing sidebar look) ────────────────────────────

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

// ─── Inner form (rendered once data is ready) ────────────────────────────────

interface BookingFormProps {
  onClose: () => void;
  booking?: BookingDetail;
}

function BookingForm({ onClose, booking }: BookingFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isEdit = !!booking;

  // ── Form setup ──────────────────────────────────────────────────────────────

  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewBookingFormValues>({
    resolver: zodResolver(newBookingSchema),
    defaultValues: booking
      ? {
          firstName: booking.firstName,
          lastName: booking.lastName,
          nationalityId: booking.nationalId,
          phone: booking.phone,
          address: booking.address ?? "",
          dob: parse(booking.dob, "yyyy-MM-dd", new Date()),
          roomId: String(booking.roomId),
          numberOfGuests: booking.numGuests,
          checkIn: new Date(booking.checkIn),
          checkOut: new Date(booking.checkOut),
          services: booking.services.map((s) => String(s.id)),
        }
      : {
          firstName: "",
          lastName: "",
          nationalityId: "",
          phone: "",
          address: "",
          dob: undefined,
          roomId: "",
          numberOfGuests: 1,
          checkIn: undefined,
          checkOut: undefined,
          services: [],
        },
  });

  // ── Dependent queries ───────────────────────────────────────────────────────

  const dob = watch("dob");
  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");
  const datesValid = !!checkIn && !!checkOut && checkOut > checkIn;

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    ...trpc.hotel.bookings.availableRooms.queryOptions({
      checkIn: format(checkIn ?? new Date(), "yyyy-MM-dd"),
      checkOut: format(checkOut ?? new Date(), "yyyy-MM-dd"),
    }),
    enabled: datesValid,
  });

  const { data: availableServices = [] } = useQuery(
    trpc.hotel.bookings.availableServices.queryOptions(),
  );

  // ── Mutations ───────────────────────────────────────────────────────────────

  const createBooking = useMutation(
    trpc.hotel.bookings.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
        onClose();
      },
    }),
  );

  const editBooking = useMutation(
    trpc.hotel.bookings.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
        onClose();
      },
    }),
  );

  const mutation = isEdit ? editBooking : createBooking;

  function onSubmit(data: NewBookingFormValues) {
    const payload = {
      guest: {
        firstName: data.firstName,
        lastName: data.lastName,
        nationalityId: data.nationalityId,
        phone: data.phone,
        address: data.address || undefined,
        dob: format(data.dob, "yyyy-MM-dd"),
      },
      roomId: Number(data.roomId),
      numberOfGuests: data.numberOfGuests,
      checkIn: format(data.checkIn, "yyyy-MM-dd"),
      checkOut: format(data.checkOut, "yyyy-MM-dd"),
      serviceIds: data.services.map(Number),
    };

    if (isEdit) {
      editBooking.mutate({ id: booking!.id, ...payload });
    } else {
      createBooking.mutate(payload);
    }
  }

  // In edit mode the current room might not appear in the "available" list
  // because it's already booked. Ensure it shows up in the dropdown.
  const currentRoomInList = rooms.some((r) => r.id === booking?.roomId);
  const roomOptions =
    isEdit && booking && !currentRoomInList && datesValid
      ? [
          {
            id: booking.roomId,
            number: booking.room,
            type: booking.roomType,
            ratePerNight: booking.ratePerNight,
            label: `${booking.room} · ${booking.roomType} · EGP ${String(booking.ratePerNight)}/night`,
          },
          ...rooms,
        ]
      : rooms;

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
              {isEdit ? "Edit booking" : "New booking"}
            </div>
            <div
              className="font-display text-[16px]"
              style={{ color: colors.text }}
            >
              {isEdit ? `Booking #${booking.id}` : "Guest registration"}
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

        {/* ── Guest details ───────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Guest details</SectionLabel>

          <div className="flex flex-col gap-[7px]">
            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-[6px]">
              <div>
                <FormLabel>First name</FormLabel>
                <Input
                  {...register("firstName")}
                  placeholder="First name"
                  aria-invalid={!!errors.firstName}
                  className="h-6 rounded-lg text-[11px]"
                />
                <ErrorMsg message={errors.firstName?.message} />
              </div>
              <div>
                <FormLabel>Last name</FormLabel>
                <Input
                  {...register("lastName")}
                  placeholder="Last name"
                  aria-invalid={!!errors.lastName}
                  className="h-6 rounded-lg text-[11px]"
                />
                <ErrorMsg message={errors.lastName?.message} />
              </div>
            </div>

            {/* ID / Passport */}
            <div>
              <FormLabel>ID / Passport no.</FormLabel>
              <Input
                {...register("nationalityId")}
                placeholder="14-digit ID or passport"
                aria-invalid={!!errors.nationalityId}
                className="h-6 rounded-lg text-[11px]"
              />
              <ErrorMsg message={errors.nationalityId?.message} />
            </div>

            {/* Phone */}
            <div>
              <FormLabel>Phone</FormLabel>
              <Input
                type="tel"
                {...register("phone")}
                placeholder="01x xxxx xxxx"
                aria-invalid={!!errors.phone}
                className="h-6 rounded-lg text-[11px]"
              />
              <ErrorMsg message={errors.phone?.message} />
            </div>

            {/* Address */}
            <div>
              <FormLabel>Address</FormLabel>
              <Input
                {...register("address")}
                placeholder="Street address (optional)"
                className="h-6 rounded-lg text-[11px]"
              />
            </div>

            {/* Date of birth */}
            <div>
              <FormLabel>Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-6 w-full justify-start rounded-lg px-2 text-[11px] font-normal"
                    aria-invalid={!!errors.dob}
                  >
                    <CalendarIcon className="mr-1 size-3 opacity-50" />
                    {dob ? (
                      format(dob, "LLL dd, y")
                    ) : (
                      <span style={{ color: colors.textMuted }}>
                        Pick a date
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    defaultMonth={dob ?? new Date(2000, 0)}
                    selected={dob}
                    onSelect={(day: Date | undefined) => {
                      setValue("dob", day as Date, {
                        shouldValidate: !!day,
                      });
                    }}
                    disabled={{ after: new Date() }}
                  />
                </PopoverContent>
              </Popover>
              <ErrorMsg message={errors.dob?.message} />
            </div>
          </div>
        </div>

        <Divider />

        {/* ── Stay details ────────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Stay details</SectionLabel>

          <div className="flex flex-col gap-[7px]">
            {/* Check-in + Check-out */}
            <div className="grid grid-cols-2 gap-[6px]">
              <div>
                <FormLabel>Check-in</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-6 w-full justify-start rounded-lg px-2 text-[11px] font-normal"
                      aria-invalid={!!errors.checkIn}
                    >
                      <CalendarIcon className="mr-1 size-3 opacity-50" />
                      {checkIn ? (
                        format(checkIn, "LLL dd, y")
                      ) : (
                        <span style={{ color: colors.textMuted }}>
                          Pick date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      defaultMonth={checkIn ?? new Date()}
                      selected={checkIn}
                      onSelect={(day: Date | undefined) => {
                        setValue("checkIn", day as Date, {
                          shouldValidate: !!day,
                        });
                        // clear check-out if it's now before the new check-in
                        if (day && checkOut && checkOut <= day) {
                          setValue("checkOut", undefined as unknown as Date);
                        }
                      }}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
                <ErrorMsg message={errors.checkIn?.message} />
              </div>
              <div>
                <FormLabel>Check-out</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-6 w-full justify-start rounded-lg px-2 text-[11px] font-normal"
                      aria-invalid={!!errors.checkOut}
                    >
                      <CalendarIcon className="mr-1 size-3 opacity-50" />
                      {checkOut ? (
                        format(checkOut, "LLL dd, y")
                      ) : (
                        <span style={{ color: colors.textMuted }}>
                          Pick date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      defaultMonth={checkOut ?? checkIn ?? new Date()}
                      selected={checkOut}
                      onSelect={(day: Date | undefined) => {
                        setValue("checkOut", day as Date, {
                          shouldValidate: !!day,
                        });
                      }}
                      disabled={{
                        before: checkIn ? addDays(checkIn, 1) : new Date(),
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <ErrorMsg message={errors.checkOut?.message} />
              </div>
            </div>

            {/* Room (loaded from DB) */}
            <div>
              <FormLabel>Room</FormLabel>
              <Controller
                name="roomId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!datesValid}
                  >
                    <SelectTrigger
                      className="h-6 w-full rounded-lg text-[11px]"
                      aria-invalid={!!errors.roomId}
                    >
                      <SelectValue
                        placeholder={
                          !datesValid
                            ? "Select dates first"
                            : roomsLoading
                              ? "Loading rooms…"
                              : "Select a room"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-48 overflow-y-auto">
                      {roomOptions.length === 0 && !roomsLoading && (
                        <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
                          No rooms available
                        </div>
                      )}
                      {roomOptions.map((room) => (
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

            {/* No. of guests */}
            <div>
              <FormLabel>No. of guests</FormLabel>
              <Input
                type="number"
                min={1}
                {...register("numberOfGuests", { valueAsNumber: true })}
                aria-invalid={!!errors.numberOfGuests}
                className="h-6 rounded-lg text-[11px]"
              />
              <ErrorMsg message={errors.numberOfGuests?.message} />
            </div>
          </div>
        </div>

        <Divider />

        {/* ── Additional services (loaded from DB) ────────────────────────── */}
        <div>
          <SectionLabel>Additional services</SectionLabel>

          {availableServices.length === 0 ? (
            <p className="text-[10px]" style={{ color: colors.textMuted }}>
              No services available yet.
            </p>
          ) : (
            <Controller
              name="services"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-[5px]">
                  {availableServices.map((s) => {
                    const sid = String(s.id);
                    const checked = field.value?.includes(sid) ?? false;
                    return (
                      <label
                        key={s.id}
                        className="flex cursor-pointer items-center gap-[6px] rounded-[7px] px-[8px] py-[5px] transition-colors"
                        style={{
                          fontSize: 10,
                          color: checked
                            ? colors.status.occupied.text
                            : colors.textSub,
                          border: `0.5px solid ${checked ? colors.goldLight : colors.border2}`,
                          background: checked
                            ? colors.goldPale
                            : "transparent",
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(val) => {
                            const current = field.value ?? [];
                            field.onChange(
                              val
                                ? [...current, sid]
                                : current.filter((v) => v !== sid),
                            );
                          }}
                          className="size-3"
                        />
                        {s.name}
                      </label>
                    );
                  })}
                </div>
              )}
            />
          )}
        </div>

        {/* ── Mutation error feedback ─────────────────────────────────────── */}
        {mutation.error && (
          <p className="rounded-md bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
            {mutation.error.message}
          </p>
        )}

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <div className="mt-auto flex flex-col gap-[6px] pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-1.5 rounded-full py-[7px] text-[11px] font-medium transition-opacity hover:opacity-80 disabled:opacity-60"
            style={{
              background: colors.gold,
              color: "#fff",
              border: "none",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {mutation.isPending && (
              <Loader2 size={12} className="animate-spin" />
            )}
            {isEdit ? "Save changes" : "Create booking"}
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

// ─── Exported panel (handles data fetching for edit mode) ────────────────────

interface NewBookingPanelProps {
  onClose: () => void;
  /** When provided, fetches booking detail and opens in edit mode. */
  bookingId?: number;
}

export function NewBookingPanel({ onClose, bookingId }: NewBookingPanelProps) {
  const trpc = useTRPC();
  const isEdit = bookingId != null;

  const { data: booking, isLoading } = useQuery({
    ...trpc.hotel.bookings.getById.queryOptions({ id: bookingId! }),
    enabled: isEdit,
  });

  // Edit mode — wait for data before rendering form so defaultValues are correct
  if (isEdit && (isLoading || !booking)) {
    return (
      <aside
        className="flex h-full w-[264px] shrink-0 items-center justify-center"
        style={{ background: colors.cream, borderLeft: `0.5px solid ${colors.border}` }}
      >
        <Loader2 size={20} className="animate-spin" style={{ color: colors.textMuted }} />
      </aside>
    );
  }

  return (
    <BookingForm
      key={isEdit ? `edit-${bookingId}` : "new"}
      onClose={onClose}
      booking={isEdit ? booking! : undefined}
    />
  );
}
