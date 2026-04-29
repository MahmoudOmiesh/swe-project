export const ROLES = {
  MANAGER: "manager",
  RECEPTIONIST: "receptionist",
};

export type Role = (typeof ROLES)[keyof typeof ROLES];
