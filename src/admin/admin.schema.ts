import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from '../role/role.schema';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Admin {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  is_master: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
  role: Role;

  created_at?: Date;
  updated_at?: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// Pre-save hook to hash password
AdminSchema.pre('save', async function () {
  const admin = this as AdminDocument;
  if (!admin.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(admin.password, salt);
  admin.password = hash;
});
