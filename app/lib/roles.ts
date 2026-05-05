export const ROLES = {
  MANAGER: "manager",
  RECEPTIONIST: "receptionist",
  HOUSEKEEPING: "housekeeping",
  ACCOUNTANT: "accountant",
};

export type Role = (typeof ROLES)[keyof typeof ROLES];
