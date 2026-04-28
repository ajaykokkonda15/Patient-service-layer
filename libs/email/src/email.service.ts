import { Injectable } from "@nestjs/common";
import { NodemailerProvider } from "./providers/nodemailer.provider.js";
import { IEmailSendOptions } from "./email-provider.interface.js";

/**
 * EmailService
 *
 * Thin facade over NodemailerProvider (SMTP).
 * AWS SES and other transports have been removed — only SMTP is supported.
 */
@Injectable()
export class EmailService {
  constructor(private readonly nodemailer: NodemailerProvider) {}

  sendMail(options: IEmailSendOptions): Promise<void> {
    return this.nodemailer.send(options);
  }
}
