import otpGenerator from "otp-generator";
import { v4 as uuidv4 } from "uuid";

import { prisma } from "./prisma";

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();

  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};

export const generateOTPToken = async (email: string) => {
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getOtpTokenByEmail(email);

  if (existingToken) {
    await prisma.oTPToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const otpToken = await prisma.oTPToken.create({
    data: {
      email,
      token: otp,
      expires,
    },
  });

  return otpToken;
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
      where: { email },
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
      where: { token },
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};

export const getOtpTokenByEmail = async (email: string) => {
  try {
    const otpToken = await prisma.oTPToken.findFirst({
      where: { email },
    });

    return otpToken;
  } catch {
    return null;
  }
};

export const getOtpTokenByToken = async (token: string) => {
  try {
    const otpToken = await prisma.oTPToken.findFirst({
      where: { token },
    });

    return otpToken;
  } catch {
    return null;
  }
};
