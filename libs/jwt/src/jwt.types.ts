import type { JwtSignOptions as NestJwtSignOptions, JwtVerifyOptions as NestJwtVerifyOptions } from "@nestjs/jwt";
import { JWT_TOKEN_TYPE } from "./jwt.constants.js";

// ─── Kept token payloads ──────────────────────────────────────────────────────

/** Standard session access token — issued on successful login. */
export interface IAccessTokenPayload {
  userId: string; // MongoDB ObjectId as string
  email: string;
}

/**
 * Forgot-password reset link token.
 * Carries a one-time hash so the link is invalidated after use.
 */
export interface IForgotPasswordTokenPayload {
  type: typeof JWT_TOKEN_TYPE.FORGOT_PASSWORD;
  hash: string;
  userId: string; // MongoDB ObjectId as string
  email: string;
}

// ─── Re-exported NestJS option types ─────────────────────────────────────────

export type JwtSignOptions = NestJwtSignOptions;
export type JwtVerifyOptions = NestJwtVerifyOptions;

// ─── Reference — removed token payloads (kept for documentation) ─────────────
//
// ITwoFactorLoginTokenPayload  — interim 2FA step token
// IMfaTokenPayload             — step-up token after TOTP verify
// IProtectedTokenPayload       — password re-entry (x-protected-token header)
// IInvitationTokenPayload      — organisation invitation link
// ISignupTokenPayload          — new-user signup link
