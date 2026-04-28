import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { JWT_ALGORITHM, JWT_DEFAULT_EXPIRES_IN, JWT_TOKEN_TYPE } from "./jwt.constants.js";
import {
  IAccessTokenPayload,
  IForgotPasswordTokenPayload,
  JwtSignOptions,
  JwtVerifyOptions,
} from "./jwt.types.js";

/**
 * JwtHelperService
 *
 * Thin wrapper around @nestjs/jwt that supplies the application secret from
 * ConfigService at call-time (so the module stays environment-agnostic).
 *
 * Only two flows are supported:
 *   1. Login  — signAccessToken / verifyAccessToken
 *   2. Forgot password — signForgotPasswordToken / verifyForgotPasswordToken
 *
 * ─── Removed flows (kept for reference) ─────────────────────────────────────
 *   - Two-factor login token  (signTwoFactorLoginToken / verifyTwoFactorLoginToken)
 *   - MFA step-up token       (signMfaToken / verifyMfaToken)
 *   - Protected token         (signProtectedToken / verifyProtectedToken)
 *   - Invitation token        (signInvitationToken / verifyInvitationToken)
 *   - Signup token            (signSignupToken / verifySignupToken)
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Injectable()
export class JwtHelperService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private get secret(): string {
    return this.config.getOrThrow<string>("JWT_SECRET");
  }

  // ─── Core primitives ───────────────────────────────────────────────────────

  sign<T extends object>(payload: T, options: JwtSignOptions = {}): Promise<string> {
    return this.jwtService.signAsync(payload, {
      algorithm: JWT_ALGORITHM,
      secret: this.secret,
      ...options,
    });
  }

  async verify<T extends object>(token: string, options: JwtVerifyOptions = {}): Promise<T> {
    try {
      return await this.jwtService.verifyAsync<T>(token, {
        algorithms: [JWT_ALGORITHM],
        secret: this.secret,
        ...options,
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  /**
   * Issues a standard session access token.
   * @param rememberMe  When true issues a 5-hour token; otherwise 2-hour.
   */
  signAccessToken(userId: string, email: string, rememberMe = false): Promise<string> {
    return this.sign<IAccessTokenPayload>(
      { userId, email },
      {
        expiresIn: rememberMe
          ? JWT_DEFAULT_EXPIRES_IN.ACCESS_TOKEN.REMEMBER_ME
          : JWT_DEFAULT_EXPIRES_IN.ACCESS_TOKEN.DEFAULT,
      },
    );
  }

  /**
   * Verifies a standard access token.
   * Throws UnauthorizedException on any failure.
   */
  async verifyAccessToken(token: string): Promise<IAccessTokenPayload> {
    const decoded = await this.verify<IAccessTokenPayload & { type?: string }>(token);

    // Guard: reject interim typed tokens if they slip through
    if (decoded.type) {
      throw new UnauthorizedException("Access denied: invalid token type");
    }

    return { userId: decoded.userId, email: decoded.email };
  }

  // ─── Forgot Password ───────────────────────────────────────────────────────

  /**
   * Issues a short-lived (10 min) password-reset link token.
   * The `hash` field is a one-time fingerprint derived from the user's
   * current password hash — it becomes invalid the moment the password changes.
   */
  signForgotPasswordToken(hash: string, userId: string, email: string): Promise<string> {
    return this.sign<IForgotPasswordTokenPayload>(
      { type: JWT_TOKEN_TYPE.FORGOT_PASSWORD, hash, userId, email },
      { expiresIn: JWT_DEFAULT_EXPIRES_IN.FORGOT_PASSWORD },
    );
  }

  /**
   * Verifies a forgot-password reset link token.
   * Throws UnauthorizedException on type mismatch or expiry.
   */
  async verifyForgotPasswordToken(token: string): Promise<IForgotPasswordTokenPayload> {
    const decoded = await this.verify<IForgotPasswordTokenPayload>(token);

    if (decoded.type !== JWT_TOKEN_TYPE.FORGOT_PASSWORD) {
      throw new UnauthorizedException("Invalid token type");
    }

    return decoded;
  }
}
