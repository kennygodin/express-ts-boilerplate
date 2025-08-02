import mongoose from "mongoose";
import { ApiError } from "./responseHandler";

export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw ApiError.badRequest("Please provide a password");
  }
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
  return hashedPassword;
}

export async function comparePassword(
  typedPassword: string,
  existingPassword: string
): Promise<void> {
  if (!typedPassword || !existingPassword) {
    throw ApiError.badRequest("Please provide required password");
  }
  const isMatch = await Bun.password.verify(typedPassword, existingPassword);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }
}

// Checks if an id is a valid mongoose Id
export function validateMongoId(id: string): void {
  const isValid = mongoose.isValidObjectId(id);
  if (!isValid) {
    throw ApiError.badRequest("Invalid Id");
  }
}
