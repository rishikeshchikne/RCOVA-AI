import { z } from "zod";

export const emailSchema = z.string().trim().email("Please enter a valid email address.").max(255);
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Please enter your password."),
});
export const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(80),
  email: emailSchema,
  password: passwordSchema,
});
export const forgotSchema = z.object({ email: emailSchema });

export type FieldKey = "name" | "email" | "password" | "message" | "form";
export type FieldErrors = Partial<Record<FieldKey, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out as FieldErrors;
}

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: emailSchema,
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters.")
    .max(5000, "Message should be 5,000 characters or fewer."),
  website: z.string().max(200).optional(),
});
