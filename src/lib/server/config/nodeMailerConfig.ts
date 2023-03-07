import { initLogger } from '$lib/common/config/loggerConfig';
import type { AuthenticationType } from 'nodemailer/lib/smtp-connection';
import type { Options } from 'nodemailer/lib/smtp-transport';

const logger = initLogger('Config/NodemailerConfig');

let transportAuth: AuthenticationType;
let transportOptions: Options;

// configuration for sending emails
function init(): void {
  transportAuth = {
    user: process.env['EMAIL_USER'],
    pass: process.env['EMAIL_PASS']
  };
  transportOptions = {
    host: process.env['EMAIL_HOST'],
    port: parseInt(process.env['EMAIL_PORT'] as string, 10),
    secure: true,
    auth: transportAuth
  };

  logger.info('Nodemailer configuration updated');
}

export { init, transportAuth, transportOptions };
