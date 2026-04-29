'use strict';

const { Schema, model, Types } = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name:  { type: String, required: true },
    email:      { type: String, required: true, unique: true, lowercase: true },
    phone:      { type: String },
    address:    { type: String },
    password:   { type: String, required: true },
    is_master:  { type: Boolean, default: false },
    role:       { type: Types.ObjectId, ref: 'Role' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Hash password on create / change
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Admin = model('Admin', adminSchema);

module.exports = { Admin };
