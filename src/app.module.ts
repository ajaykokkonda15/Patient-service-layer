import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { envValidationSchema } from './config/index.js';

// Shared libs
import { DbModule } from '@app/db';

// Feature Modules
import { RoleModule } from './role/role.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/logger.middleware';

@Module({
  imports: [
    // ── Environment configuration ──────────────────────────────────────────
    // isGlobal: true  → ConfigService is available everywhere without re-importing
    // validationSchema → Joi schema; app throws on startup if a required var is absent
    // validationOptions.abortEarly: false → report ALL missing vars at once
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),

    // ── MongoDB ────────────────────────────────────────────────────────────
    // DbModule owns the MongooseModule.forRootAsync setup (libs/db).
    // Connection is driven entirely by DB_* env vars via ConfigService.
    DbModule,

    // ── Feature Modules ────────────────────────────────────────────────────
    RoleModule,
    AdminModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
