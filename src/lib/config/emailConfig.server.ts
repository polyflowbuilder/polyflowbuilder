import { env } from '$env/dynamic/private';
import type { FeedbackData } from '$lib/schema/feedbackSchema';
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
