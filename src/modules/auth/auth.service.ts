import type {
  forgotPasswordDTO,
  LoginDTO,
  OTPData,
  RegisterDTO,
  ResetPasswordDTO,
} from "./auth.interface.js";
import UserService from "../user/user.service.js";
import { comparePassword, hashPassword } from "../../utils/validationUtils.js";
import { ApiError, ApiSuccess } from "../../utils/responseHandler.js";
import { mailService } from "../../services/mail.service.js";
import { prisma } from "../../lib/prisma.js";
import {
  generateOTPToken,
  generatePasswordResetToken,
  getOtpTokenByToken,
  getPasswordResetTokenByToken,
} from "../../lib/tokens.js";
import { env } from "bun";

export class AuthService {
  static async register(userData: RegisterDTO) {
    const { password, email } = userData;

    await UserService.userExists(email);

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    const otpToken = await generateOTPToken(email);

    await mailService.sendOTPViaEmail(
      user.email,
      user.firstName,
      otpToken.token
    );

    return ApiSuccess.created("Confirmation email sent.");
  }

  static async login(userData: LoginDTO) {
    const { email, password } = userData;
    const user = await UserService.findUserByEmail(email);
    await comparePassword(password, user.password!);

    if (!user.emailVerified) {
      // TODOD: Send email again
      throw ApiError.forbidden("Email Not Verified");
    }

    // const token = generateToken({ userId: user._id });

    return ApiSuccess.ok("Login Successful", {
      user: { email: user.email, id: user.id },
      // token,
    });
  }

  // static async getUser(userId: ObjectId) {
  //   const user = await UserService.findUserById(userId);
  //   user.password = undefined;
  //   return ApiSuccess.ok("User Retrieved Successfully", {
  //     user,
  //   });
  // }

  static async sendOTP({ email }: { email: string }) {
    const user = await UserService.findUserByEmail(email);
    if (user.emailVerified) {
      return ApiSuccess.ok("User already verified");
    }

    const otpToken = await generateOTPToken(email);

    await mailService.sendOTPViaEmail(
      user.email,
      user.firstName,
      otpToken.token
    );

    return ApiSuccess.created("Confirmation email sent.");
  }

  static async verifyOTP({ otp }: OTPData) {
    const existingToken = await getOtpTokenByToken(otp);

    if (!existingToken) {
      throw ApiError.notFound("OTP token does not exist");
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      throw ApiError.notFound("OTP token has expired");
    }

    const user = await UserService.findUserByEmail(existingToken.email);

    if (!user) {
      throw ApiError.notFound("Email does not exist");
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
        email: existingToken.email,
      },
    });

    await prisma.oTPToken.delete({
      where: { id: existingToken.id },
    });

    return ApiSuccess.ok("Email Verified");
  }

  static async forgotPassword({ email }: forgotPasswordDTO) {
    const existingUser = await UserService.findUserByEmail(email);

    if (!existingUser) {
      throw ApiError.notFound("No user with this email");
    }
    const passwordResetToken = await generatePasswordResetToken(email);

    await mailService.sendPasswordResetEmail(
      existingUser.email,
      existingUser.firstName,
      `${env.FRONTEND_APP_URL}/auth/new-password?token=${passwordResetToken.token}`
    );

    return ApiSuccess.ok("Reset email sent.");
  }

  static async resetPassword({ password, token }: ResetPasswordDTO) {
    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      throw ApiError.notFound("Invalid token");
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      throw ApiError.notFound("Token has expired");
    }

    const existingUser = await UserService.findUserByEmail(existingToken.email);

    if (hasExpired) {
      throw ApiError.notFound("Email does not exist");
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
    return ApiSuccess.ok("Password Updated");
  }
}

export const authService = new AuthService();
