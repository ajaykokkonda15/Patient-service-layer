'use strict';

const nodemailer = require('nodemailer');
const config = require('../config');

// Create transporter once (only if SMTP is configured)
let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!config.smtp.host || !config.smtp.user) {
      throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM in .env');
    }
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}

/**
 * Send a raw email.
 * @param {{ to: string, subject: string, html?: string, text?: string }} options
 */
async function sendMail(options) {
  await getTransporter().sendMail({
    from: config.smtp.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

// ─── Forgot-Password Email ────────────────────────────────────────────────────

function buildForgotPasswordEmail({ email, resetLink, firstName }) {
  const displayName = (firstName || '').trim() || 'User';
  const baseUrl = (config.frontendUrl || '').replace(/\/$/, '');
  const privacyHref = baseUrl ? `${baseUrl}/privacy` : '#';
  const helpHref = baseUrl ? `${baseUrl}/help` : '#';
  const footerYear = new Date().getFullYear();
  const link = (resetLink || '').trim();

  const ctaSection = link
    ? `<div style="text-align:center;margin:28px 0;">
        <a href="${link}" style="display:inline-block;background:#112449;color:#FFF;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">Reset Password</a>
       </div>
       <p style="color:#566073;font-size:14px;line-height:1.6;margin-bottom:12px;">This link is only valid for the next 10 minutes.</p>
       <p style="color:#566073;font-size:14px;line-height:1.6;margin-bottom:24px;">After that, you will need to request a new one.</p>
       <p style="color:#566073;font-size:13px;line-height:1.6;margin-bottom:8px;">If the button does not work, copy and paste this link into your browser:</p>
       <p style="color:#3B82F6;font-size:12px;line-height:1.5;margin:0 0 24px;word-break:break-all;"><a href="${link}" style="color:#3B82F6;">${link}</a></p>`
    : `<p style="color:#566073;font-size:14px;line-height:1.6;margin-bottom:24px;">We could not generate a reset link. Please start the forgot password process again.</p>`;

  return {
    subject: 'Reset your password',
    html: `
<div style="background-color:#F4F6F8;padding:40px 16px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:520px;margin:0 auto;">
    <div style="background-color:#FFF;border:1px solid #DBE0E0;border-radius:16px;padding:32px;box-shadow:0 6px 16px rgba(0,0,0,0.05);">
      <p style="color:#566073;font-size:13px;margin-bottom:8px;">Security</p>
      <h2 style="color:#0D1B36;font-size:24px;font-weight:800;margin-bottom:16px;">Password Reset Request</h2>
      <p style="color:#566073;font-size:16px;margin-bottom:16px;">Hi ${displayName},</p>
      <p style="color:#566073;font-size:16px;line-height:1.6;margin-bottom:24px;">We received a request to reset the password for your account. If that was you, click below to choose a new password.</p>
      ${ctaSection}
      <p style="color:#566073;font-size:14px;line-height:1.6;margin-bottom:16px;">Did not request a password reset? No action is needed — your password will remain unchanged.</p>
      <div style="height:1px;background:#DBE0E0;margin:24px 0;"></div>
      <p style="color:#566073;font-size:15px;line-height:1.6;margin:0 0 4px;">Thanks,</p>
      <p style="color:#0D1B36;font-size:15px;font-weight:600;margin:0;">Patient Service Team</p>
    </div>
    <p style="color:#9CA3AF;font-size:12px;text-align:center;margin-top:16px;line-height:1.5;">
      © ${footerYear} Patient Service ·
      <a href="${privacyHref}" style="color:#3B82F6;text-decoration:none;">Privacy Policy</a>
      ·
      <a href="${helpHref}" style="color:#3B82F6;text-decoration:none;">Help Center</a>
    </p>
  </div>
</div>`,
  };
}

/**
 * Send forgot-password reset email.
 * @param {{ email: string, resetLink: string, firstName?: string }} data
 */
async function sendForgotPasswordEmail(data) {
  const { subject, html } = buildForgotPasswordEmail(data);
  await sendMail({ to: data.email, subject, html });
}

module.exports = { sendMail, sendForgotPasswordEmail };
