'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');

const JWT_ALGORITHM = 'HS512';

const JWT_DEFAULT_EXPIRES_IN = {
  ACCESS_TOKEN: {
    DEFAULT: '2h',
    REMEMBER_ME: '5h',
  },
  FORGOT_PASSWORD: '10m',
};

const JWT_TOKEN_TYPE = {
  FORGOT_PASSWORD: 'forgot_password',
};

/**
 * Sign any payload into a JWT.
 */
function sign(payload, options = {}) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      config.jwt.secret,
      { algorithm: JWT_ALGORITHM, ...options },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
}

/**
 * Verify a JWT and return its decoded payload.
 * Throws an error with status 401 on failure.
 */
function verify(token, options = {}) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      config.jwt.secret,
      { algorithms: [JWT_ALGORITHM], ...options },
      (err, decoded) => {
        if (err) {
          const error = new Error('Invalid or expired token');
          error.status = 401;
          reject(error);
        } else {
          resolve(decoded);
        }
      }
    );
  });
}

/**
 * Issue a standard access token.
 * @param {string} userId
 * @param {string} email
 * @param {string} role
 * @param {boolean} isMaster
 * @param {boolean} rememberMe
 */
function signAccessToken(userId, email, role, isMaster, rememberMe = false) {
  const expiresIn = rememberMe
    ? JWT_DEFAULT_EXPIRES_IN.ACCESS_TOKEN.REMEMBER_ME
    : JWT_DEFAULT_EXPIRES_IN.ACCESS_TOKEN.DEFAULT;

  return sign({ userId, email, role, is_master: isMaster }, { expiresIn });
}

/**
 * Issue a short-lived forgot-password token.
 */
function signForgotPasswordToken(hash, userId, email) {
  return sign(
    { type: JWT_TOKEN_TYPE.FORGOT_PASSWORD, hash, userId, email },
    { expiresIn: JWT_DEFAULT_EXPIRES_IN.FORGOT_PASSWORD }
  );
}

/**
 * Verify and validate a forgot-password token.
 */
async function verifyForgotPasswordToken(token) {
  const decoded = await verify(token);
  if (decoded.type !== JWT_TOKEN_TYPE.FORGOT_PASSWORD) {
    const error = new Error('Invalid token type');
    error.status = 401;
    throw error;
  }
  return decoded;
}

module.exports = {
  sign,
  verify,
  signAccessToken,
  signForgotPasswordToken,
  verifyForgotPasswordToken,
  JWT_TOKEN_TYPE,
};
