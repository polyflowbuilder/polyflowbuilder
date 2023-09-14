import { fail } from '@sveltejs/kit';
import { sendEmail } from '$lib/server/util/emailUtil';
import { initLogger } from '$lib/common/config/loggerConfig';
import { createFeedbackReport } from '$lib/server/db/feedback';
import { feedbackValidationSchema } from '$lib/server/schema/feedbackSchema';
import type { Actions } from '@sveltejs/kit';
import type { FeedbackData } from '$lib/server/schema/feedbackSchema';

const logger = initLogger('ServerRouteHandler (/feedback)');

export const actions: Actions = {
  default: async ({ request }) => {
    try {
      const data = Object.fromEntries(await request.formData()) as FeedbackData;

      // validation
      const parseResults = feedbackValidationSchema.safeParse(data);
      if (parseResults.success) {
        // send feedback email
        if (!process.env.EMAIL_ADMIN) {
          throw new Error('EMAIL_ADMIN not defined');
        }
        await sendEmail(
          {
            name: 'feedback',
            data: {
              subject: parseResults.data.subject,
              feedbackContent: parseResults.data.feedback,
              returnEmail: parseResults.data.email || undefined
            }
          },
          process.env.EMAIL_ADMIN,
          'PolyFlowBuilder Feedback Submitted'
        );

        // insert into feedback report table
        await createFeedbackReport(parseResults.data);

        logger.info('received feedback has been recorded and email has been sent!');
      } else {
        // never expect this to happen but here just in case
        const { fieldErrors: feedbackValidationErrors } = parseResults.error.flatten();
        return fail(400, {
          success: false,
          feedbackValidationErrors
        });
      }

      return {
        success: true
      };
    } catch (error) {
      logger.error('an internal error occurred', error);
      return fail(500, {
        error: true
      });
    }
  }
};
