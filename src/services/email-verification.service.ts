import crypto from 'crypto';

import prisma from '../config/prisma';
import { sendEmailVerificationEmail } from './email.service';

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const createEmailVerification = async (
  userId: string,
  email: string
) => {
  const token = crypto.randomBytes(32).toString('hex');

  await prisma.emailVerificationToken.deleteMany({
    where: { user_id: userId, used_at: null },
  });

  await prisma.emailVerificationToken.create({
    data: {
      user_id: userId,
      token_hash: hashToken(token),
      expires_at: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    },
  });

  const verificationLink =
    `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await sendEmailVerificationEmail(email, verificationLink);
};

export const resendEmailVerification = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase().trim(),
      deleted_at: null,
    },
    select: {
      id: true,
      email: true,
      email_verified_at: true,
    },
  });

  if (!user || user.email_verified_at) {
    return;
  }

  await createEmailVerification(user.id, user.email);
};

export const verifyEmail = async (plainToken: string) => {
  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      token_hash: hashToken(plainToken),
      used_at: null,
    },
  });

  if (!record) {
    throw new Error('Invalid or expired verification token');
  }

  if (record.expires_at < new Date()) {
    throw new Error('Verification token has expired');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.user_id },
      data: { email_verified_at: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { used_at: new Date() },
    }),
  ]);
};
