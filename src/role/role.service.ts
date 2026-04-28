import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument, RoleEnum } from './role.schema';

@Injectable()
export class RoleService implements OnModuleInit {
  private readonly logger = new Logger(RoleService.name);

  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async onModuleInit() {
    this.logger.log('Checking and seeding default roles...');
    const roles = [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.STAFF_USER];

    for (const roleName of roles) {
      const exists = await this.roleModel.findOne({ name: roleName });
      if (!exists) {
        await this.roleModel.create({ name: roleName, permissions: [] });
        this.logger.log(`Created default role: ${roleName}`);
      }
    }
  }

  async findByName(name: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name: name as RoleEnum }).exec();
  }
}
