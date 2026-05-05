export const ROLES = {
  MANAGER: "manager",
  RECEPTIONIST: "receptionist",
  HOUSEKEEPING: "housekeeping",
};

export type Role = (typeof ROLES)[keyof typeof ROLES];
