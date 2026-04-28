import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminService } from '../admin/admin.service';
import { LoginDto } from './dto/login.dto';
import { JwtHelperService } from '@app/jwt';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtHelperService: JwtHelperService,
  ) {}

  async login(loginDto: LoginDto) {
    const admin = await this.adminService.findByEmail(loginDto.email);
    
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Role will be populated due to the service method
    const roleName = admin.role?.name || 'unknown';

    // The current access token payload in jwt.types.ts only expects userId and email
    // but we'll include role so it can be checked in RolesGuard. 
    // We cast it as any to bypass the strict typing or extend it.
    const payload = {
      userId: admin._id.toString(),
      email: admin.email,
      role: roleName,
      is_master: admin.is_master,
    };

    const token = await this.jwtHelperService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: admin._id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: roleName,
      }
    };
  }

  logout() {
    // For JWTs, logout is generally handled client-side by deleting the token.
    // Server-side invalidation requires a blacklist strategy.
    return { message: 'Successfully logged out' };
  }
}
