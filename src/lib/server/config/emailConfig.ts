import { env } from '$env/dynamic/private';
import type { FeedbackData } from '$lib/server/schema/feedbackSchema';
import type { Options } from 'nodemailer/lib/smtp-transport';

export function createFeedbackEmailPayload(feedbackData: FeedbackData): Options {
  return {
    from: env.EMAIL_USER,
    to: env.EMAIL_ADMIN,
    subject: 'PolyFlowBuilder Feedback Submitted',
    html: `<h1>PolyFlowBuilder Feedback Submitted</h1>
    <p>Someone has submitted feedback! Take a look at it:</p>
    <p><strong>Subject:</strong> ${feedbackData.subject}</p>
    <p><strong>Return Email:</strong> ${feedbackData.email || 'Not Provided'}</p>
    <p><strong>Feedback:</strong> ${feedbackData.feedback}</p>
    <p>This feedback has also been added to the feedback submission database.</p>
    `
  };
}

export function createPasswordResetEmailPayload(email: string, token: string): Options {
  return {
    from: env.EMAIL_USER,
    to: email,
    subject: 'PolyFlowBuilder Reset Password Link',
    html: `<h1>PolyFlowBuilder Password Reset</h1>
            <p>Someone (hopefully you!) initiated a password reset on the PolyFlowBuilder platform.</p>
            <p>To reset your password, please click the following link (this link will expire in 30 minutes):
              <a href='http://${env.DOMAIN}/resetpassword?token=${encodeURIComponent(
      token
    )}&email=${email}'>Reset Password</a>
            </p>`
  };
}
