import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import type { AuthenticatedUser } from "../user/user.interface.js";

export class AuthController {
  static async register(req: Request, res: Response) {
    const userData = req.body;
    const result = await AuthService.register(userData);
    res.status(201).json(result);
  }

  static async login(req: Request, res: Response) {
    const userData = req.body;
    const result = await AuthService.login(userData);
    res.status(200).json(result);
  }

  // Get user data
  static async getUser(req: Request, res: Response) {
    const { userId } = req.user as AuthenticatedUser;
    // const result = await AuthService.getUser(userId);
    // res.status(200).json(result);
  }

  static async sendOTP(req: Request, res: Response) {
    const { email } = req.body;
    const result = await AuthService.sendOTP({ email });
    res.status(200).json(result);
  }

  static async verifyOTP(req: Request, res: Response) {
    const { otp } = req.body;
    const result = await AuthService.verifyOTP({ otp });
    res.status(200).json(result);
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const result = await AuthService.forgotPassword({ email });
    res.status(200).json(result);
  }

  static async resetPassword(req: Request, res: Response) {
    const { password, token } = req.body;
    const result = await AuthService.resetPassword({ password, token });
    res.status(200).json(result);
  }
}
