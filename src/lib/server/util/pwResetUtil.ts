import crypto from 'crypto';
import argon2 from 'argon2';
import { sendEmail } from './emailUtil';
import { updateUser } from '$lib/server/db/user';
import { createPasswordResetEmailPayload } from '$lib/config/emailConfig.server';
import { clearTokensByEmail, expireAndInsertToken } from '$lib/server/db/token';

export async function startPWResetRoutine(email: string): Promise<void> {
  const token = crypto.randomBytes(64).toString('base64');

  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 30);

  const res = await expireAndInsertToken(email, 'PASSWORD_RESET', token, expiryDate);

  if (res) {
    const passwordResetEmailPayload = createPasswordResetEmailPayload(email, token);
    sendEmail(passwordResetEmailPayload);

    console.log('reset password email sent successfully for', email);
  }
}

export async function resetPassword(email: string, password: string): Promise<void> {
  // delete all reset tokens first
  await clearTokensByEmail(email, 'PASSWORD_RESET');

  // update the password
  const newHashedPassword = await argon2.hash(password, { type: argon2.argon2id });
  await updateUser(email, {
    password: newHashedPassword
  });
}
