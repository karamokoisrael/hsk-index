import 'server-only';

import nodemailer from 'nodemailer';

import { Env } from '@/libs/Env';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function createTransporter() {
  const configs = {
    host: Env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Env.SMTP_PORT ?? 587,
    secure: (Env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: Env.SMTP_USER,
      pass: Env.SMTP_PASS,
    },
  };
  console.log(configs);
  return nodemailer.createTransport(configs);
}

export async function sendPasswordResetEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  if (!Env.SMTP_USER || !Env.SMTP_PASS) {
    console.info(`[Password Reset] Link for ${email}: ${resetUrl}`);
    return;
  }

  const transporter = createTransporter();
  const from = Env.EMAIL_FROM ?? Env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Reset your HSK Index password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="font-size: 20px; font-weight: 600;">Reset your password</h2>
        <p style="color: #555;">Click the link below to set a new password. The link expires in 1 hour.</p>
        <a
          href="${resetUrl}"
          style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #000; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 500;"
        >
          Reset password
        </a>
        <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
