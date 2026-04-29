'use strict';

const { Schema, model } = require('mongoose');

const RoleEnum = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF_USER: 'staff_user',
};

const roleSchema = new Schema(
  {
    name: {
      type: String,
      enum: Object.values(RoleEnum),
      required: true,
      unique: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

const Role = model('Role', roleSchema);

module.exports = { Role, RoleEnum };
