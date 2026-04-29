import type { RoomStatus } from "./data";

export type { RoomStatus };

type StatusPalette = {
  bg: string;
  text: string;
  border: string;
};

export const colors = {
  gold: "#B8965A",
  goldLight: "#D4B07A",
  goldPale: "#F5EDD8",
  dark: "#1A1612",
  dark2: "#2C2520",
  cream: "#FAF7F2",
  cream2: "#F0EBE0",
  text: "#1A1612",
  textSub: "#6B5E4E",
  textMuted: "#9C8B78",
  border: "rgba(184,150,90,0.25)",
  border2: "rgba(184,150,90,0.15)",
  status: {
    occupied: {
      bg: "#F5EDD8",
      text: "#7A5018",
      border: "#D4B07A",
    },
    available: {
      bg: "#EAF3DE",
      text: "#3B6D11",
      border: "#97C459",
    },
    cleaning: {
      bg: "#E6F1FB",
      text: "#185FA5",
      border: "#85B7EB",
    },
    maintenance: {
      bg: "#FCEBEB",
      text: "#A32D2D",
      border: "#F09595",
    },
  } satisfies Record<RoomStatus, StatusPalette>,
} as const;
