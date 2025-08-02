import type { ObjectId } from "mongoose";
import { ApiError } from "../../utils/responseHandler";
import { hashPassword } from "../../utils/validationUtils";
import type { RegisterDTO } from "../auth/auth.interface";
import { prisma } from "../../lib/prisma";
import type { User } from "@prisma/client";

class UserService {
  static async createUser(userData: RegisterDTO): Promise<User> {
    const { password, email, phoneNumber, userName, lastName } = userData;

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    return user;
  }
  static async findUserByEmail(email: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw ApiError.notFound("No user with this email");
    }
    return user;
  }

  static async findUserById(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound("User Not Found");
    }

    return user;
  }
  static async userExists(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      throw ApiError.badRequest("User with this email exists");
    }
  }
}

export default UserService;
