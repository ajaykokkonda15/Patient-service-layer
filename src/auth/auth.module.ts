import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminModule } from '../admin/admin.module';
import { JwtHelperModule } from '@app/jwt';

@Module({
  imports: [
    AdminModule,
    JwtHelperModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
