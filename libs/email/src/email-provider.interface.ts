export interface IEmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
}

export interface IEmailSendOptions {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    attachments?: IEmailAttachment[];
}

export interface EmailProvider {
    send(options: IEmailSendOptions): Promise<void>;
}
