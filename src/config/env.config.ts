import * as Joi from 'joi';

/**
 * Typed representation of all environment variables used by the application.
 * Any consumer that injects ConfigService<EnvironmentVariables, true> gets
 * full TypeScript autocomplete and compile-time safety.
 */
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;

  // MongoDB
  DB_USER: string;
  DB_PASSWORD: string;
  DB_SERVER: string;
  DB_NAME: string;
}

/**
 * Joi validation schema for the environment variables.
 *
 * - All DB_* variables are REQUIRED — the app will refuse to start
 *   if any are missing or malformed.
 * - PORT and NODE_ENV have sensible defaults.
 */
export const envValidationSchema = Joi.object<EnvironmentVariables>({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  // ── MongoDB ────────────────────────────────────────────────────────────────
  DB_USER: Joi.string().required().messages({
    'any.required': 'DB_USER is required. Add it to your .env file.',
    'string.empty': 'DB_USER must not be empty.',
  }),

  DB_PASSWORD: Joi.string().required().messages({
    'any.required': 'DB_PASSWORD is required. Add it to your .env file.',
    'string.empty': 'DB_PASSWORD must not be empty.',
  }),

  DB_SERVER: Joi.string().required().messages({
    'any.required':
      'DB_SERVER is required (e.g. localhost:27017 or cluster.mongodb.net). Add it to your .env file.',
    'string.empty': 'DB_SERVER must not be empty.',
  }),

  DB_NAME: Joi.string().required().messages({
    'any.required': 'DB_NAME is required. Add it to your .env file.',
    'string.empty': 'DB_NAME must not be empty.',
  }),
});
