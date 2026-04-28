import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EmailService } from "./email.service.js";
import { EmailTemplatesService } from "./auth-email.helper.js";
import { NodemailerProvider } from "./providers/nodemailer.provider.js";

/**
 * Global email module — SMTP only.
 *
 * AWS SES provider and the EmailProviderFactory have been removed.
 * Import once in AppModule to make EmailService and EmailTemplatesService
 * available application-wide.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [NodemailerProvider, EmailService, EmailTemplatesService],
  exports: [EmailService, EmailTemplatesService],
})
export class EmailModule {}
