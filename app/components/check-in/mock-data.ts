export type ServiceKey =
  | "breakfast"
  | "airport-transfer"
  | "laundry"
  | "extra-bed"
  | "room-service"
  | "mini-bar";

export interface ServiceOption {
  key: ServiceKey;
  label: string;
  extra?: string;
}

export interface ArrivalRecord {
  id: string;
  guestName: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  roomLabel: string;
  bookingId: string;
  time: string;
  nationality: string;
  nationalId: string;
  phone: string;
  occupation: string;
  purpose: string;
  address: string;
  room: string;
  checkInDate: string;
  checkOutDate: string;
  numGuests: number;
  ratePerNight: number;
  services: ServiceKey[];
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  { key: "breakfast", label: "Breakfast included" },
  { key: "airport-transfer", label: "Airport transfer" },
  { key: "laundry", label: "Laundry service" },
  { key: "extra-bed", label: "Extra bed", extra: "+EGP 80" },
  { key: "room-service", label: "Room service" },
  { key: "mini-bar", label: "Mini bar" },
];

export const CHECK_IN_ARRIVALS: ArrivalRecord[] = [
  {
    id: "arrival-1038",
    guestName: "Ahmed Kamel",
    initials: "AK",
    avatarBg: "#EEEDFE",
    avatarColor: "#534AB7",
    roomLabel: "Room 202 · Double",
    bookingId: "#1038",
    time: "09:30",
    nationality: "Egyptian",
    nationalId: "29801012345678",
    phone: "010 2240 8049",
    occupation: "Engineer",
    purpose: "Business",
    address: "Nasr City, Cairo",
    room: "202 · Double",
    checkInDate: "25 Apr 2026",
    checkOutDate: "27 Apr 2026",
    numGuests: 2,
    ratePerNight: 450,
    services: ["breakfast", "laundry"],
  },
  {
    id: "arrival-1042",
    guestName: "Rania Mostafa",
    initials: "RM",
    avatarBg: "#FBEAF0",
    avatarColor: "#72243E",
    roomLabel: "Room 106 · Double",
    bookingId: "#1042",
    time: "14:00",
    nationality: "Egyptian",
    nationalId: "29701056789012",
    phone: "010 8888 9999",
    occupation: "Consultant",
    purpose: "Leisure",
    address: "Dokki, Giza",
    room: "106 · Double",
    checkInDate: "26 Apr 2026",
    checkOutDate: "29 Apr 2026",
    numGuests: 3,
    ratePerNight: 450,
    services: ["breakfast"],
  },
  {
    id: "arrival-1043",
    guestName: "Nour Hamdy",
    initials: "NH",
    avatarBg: "#E1F5EE",
    avatarColor: "#0F6E56",
    roomLabel: "Room 203 · Double",
    bookingId: "#1043",
    time: "16:00",
    nationality: "Egyptian",
    nationalId: "29601067890123",
    phone: "011 3333 4444",
    occupation: "Designer",
    purpose: "Business",
    address: "Heliopolis, Cairo",
    room: "203 · Double",
    checkInDate: "25 Apr 2026",
    checkOutDate: "28 Apr 2026",
    numGuests: 1,
    ratePerNight: 450,
    services: ["airport-transfer"],
  },
];

