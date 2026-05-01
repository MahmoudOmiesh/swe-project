export interface SupplierOrder {
  id: string;
  title: string;
  date: string;
  status: "Done";
  amount: number;
}

export interface SupplierRecord {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  category: string;
  status: "Active" | "Order pending" | "Inactive";
  lastOrder: string;
  totalOrders: number;
  avgDelivery: string;
  phone: string;
  email: string;
  website: string;
  orders: SupplierOrder[];
  notes: string;
}

export const SUPPLIERS: SupplierRecord[] = [
  {
    id: "supplier-nile",
    name: "Nile Fresh Co.",
    initials: "NK",
    avatarBg: "#EAF3DE",
    avatarColor: "#3B6D11",
    category: "Food & Beverages",
    status: "Active",
    lastOrder: "3 days ago",
    totalOrders: 24,
    avgDelivery: "2 days",
    phone: "010 5666 7788",
    email: "orders@nilefresh.com",
    website: "www.nilefresh.com",
    orders: [
      { id: "#ORD-24", title: "Breakfast supplies", date: "22 Apr", status: "Done", amount: 1200 },
      { id: "#ORD-23", title: "Beverage restock", date: "18 Apr", status: "Done", amount: 860 },
      { id: "#ORD-22", title: "Dry goods bulk", date: "10 Apr", status: "Done", amount: 2100 },
    ],
    notes: "Reliable supplier since 2021. Offers 5% discount on orders above EGP 2,000. Preferred contact is Ahmed via WhatsApp.",
  },
  {
    id: "supplier-delta",
    name: "Delta Linen Supply",
    initials: "DL",
    avatarBg: "#E8F2FF",
    avatarColor: "#205FA6",
    category: "Linens & Towels",
    status: "Order pending",
    lastOrder: "Today",
    totalOrders: 18,
    avgDelivery: "1 day",
    phone: "010 2456 9988",
    email: "dispatch@deltalinen.com",
    website: "www.deltalinen.com",
    orders: [{ id: "#ORD-18", title: "Bath towels", date: "Today", status: "Done", amount: 1800 }],
    notes: "Handles urgent linen requests quickly.",
  },
  {
    id: "supplier-tanta",
    name: "Tanta Cleaning",
    initials: "TC",
    avatarBg: "#FBEAF0",
    avatarColor: "#72243E",
    category: "Cleaning Supplies",
    status: "Active",
    lastOrder: "1 week ago",
    totalOrders: 11,
    avgDelivery: "3 days",
    phone: "010 3345 7788",
    email: "sales@tantaclean.com",
    website: "www.tantaclean.com",
    orders: [{ id: "#ORD-11", title: "Cleaning chemicals", date: "1 week ago", status: "Done", amount: 940 }],
    notes: "Best pricing on bulk sanitation orders.",
  },
  {
    id: "supplier-gharbia",
    name: "GharbiaMain Tech",
    initials: "GM",
    avatarBg: "#FFF1DA",
    avatarColor: "#8E5A10",
    category: "Maintenance & Parts",
    status: "Order pending",
    lastOrder: "2 days ago",
    totalOrders: 7,
    avgDelivery: "4 days",
    phone: "010 7789 1122",
    email: "support@gharbiamain.com",
    website: "www.gharbiamain.com",
    orders: [{ id: "#ORD-07", title: "AC replacement parts", date: "2 days ago", status: "Done", amount: 2400 }],
    notes: "Good for maintenance items with scheduled delivery.",
  },
  {
    id: "supplier-fayoum",
    name: "Al-Fayoum Amenities",
    initials: "AF",
    avatarBg: "#EEEDFE",
    avatarColor: "#534AB7",
    category: "Toiletries & Amenities",
    status: "Active",
    lastOrder: "5 days ago",
    totalOrders: 15,
    avgDelivery: "2 days",
    phone: "010 8811 2244",
    email: "orders@fayoumamenities.com",
    website: "www.fayoumamenities.com",
    orders: [{ id: "#ORD-15", title: "Guest toiletries", date: "5 days ago", status: "Done", amount: 1320 }],
    notes: "Consistent quality for guest-room amenities.",
  },
  {
    id: "supplier-midegypt",
    name: "MidEgypt Electrics",
    initials: "ME",
    avatarBg: "#F1EFE8",
    avatarColor: "#5F5E5A",
    category: "Electrical & Lighting",
    status: "Inactive",
    lastOrder: "2 months ago",
    totalOrders: 4,
    avgDelivery: "5 days",
    phone: "010 4567 9911",
    email: "trade@midegyptelectrics.com",
    website: "www.midegyptelectrics.com",
    orders: [{ id: "#ORD-04", title: "Light fixtures", date: "2 months ago", status: "Done", amount: 1750 }],
    notes: "Used occasionally for larger electrical purchases.",
  },
];

