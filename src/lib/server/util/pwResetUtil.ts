import argon2 from 'argon2';
import { sendEmail } from './emailUtil';
import { updateUser } from '$lib/server/db/user';
import { initLogger } from '$lib/common/config/loggerConfig';
import { createPasswordResetEmailPayload } from '$lib/server/config/emailConfig';
import { clearTokensByEmail, upsertToken } from '$lib/server/db/token';

const logger = initLogger('Util/PWResetUtil');

// tested in e2e tests

export async function startPWResetRoutine(email: string): Promise<void> {
  logger.info('start password reset routine for', email);

  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 30);

  await clearTokensByEmail(email, 'PASSWORD_RESET');
  const res = await upsertToken(email, 'PASSWORD_RESET', expiryDate);

  if (res) {
    const passwordResetEmailPayload = createPasswordResetEmailPayload(email, res);
    sendEmail(passwordResetEmailPayload);

    logger.info('reset password email sent successfully for', email);
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

  logger.info('Password successfully reset for', email);
}
