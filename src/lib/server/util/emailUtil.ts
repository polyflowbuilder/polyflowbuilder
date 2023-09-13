import { initLogger } from '$lib/common/config/loggerConfig';
import type { EmailTemplateData } from '$lib/types/emailTemplateTypes';

const logger = initLogger('Util/EmailUtil');

export async function sendEmail(template: EmailTemplateData, to: string, subject: string) {
  // build email payload
  const payload = {
    // request is valid for 1 minute
    expiry: Date.now() + 60000,
    to: {
      email: to
    },
    from: {
      email: process.env.EMAIL_SENDER_EMAIL,
      name: process.env.EMAIL_SENDER_NAME
    },
    subject,
    template
  };
  const stringPayload = JSON.stringify(payload);

  // build signed request
  const encoder = new TextEncoder();

  // import private key
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(process.env.CF_EMAIL_API_PRIV_KEY),
    {
      name: 'HMAC',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  // sign data
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(stringPayload));
  const signature = Buffer.from(signatureBuffer).toString('base64');

  // send the request
  if (!process.env.CF_EMAIL_API_ENDPOINT) {
    throw new Error('sendEmail: CF_EMAIL_API_ENDPOINT is not defined');
  }
  logger.info(`Attempting to send '${template.name}' email to '${to}' via email endpoint`);
  const res = await fetch(process.env.CF_EMAIL_API_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      signature,
      data: stringPayload
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    // get error
    const resData = JSON.stringify(await res.json());
    throw new Error(`sendEmail: failed to send email, status [${res.status}], detail [${resData}]`);
  }
  logger.info(`Email send to '${to}' successful`);
}
