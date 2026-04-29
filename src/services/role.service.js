'use strict';

const { Role, RoleEnum } = require('../models/role.model');

/**
 * Seeds default roles into the DB if they don't already exist.
 * Called once on server startup.
 */
async function seedRoles() {
  const roles = Object.values(RoleEnum);
  for (const roleName of roles) {
    const exists = await Role.findOne({ name: roleName });
    if (!exists) {
      await Role.create({ name: roleName, permissions: [] });
      console.log(`[RoleService] Created default role: ${roleName}`);
    }
  }
  console.log('[RoleService] Role seeding complete.');
}

/**
 * Find a role document by its name string.
 * @param {string} name
 * @returns {Promise<import('mongoose').Document | null>}
 */
function findByName(name) {
  return Role.findOne({ name }).exec();
}

module.exports = { seedRoles, findByName };
