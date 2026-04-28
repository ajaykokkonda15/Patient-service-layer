// Only the token type needed for forgot-password flow
export const JWT_ALGORITHM = "HS512" as const;

export const JWT_TOKEN_TYPE = {
  FORGOT_PASSWORD: "forgot_password",
} as const;

export const JWT_DEFAULT_EXPIRES_IN = {
  // Standard session token
  ACCESS_TOKEN: {
    DEFAULT: "2h",
    REMEMBER_ME: "5h",
  },
  // Password-reset link — 10-minute window
  FORGOT_PASSWORD: "10m",
} as const;

export type JwtTokenType = (typeof JWT_TOKEN_TYPE)[keyof typeof JWT_TOKEN_TYPE];
