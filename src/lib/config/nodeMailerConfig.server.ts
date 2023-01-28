import { env } from '$env/dynamic/private';
import { initLogger } from '$lib/config/loggerConfig';
import type { AuthenticationType } from 'nodemailer/lib/smtp-connection';
import type { Options } from 'nodemailer/lib/smtp-transport';

const logger = initLogger('Config/NodemailerConfig');

let transportAuth: AuthenticationType;
let transportOptions: Options;

// configuration for sending emails
function init(): void {
  transportAuth = {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  };
  transportOptions = {
    host: env.EMAIL_HOST,
    port: parseInt(env.EMAIL_PORT, 10),
    secure: true,
    auth: transportAuth
  };

  logger.info('Nodemailer configuration updated');
}

export { init, transportAuth, transportOptions };
