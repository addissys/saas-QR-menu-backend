import nodemailer from 'nodemailer';

/*
|--------------------------------------------------------------------------
| Mail Transporter
|--------------------------------------------------------------------------
*/

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  toEmail: string,
  resetLink: string
) => {
  const mailUser = process.env.MAIL_USER?.trim();
  const mailPass = process.env.MAIL_PASS?.trim();

  // Do not pretend the email was sent when SMTP is not configured.
  if (!mailUser || !mailPass) {
    throw new Error(
      'SMTP credentials are not configured'
    );
  }

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || 'QR Menu'}" <${
      process.env.MAIL_FROM_ADDRESS || mailUser
    }>`,
    to: toEmail,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>

        <p>
          You requested a password reset.
          Click the button below to reset your password.
        </p>

        <p>
          This link will expire in
          <strong>15 minutes</strong>.
        </p>

        <a
          href="${resetLink}"
          style="
            display: inline-block;
            background-color: #4F46E5;
            color: #fff;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin: 16px 0;
          "
        >
          Reset Password
        </a>

        <p style="color: #666; font-size: 13px;">
          If you did not request this, you can safely ignore this email.
        </p>

        <p style="color: #666; font-size: 13px;">
          Or copy and paste this link into your browser:
          <br />
          <a href="${resetLink}">
            ${resetLink}
          </a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log(
      `Password reset email successfully sent to ${toEmail}`
    );
  } catch (error) {
    console.error(
      'Failed to send password reset email via SMTP:',
      error
    );

    throw new Error(
      'Failed to send password reset email'
    );
  }
};

/**
 * Send an email verification link.
 */
export const sendEmailVerificationEmail = async (
  toEmail: string,
  verificationLink: string
) => {
  const mailUser = process.env.MAIL_USER?.trim();
  const mailPass = process.env.MAIL_PASS?.trim();

  if (!mailUser || !mailPass) {
    throw new Error('SMTP credentials are not configured');
  }

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || 'QR Menu'}" <${
      process.env.MAIL_FROM_ADDRESS || mailUser
    }>`,
    to: toEmail,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify your email address</h2>
        <p>Click the button below to verify your QR Menu account.</p>
        <p>This link will expire in <strong>24 hours</strong>.</p>
        <a href="${verificationLink}" style="display: inline-block; background-color: #4F46E5; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0;">Verify Email</a>
        <p style="color: #666; font-size: 13px;">Or copy and paste this link into your browser:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email verification message successfully sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send email verification message via SMTP:', error);
    throw new Error('Failed to send email verification message');
  }
};