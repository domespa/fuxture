import { EmailLog, EmailCampaign } from "@prisma/client";

// EMAIL SINGOLA
export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  campaignId?: string;
  subscriberId?: string;
}
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  emailLog?: EmailLog;
}

// + EMAIL INSIEME
export interface SendBatchEmailOptions {
  subject: string;
  html?: string;
  fromName?: string;
  recipients: Array<{
    email: string;
    subscriberId?: string;
    html?: string;
  }>;
  campaignId?: string;
}
export interface BatchEmailResult {
  total: number;
  sent: number;
  failed: number;
  results: EmailSendResult[];
  duration: number;
}

// STATS
export interface EmailStats {
  campaignId?: string;
  totalSent: number;
  totalFailed: number;
  startedAt: Date;
  completedAt: Date;
}
