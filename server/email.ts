import { Resend } from 'resend';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const DEFAULT_RESEND_SENDER = 'CodeElevate Academy <onboarding@resend.dev>';

// Public webmail domains cannot be verified on Resend (DNS records cannot be added to gmail.com, yahoo.com, etc.)
const UNVERIFIABLE_PUBLIC_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'mail.com',
  'gmx.com'
]);

/**
 * Determine a safe, valid sender address for Resend.
 * Public webmail domains (like @gmail.com) are automatically routed through
 * Resend's verified 'onboarding@resend.dev' test domain.
 */
function resolveSenderAddress(): { address: string; wasOverridden: boolean; original?: string } {
  const raw = process.env.EMAIL_FROM?.trim();
  if (!raw) {
    return { address: DEFAULT_RESEND_SENDER, wasOverridden: false };
  }

  // Extract email address portion (handling "Display Name <email@domain.com>" or "email@domain.com")
  const emailMatch = raw.match(/<([^>]+)>/) || [null, raw];
  const emailPart = (emailMatch[1] || raw).trim().toLowerCase();
  const domainPart = emailPart.split('@')[1];

  if (domainPart && UNVERIFIABLE_PUBLIC_DOMAINS.has(domainPart)) {
    const nameMatch = raw.match(/^([^<]+)</);
    const displayName = nameMatch ? nameMatch[1].trim() : 'CodeElevate Academy';
    return {
      address: `${displayName} <onboarding@resend.dev>`,
      wasOverridden: true,
      original: raw
    };
  }

  return { address: raw, wasOverridden: false };
}

let resendClient: Resend | null = null;

/**
 * Lazy initialization of the Resend client.
 * Returns null if RESEND_API_KEY is not configured in process.env.
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
    console.log('📧 Configured Resend email client with provided API key.');
  }
  return resendClient;
}

/**
 * Send 6-digit OTP verification email to user via Resend
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

  // Print prominent visual banner to server terminal for instant development & debugging access
  console.log('\n' + '='.repeat(70));
  console.log('✉️  [CodeElevate Resend Email Service] EMAIL VERIFICATION CODE DISPATCHED');
  console.log('='.repeat(70));
  console.log(`👤 Recipient Email : ${recipientEmail}`);
  console.log(`🔑 6-Digit OTP Code : \x1b[1m\x1b[33m${otp}\x1b[0m`);
  console.log(`⏱️  Valid Until     : 10 Minutes (Expires at ${expiryTime})`);

  // Skip external Resend network call during unit/integration tests or synthetic test domains
  if (
    process.env.NODE_ENV === 'test' ||
    recipientEmail.endsWith('@example.com') ||
    recipientEmail.endsWith('@test.com') ||
    recipientEmail.endsWith('.invalid')
  ) {
    console.log(`ℹ️ Test environment detected (${recipientEmail}). Verification code logged above; skipping live Resend network call.`);
    console.log('='.repeat(70) + '\n');
    return {
      success: true,
      messageId: `test_mock_${Date.now()}`
    };
  }

  const resend = getResendClient();
  const { address: fromAddress, wasOverridden, original } = resolveSenderAddress();

  if (wasOverridden) {
    console.warn(
      `ℹ️ Notice: EMAIL_FROM is configured as "${original}". Public webmail providers cannot be verified in Resend. Automatically dispatching via "${fromAddress}".`
    );
  }

  if (!resend) {
    console.log('ℹ️  RESEND_API_KEY is not set in environment. Using development terminal log fallback.');
    console.log(`👉 Enter OTP code ${otp} in the verification dialog to proceed.`);
    console.log('='.repeat(70) + '\n');
    return {
      success: true,
      messageId: `dev_fallback_${Date.now()}`
    };
  }

  try {
    let dispatchResult = await resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      subject: `${otp} is your CodeElevate verification code`,
      text: textContent,
      html: htmlContent
    });

    // If an unverified domain error occurred and we weren't already using the default test domain,
    // automatically fallback to the verified test domain and retry dispatch.
    if (
      dispatchResult.error &&
      fromAddress !== DEFAULT_RESEND_SENDER &&
      (dispatchResult.error.message?.toLowerCase().includes('not verified') ||
        dispatchResult.error.name === 'validation_error')
    ) {
      console.warn(
        `⚠️ Sender domain in "${fromAddress}" is unverified (${dispatchResult.error.message}). Retrying via verified "${DEFAULT_RESEND_SENDER}"...`
      );
      dispatchResult = await resend.emails.send({
        from: DEFAULT_RESEND_SENDER,
        to: [recipientEmail],
        subject: `${otp} is your CodeElevate verification code`,
        text: textContent,
        html: htmlContent
      });
    }

    if (dispatchResult.error) {
      console.warn(`⚠️ Resend dispatch notice: ${dispatchResult.error.name} - ${dispatchResult.error.message}`);
      if (dispatchResult.error.message?.includes('only send testing emails to your own email address')) {
        console.log(`💡 Note: Resend's test domain is restricted to sending to the registered account email. To send to any recipient, add a verified custom domain at https://resend.com/domains.`);
      }
      console.log(`👉 In-flight OTP code for verification: ${otp}`);
      console.log('='.repeat(70) + '\n');
      return {
        success: false,
        error: dispatchResult.error.message
      };
    }

    console.log(`✅ Verification email successfully sent via Resend! Message ID: ${dispatchResult.data?.id}`);
    console.log('='.repeat(70) + '\n');

    return {
      success: true,
      messageId: dispatchResult.data?.id
    };
  } catch (err: any) {
    console.warn(`⚠️ Resend dispatch exception: ${err.message}`);
    console.log(`👉 In-flight OTP code for verification: ${otp}`);
    console.log('='.repeat(70) + '\n');
    return {
      success: false,
      error: err.message
    };
  }
}
