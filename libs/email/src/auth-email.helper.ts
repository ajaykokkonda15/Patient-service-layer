/**
 * Auth-related transactional emails.
 *
 * ACTIVE:
 *   - sendForgotPasswordEmail
 *
 * REFERENCE ONLY (commented out — remove comments to re-enable):
 *   - sendCreateUserEmail
 *   - sendVerifyOtpEmail
 *   - sendPaymentSuccessfulEmail
 *   - sendTenantRoleInvitationEmail
 *   - sendKycVerificationInvitationEmail
 *   - sendReviewerInvitationEmail
 *   - sendRegistrationCompletedEmail
 *   - sendSimpleTenantInvitationEmail
 *   - sendIntegrationAccessRequestEmail
 */

import { Injectable } from "@nestjs/common";
import { EmailService } from "./email.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE: Forgot Password
// ─────────────────────────────────────────────────────────────────────────────

export interface ForgotPasswordEmailData {
  email: string;
  resetLink: string;
  firstName?: string | null;
}

function buildForgotPasswordEmail(data: ForgotPasswordEmailData): { subject: string; html: string } {
  const displayName = data.firstName?.trim() || "User";
  const greetingLine = `Hi ${displayName},`;
  const baseUrl = process.env.FRONTEND_URL?.replace(/\/$/, "") ?? "";
  const privacyHref = baseUrl ? `${baseUrl}/privacy` : "#";
  const helpHref = baseUrl ? `${baseUrl}/help` : "#";
  const footerYear = new Date().getFullYear();
  const resetLink = data.resetLink.trim();
  const hasLink = resetLink.length > 0;

  const ctaSection = hasLink
    ? `<div style="text-align:center; margin:28px 0;">
        <a href="${resetLink}" style="display:inline-block; background:#112449; color:#FFF; padding:14px 32px; border-radius:8px; font-weight:700; font-size:15px; text-decoration:none;">Reset Password</a>
      </div>
      <p style="color:#566073; font-size:14px; line-height:1.6; margin-bottom:12px;">This link is only valid for the next 10 minutes.</p>
      <p style="color:#566073; font-size:14px; line-height:1.6; margin-bottom:24px;">After that, you will need to request a new one.</p>
      <p style="color:#566073; font-size:13px; line-height:1.6; margin-bottom:8px;">If the button above does not work, copy and paste this link directly into your browser:</p>
      <p style="color:#3B82F6; font-size:12px; line-height:1.5; margin:0 0 24px; word-break:break-all;"><a href="${resetLink}" style="color:#3B82F6;">${resetLink}</a></p>`
    : `<p style="color:#566073; font-size:14px; line-height:1.6; margin-bottom:24px;">We could not generate a password reset link. Please start the forgot password process again.</p>`;

  return {
    subject: "Reset your password",
    html: `
<div style="background-color:#F4F6F8; padding:40px 16px; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width:520px; margin:0 auto;">
    <div style="background-color:#FFF; border:1px solid #DBE0E0; border-radius:16px; padding:32px; box-shadow:0 6px 16px rgba(0,0,0,0.05);">
      <p style="color:#566073; font-size:13px; margin-bottom:8px;">Security</p>
      <h2 style="color:#0D1B36; font-size:24px; font-weight:800; margin-bottom:16px;">Password Reset Request</h2>
      <p style="color:#566073; font-size:16px; margin-bottom:16px;">${greetingLine}</p>
      <p style="color:#566073; font-size:16px; line-height:1.6; margin-bottom:24px;">We received a request to reset the password for your account. If that was you, click below to choose a new password.</p>
      ${ctaSection}
      <p style="color:#566073; font-size:14px; line-height:1.6; margin-bottom:16px;">Did not request a password reset? No action is needed — your password will remain unchanged.</p>
      <div style="height:1px; background:#DBE0E0; margin:24px 0;"></div>
      <p style="color:#566073; font-size:15px; line-height:1.6; margin:0 0 4px;">Thanks,</p>
      <p style="color:#0D1B36; font-size:15px; font-weight:600; margin:0;">Patient Service Team</p>
    </div>
    <p style="color:#9CA3AF; font-size:12px; text-align:center; margin-top:16px; line-height:1.5;">
      © ${footerYear} Patient Service ·
      <a href="${privacyHref}" style="color:#3B82F6; text-decoration:none;">Privacy Policy</a>
      ·
      <a href="${helpHref}" style="color:#3B82F6; text-decoration:none;">Help Center</a>
    </p>
  </div>
</div>`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EmailTemplatesService
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class EmailTemplatesService {
  constructor(private readonly emailService: EmailService) {}

  async sendForgotPasswordEmail(data: ForgotPasswordEmailData): Promise<void> {
    const { subject, html } = buildForgotPasswordEmail(data);
    await this.emailService.sendMail({ to: data.email, subject, html });
  }

  // ─── REFERENCE — removed send methods (uncomment to re-enable) ─────────────

  // async sendCreateUserEmail(data: CreateUserEmailData): Promise<void> { ... }
  // async sendVerifyOtpEmail(data: VerifyOtpEmailData): Promise<void> { ... }
  // async sendPaymentSuccessfulEmail(...): Promise<void> { ... }
  // async sendTenantRoleInvitationEmail(data: TenantRoleInvitationEmailData): Promise<void> { ... }
  // async sendKycVerificationInvitationEmail(data: KycVerificationInvitationEmailData): Promise<void> { ... }
  // async sendReviewerInvitationEmail(data: ReviewerInvitationEmailData): Promise<void> { ... }
  // async sendRegistrationCompletedEmail(data: RegistrationCompletedEmailData): Promise<void> { ... }
  // async sendSimpleTenantInvitationEmail(data: SimpleTenantInvitationEmailData): Promise<void> { ... }
  // async sendIntegrationAccessRequestEmail(data: IntegrationAccessRequestEmailData): Promise<void> { ... }
}
