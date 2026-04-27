import 'server-only';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM ?? 'HSK Index <noreply@hsk-index.com>';

export async function sendPasswordResetEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  if (!RESEND_API_KEY) {
    // In development without an API key, log the link to the console
    console.info(`[Password Reset] Link for ${email}: ${resetUrl}`);
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(RESEND_API_KEY);

  await resend.emails.send({
    from: FROM_EMAIL,
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
