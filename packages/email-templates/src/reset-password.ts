/**
 * Password Reset Email Template
 * Simple, elegant black and white grid combination design without animations
 */

export interface ResetPasswordEmailProps {
  otp: string;
  expiresInMinutes?: number;
}

export function generateResetPasswordEmail({
  otp,
  expiresInMinutes = 10,
}: ResetPasswordEmailProps): string {
  // Split OTP into individual digits
  const otpDigits = otp.split('');

  // Generate OTP digit cells HTML
  const otpCellsHtml = otpDigits.map((digit, index) => {
    const bgColor = index % 2 === 0 ? '#000000' : '#ffffff';
    const textColor = index % 2 === 0 ? '#ffffff' : '#000000';
    return `
      <td style="width: 50px; height: 60px; background-color: ${bgColor}; border: 2px solid #000000; text-align: center; vertical-align: middle;">
        <span style="color: ${textColor}; font-size: 32px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 0;">
          ${digit}
        </span>
      </td>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
  </head>
  <body style="margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; background:#f7f7f7;">
    <table role="presentation" style="width:100%; border-collapse:collapse; padding:40px 20px; background:#f7f7f7;">
      <tr>
        <td align="center">
  
          <!-- Main Wrapper -->
          <table role="presentation" style="max-width:620px; width:100%; border-collapse:collapse; background:#ffffff; border:1px solid #000; box-shadow:0 4px 18px rgba(0,0,0,0.08); border-radius:6px; overflow:hidden;">
  
            <!-- Header -->
            <tr>
              <td style="padding:0;">
                <table role="presentation" style="width:100%; border-collapse:collapse;">
                  <tr>
  
                    <td style="width:50%; background:#000; padding:28px 20px; text-align:center; vertical-align:middle;">
                      <h1 style="margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:1.5px;">
                        PASSWORD
                      </h1>
                    </td>
  
                    <td style="width:50%; background:#fff; padding:28px 20px; text-align:center; vertical-align:middle; border-left:1px solid #000;">
                      <h1 style="margin:0; color:#000; font-size:22px; font-weight:700; letter-spacing:1.5px;">
                        RESET
                      </h1>
                    </td>
  
                  </tr>
                </table>
              </td>
            </tr>
  
            <!-- Body Content -->
            <tr>
              <td style="padding:40px 32px;">
  
                <p style="margin:0 0 18px 0; color:#222; font-size:16px; line-height:1.6;">
                  Hello there,
                </p>
  
                <p style="margin:0 0 28px 0; color:#333; font-size:16px; line-height:1.6;">
                  We received a request to reset your password for your <strong>Script AI</strong> account. Use the OTP code below to verify your identity:
                </p>
  
                <!-- OTP Box -->
                <table role="presentation" style="width:100%; border-collapse:collapse; margin:38px 0;">
                  <tr>
                    <td>
                      <table role="presentation" style="width:100%; border-collapse:collapse; border:1px solid #000; border-radius:6px; overflow:hidden;">
  
                        <tr>
                          <td style="background:#fafafa; padding:18px; text-align:center; border-bottom:1px solid #000;">
                            <p style="margin:0; color:#666; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1.6px;">
                              Your Verification Code
                            </p>
                          </td>
                        </tr>
  
                        <tr>
                          <td style="padding:28px 20px; text-align:center;">
                            <table role="presentation" style="margin:0 auto; border-collapse:collapse;">
                              <tr>
                                ${otpCellsHtml}
                              </tr>
                            </table>
                          </td>
                        </tr>
  
                        <tr>
                          <td style="background:#fafafa; padding:14px; text-align:center; border-top:1px solid #000;">
                            <p style="margin:0; color:#333; font-size:12px; font-weight:600;">
                              ⏱️ This code expires in ${expiresInMinutes} minutes
                            </p>
                          </td>
                        </tr>
  
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="margin:26px 0 30px 0; color:#555; font-size:14px; line-height:1.6;">
                  Enter this code on the password reset page to verify your identity and create a new password.
                </p>

                <!-- Security Notice -->
                <table role="presentation" style="width:100%; border-collapse:collapse; border:1px solid #000; border-radius:6px; overflow:hidden; margin-top:40px;">
                  <tr>
                    <td style="background:#000; padding:14px; text-align:center;">
                      <p style="margin:0; color:#fff; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">
                        ⚠️ Security Notice
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#fff; padding:22px;">
                      <p style="margin:0 0 10px 0; color:#333; font-size:13px; line-height:1.6;">
                        If you didn't request a password reset, please ignore this email. Your account remains secure.
                      </p>
                      <p style="margin:0; color:#666; font-size:12px; line-height:1.5;">
                        This is an automated email. Please do not reply to this message.
                      </p>
                    </td>
                  </tr>
                </table>
  
              </td>
            </tr>
  
            <!-- Footer -->
            <tr>
              <td>
                <table role="presentation" style="width:100%; border-collapse:collapse; border-top:1px solid #000;">
                  <tr>
                    <td style="background:#000; padding:20px; text-align:center;">
                      <p style="margin:0; color:#fff; font-size:11px; letter-spacing:1px;">
                        © ${new Date().getFullYear()} Script AI. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
  
          </table>
  
        </td>
      </tr>
    </table>
  </body>
  </html>
  `.trim();

}

