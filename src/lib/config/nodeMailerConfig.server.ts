import { env } from '$env/dynamic/private';
import type { AuthenticationType } from 'nodemailer/lib/smtp-connection';
import type { Options } from 'nodemailer/lib/smtp-transport';

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

  //   log('info', LoggerSenderType.NODEMAILER_CONFIG, 'Nodemailer configuration updated');
  console.log('Nodemailer configuration updated');
}

export { init, transportAuth, transportOptions };
