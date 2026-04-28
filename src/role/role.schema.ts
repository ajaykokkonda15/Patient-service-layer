import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

export enum RoleEnum {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF_USER = 'staff_user',
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Role {
  @Prop({ type: String, enum: RoleEnum, required: true, unique: true })
  name: RoleEnum;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  created_at?: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
