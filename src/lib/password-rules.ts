import { z } from "zod";

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const STRONG_PASSWORD_MIN_LENGTH = 8;
export const STRONG_PASSWORD_MAX_LENGTH = 72;

export const STRONG_PASSWORD_MESSAGE =
  "Use 8-72 characters with uppercase, lowercase, a number, and a special character.";

export const passwordRequirementsHint =
  "Min 8 characters, with uppercase, lowercase, number, and special character.";

export const strongPasswordSchema = z
  .string()
  .min(STRONG_PASSWORD_MIN_LENGTH, STRONG_PASSWORD_MESSAGE)
  .max(STRONG_PASSWORD_MAX_LENGTH, STRONG_PASSWORD_MESSAGE)
  .regex(STRONG_PASSWORD_REGEX, STRONG_PASSWORD_MESSAGE);

export const validateStrongPassword = (
  password: string,
): string | null => {
  const parsed = strongPasswordSchema.safeParse(password);
  return parsed.success ? null : (parsed.error.issues[0]?.message ?? STRONG_PASSWORD_MESSAGE);
};
