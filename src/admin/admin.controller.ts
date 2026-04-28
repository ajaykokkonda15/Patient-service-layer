import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new admin (Requires "admin" role)' })
  async createAdmin(@Body() createAdminDto: CreateAdminDto, @CurrentUser() currentUser: any) {
    return this.adminService.createAdmin(createAdminDto, currentUser);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get logged-in admin profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.adminService.getProfile(user.userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update logged-in admin profile' })
  async updateProfile(@CurrentUser() user: any, @Body() updateData: UpdateProfileDto) {
    return this.adminService.updateProfile(user.userId, updateData);
  }
}
