import nodemailer from 'nodemailer';
import { transportOptions } from '$lib/server/config/nodeMailerConfig';
import { initLogger } from '$lib/common/config/loggerConfig';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { Options } from 'nodemailer/lib/smtp-transport';

const logger = initLogger('Util/EmailUtil');

export function sendEmail(messagePayload: Options): SMTPTransport.SentMessageInfo | null {
  const transport = nodemailer.createTransport(transportOptions);
  let sentMessageInfo: SMTPTransport.SentMessageInfo | null = null;

  // don't send an email if we're in the testing environment
  if (process.env.NODE_ENV === 'test') {
    logger.info('detected running in a test environment, aborting email send');
  } else {
    transport.sendMail(messagePayload, (err, info) => {
      if (err) throw err;
      sentMessageInfo = info;
    });
  }

  return sentMessageInfo;
}
