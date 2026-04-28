import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RoleService } from '../role/role.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private roleService: RoleService,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto, currentUser: any): Promise<Omit<AdminDocument, 'password'>> {
    const { role: roleName, ...adminData } = createAdminDto;

    // Check if the current user is a master admin when trying to create an 'admin' role
    if (roleName === 'admin' && !currentUser?.is_master) {
      throw new ForbiddenException('Only a master admin can create other admin users');
    }

    const existingAdmin = await this.adminModel.findOne({ email: adminData.email.toLowerCase() });
    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    const role = await this.roleService.findByName(roleName);
    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }

    const newAdmin = new this.adminModel({
      ...adminData,
      role: role._id,
    });

    const savedAdmin = await newAdmin.save();
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedAdmin.toObject();
    return result as any;
  }

  async getProfile(adminId: string): Promise<Omit<AdminDocument, 'password'>> {
    const admin = await this.adminModel.findById(adminId).populate('role', 'name permissions');
    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = admin.toObject();
    return result as any;
  }

  async updateProfile(adminId: string, updateData: UpdateProfileDto): Promise<Omit<AdminDocument, 'password'>> {
    const updatedAdmin = await this.adminModel.findByIdAndUpdate(
      adminId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('role', 'name permissions');

    if (!updatedAdmin) {
      throw new NotFoundException('Admin profile not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedAdmin.toObject();
    return result as any;
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ email: email.toLowerCase() }).populate('role', 'name');
  }
}
