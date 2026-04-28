import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtHelperService } from "./jwt.service";

/**
 * Global JWT helper module.
 *
 * Import once in your root AppModule to make JwtHelperService available
 * application-wide without per-feature imports.
 *
 * JwtModule is registered internally with no default secret — each
 * operation supplies the secret at call-time via ConfigService so that
 * the module remains environment-agnostic.
 */
@Global()
@Module({
    imports: [JwtModule.register({ global: true })],
    providers: [JwtHelperService],
    exports: [JwtHelperService],
})
export class JwtHelperModule {}
