export interface RegisterDTO {
  firstName: string;
  lastName: string;
  role: "EMPLOYER" | "JOB_SEEKER";
  email: string;
  password: string;
  [key: string]: any;
}

export interface LoginDTO {
  email: string;
  password: string;
  firstName?: string;
  [key: string]: any;
}

export interface OTPData {
  otp: string;
}

export interface forgotPasswordDTO {
  email: string;
  [key: string]: any;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  [key: string]: any;
}
