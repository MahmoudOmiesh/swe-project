/**
 * Egyptian mobile number validation.
 *
 * Must start with 010, 011, 012, or 015 and be followed by exactly 8 digits
 * (11 digits total). Landlines and other prefixes are not accepted.
 */
export const EG_PHONE_RE = /^01[0125]\d{8}$/;

export const EG_PHONE_ERROR =
  "Enter a valid Egyptian phone number (e.g. 01012345678)";

export function isValidEgPhone(value: string): boolean {
  return EG_PHONE_RE.test(value);
}
