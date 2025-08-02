import { z } from "zod";

enum Role {
  EMPLOYER = "EMPLOYER",
  JOB_SEEKER = "JOB_SEEKER",
}

export class AuthSchema {
  static user = z
    .object({
      firstName: z
        .string({ required_error: "First name is required" })
        .min(2, "First name must be at least 2 characters long"),

      lastName: z
        .string({ required_error: "Last name is required" })
        .min(2, "Last name must be at least 2 characters long"),

      email: z
        .string({ required_error: "Email is required" })
        .email("Please provide a valid email address"),

      role: z.nativeEnum(Role, {
        required_error: "Role is required",
        invalid_type_error: "Role must be EMPLOYER or JOB_SEEKER",
      }),

      password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters long"),
    })
    .strict();
}
