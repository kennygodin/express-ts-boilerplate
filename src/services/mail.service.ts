import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import transporter from "../lib/transporter.js";
import type { SentMessageInfo, Transporter } from "nodemailer";
import logger from "../utils/logger.js";
import { env } from "bun";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = transporter;
  }

  private static loadTemplate(templateName: string, data: object): string {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      `${templateName}.html`
    );
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = handlebars.compile(templateSource);
    return compiledTemplate(data);
  }

  public async sendEmail({
    to,
    subject,
    text,
    html,
    from,
  }: EmailOptions): Promise<SentMessageInfo> {
    try {
      const mailOptions = {
        from: from || "admin@smartgateai.com",
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
      console.log({ info });

      return info;
    } catch (error) {
      logger.fatal("Error sending email:", error);
      throw error;
    }
  }

  public async sendOTPViaEmail(
    email: string,
    firstName: string,
    otpToken: string
  ): Promise<SentMessageInfo> {
    const subject = "Confirm your email";
    const emailText = `Hello ${firstName},\n\nYour OTP is: ${otpToken}`;

    const html = MailService.loadTemplate("OTPTemplate", {
      firstName,
      otpToken,
      appName: env.APP_NAME,
    });

    return await this.sendEmail({
      to: email,
      subject,
      text: emailText,
      html,
    });
  }

  public async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetLink: string
  ): Promise<SentMessageInfo> {
    const subject = "Reset your password";
    const emailText = `Hello ${firstName},\n\nClick this link to reset your password:\n${resetLink}\n\nThis link is valid for 60 minutes.`;

    const html = MailService.loadTemplate("ResetPasswordTemplate", {
      firstName,
      resetLink,
      appName: env.APP_NAME,
    });

    return await this.sendEmail({
      to: email,
      subject,
      text: emailText,
      html,
    });
  }
}

export const mailService = new MailService();
