import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { EmailProvider, IEmailSendOptions } from "../email-provider.interface";

@Injectable()
export class NodemailerProvider implements EmailProvider {
    private transporter: nodemailer.Transporter;
    private from: string;

    constructor(private readonly config: ConfigService) {
        this.from = this.config.getOrThrow<string>("SMTP_FROM");

        this.transporter = nodemailer.createTransport({
            host: this.config.getOrThrow<string>("SMTP_HOST"),
            port: this.config.getOrThrow<number>("SMTP_PORT"),
            secure: this.config.getOrThrow<boolean>("SMTP_SECURE"),
            auth: {
                user: this.config.getOrThrow<string>("SMTP_USER"),
                pass: this.config.getOrThrow<string>("SMTP_PASS"),
            },
        });
    }

    async send(options: IEmailSendOptions): Promise<void> {
        await this.transporter.sendMail({
            from: this.from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            attachments: options.attachments?.map((att) => ({
                filename: att.filename,
                content: att.content,
                contentType: att.contentType,
            })),
        });
    }
}
