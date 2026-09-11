import nodemailer, { type Transporter } from 'nodemailer';

interface SendEmailResult {
  success: boolean;
  previewUrl?: string;
  messageId?: string;
  error?: string;
}

let cachedTransporter: Transporter | null = null;

/**
 * Get or initialize the Nodemailer transporter.
 * Uses custom SMTP credentials if provided in process.env, or creates an Ethereal test account for dev.
 */
async function getTransporter(): Promise<Transporter> {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // 1. Check for real SMTP credentials in environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log(`📧 Configured Nodemailer with custom SMTP host: ${process.env.SMTP_HOST}`);
    return cachedTransporter;
  }

  // 2. Development mode: Initialize test Ethereal transporter
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`📧 Nodemailer development Ethereal test account created: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err: any) {
    console.warn(`⚠️ Could not create Ethereal test account (${err.message}). Using JSON fallback transport.`);
    // Fallback transport that logs output safely
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true
    });
    return cachedTransporter;
  }
}

/**
 * Send 6-digit OTP verification email to user
 */
export async function sendVerificationEmail(
  recipientEmail: string,
  otp: string,
  username?: string
): Promise<SendEmailResult> {
  const expiryTime = new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const displayName = username || recipientEmail.split('@')[0];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your CodeElevate account</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #07070a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07070a; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="540" style="max-width: 540px; background-color: #0d0d14; border: 1px solid #222232; border-radius: 16px; padding: 36px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
              <!-- Logo & Brand Header -->
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #FF5A43 0%, #FF8570 100%); width: 44px; height: 44px; border-radius: 12px; line-height: 44px; text-align: center; font-size: 22px; font-weight: 900; color: #ffffff;">
                    &lt;/&gt;
                  </div>
                  <h1 style="margin: 12px 0 4px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    CodeElevate <span style="color: #FF5A43;">AI</span>
                  </h1>
                  <p style="margin: 0; font-size: 11px; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;">
                    Algorithmic Mastery & Technical Assessment
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="border-top: 1px solid #1a1a26; padding-top: 24px;">
                  <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #f8fafc; font-weight: 700;">
                    Verify your email address
                  </h2>
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                    Hello <strong style="color: #f1f5f9;">${displayName}</strong>,<br>
                    Thank you for joining CodeElevate. Please enter the following 6-digit verification code to activate your student account:
                  </p>
                </td>
              </tr>

              <!-- 6-digit OTP Code Box -->
              <tr>
                <td align="center" style="padding: 12px 0 24px 0;">
                  <div style="background-color: #14141f; border: 2px dashed #FF5A43; border-radius: 14px; padding: 18px 24px; display: inline-block;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #ffffff; text-shadow: 0 0 12px rgba(255,90,67,0.4);">
                      ${otp}
                    </span>
                  </div>
                  <p style="margin: 12px 0 0 0; font-size: 12px; color: #FF8570; font-weight: 600;">
                    ⏱️ Code expires in 10 minutes (at ${expiryTime})
                  </p>
                </td>
              </tr>

              <!-- Instructions & Security Notice -->
              <tr>
                <td style="background-color: #101018; border: 1px solid #1e1e2c; border-radius: 10px; padding: 16px; margin-top: 12px;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #cbd5e1; font-weight: 600;">
                    🔒 Security Notice:
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                    Never share this code with anyone. CodeElevate staff will never ask for your verification code. If you did not register for this account, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding-top: 32px; border-top: 1px solid #1a1a26; margin-top: 24px;">
                  <p style="margin: 0; font-size: 11px; color: #475569;">
                    © ${new Date().getFullYear()} CodeElevate AI Academy. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
CodeElevate AI Academy - Email Verification
==================================================

Hello ${displayName},

Thank you for registering on CodeElevate. Your 6-digit email verification code is:

  ${otp}

This code will expire in 10 minutes (at ${expiryTime}).

Enter this code on the registration verification screen to complete your account setup and unlock your learning dashboard.

Security notice: Do not share this code with anyone. If you didn't create an account, you can safely ignore this email.

© ${new Date().getFullYear()} CodeElevate AI Academy
  `.trim();

  // Print prominent visual banner to server terminal for instant development access
  console.log('\n' + '='.repeat(70));
  console.log('✉️  [CodeElevate Email Service] EMAIL VERIFICATION CODE DISPATCHED');
  console.log('='.repeat(70));
  console.log(`👤 Recipient Email : ${recipientEmail}`);
  console.log(`🔑 6-Digit OTP Code : \x1b[1m\x1b[33m${otp}\x1b[0m`);
  console.log(`⏱️  Valid Until     : 10 Minutes (Expires at ${expiryTime})`);

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"CodeElevate Academy" <noreply@codeelevate.io>',
      to: recipientEmail,
      subject: `${otp} is your CodeElevate verification code`,
      text: textContent,
      html: htmlContent
    });

    let previewUrl: string | undefined;
    try {
      const url = nodemailer.getTestMessageUrl(info);
      if (url) {
        previewUrl = url.toString();
        console.log(`🔗 Ethereal Web Preview: ${previewUrl}`);
      }
    } catch {
      // ignore
    }

    console.log(`✅ Verification email successfully sent! MessageId: ${info.messageId}`);
    console.log('='.repeat(70) + '\n');

    return {
      success: true,
      messageId: info.messageId,
      previewUrl
    };
  } catch (err: any) {
    console.error(`⚠️ Email dispatch notice: ${err.message}.`);
    console.log(`👉 In development, the OTP code is logged above for testing.`);
    console.log('='.repeat(70) + '\n');
    return {
      success: false,
      error: err.message
    };
  }
}
