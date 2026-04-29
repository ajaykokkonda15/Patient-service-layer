'use strict';

const bcrypt = require('bcrypt');
const adminService = require('./admin.service');
const jwtService = require('./jwt.service');

/**
 * Authenticate an admin and return a JWT access token.
 * @param {{ email: string, password: string }} body
 */
async function login(body) {
  const { email, password } = body;

  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const admin = await adminService.findByEmail(email);
  if (!admin) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const roleName = admin.role?.name || 'unknown';

  const token = await jwtService.signAccessToken(
    admin._id.toString(),
    admin.email,
    roleName,
    admin.is_master
  );

  return {
    accessToken: token,
    user: {
      id: admin._id,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      role: roleName,
    },
  };
}

/**
 * Logout — JWTs are stateless; instruct the client to discard the token.
 */
function logout() {
  return { message: 'Successfully logged out' };
}

module.exports = { login, logout };
