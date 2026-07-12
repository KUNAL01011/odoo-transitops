import { Resend } from "resend";
import { myEnvironment } from "@/configs";
import { logger } from "./logger.util";

const resend = new Resend(myEnvironment.RESEND_API_KEY);

/**
 * Send a 6-digit OTP verification email.
 */
export const sendOtpEmail = async (
  email: string,
  name: string,
  otp: string
): Promise<void> => {
  try {
    await resend.emails.send({
      from: "FillFeedback <noreply@fillfeedback.com>",
      to: email,
      subject: "Verify your FillFeedback account",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; }
          .otp-box { background-color: #fff; padding: 20px; text-align: center; border: 2px dashed #6366f1; border-radius: 8px; margin: 24px 0; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6366f1; }
          .warning { color: #ef4444; font-size: 13px; margin-top: 16px; }
          .footer { text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">FillFeedback</h1>
            <p style="margin:4px 0 0;">Email Verification</p>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Use the OTP below to verify your email address and activate your account.</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="warning">⏱ This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            <p>If you did not create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} FillFeedback. All rights reserved.</p>
            <p style="margin:4px 0 0;">Need help? Contact us at <a href="mailto:contact@kunamix.com" style="color:#6366f1;text-decoration:none;">contact@kunamix.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    });
    logger.info(`OTP email sent to ${email}`);
  } catch (error) {
    logger.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email", { cause: error });
  }
};

/**
 * Send password-reset email with a reset link / token.
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${myEnvironment.FRONTEND_URL_LOGIN}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: "FillFeedback <noreply@fillfeedback.com>",
      to: email,
      subject: "Reset your FillFeedback password",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6366f1; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px; }
          .footer { text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">FillFeedback</h1>
            <p style="margin:4px 0 0;">Password Reset</p>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <p style="text-align:center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p style="font-size:13px;color:#ef4444;margin-top:16px;">This link is valid for 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} FillFeedback. All rights reserved.</p>
            <p style="margin:4px 0 0;">Need help? Contact us at <a href="mailto:contact@kunamix.com" style="color:#6366f1;text-decoration:none;">contact@kunamix.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    });
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email", { cause: error });
  }
};
