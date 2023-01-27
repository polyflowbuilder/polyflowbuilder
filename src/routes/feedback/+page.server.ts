import { fail } from '@sveltejs/kit';
import { feedbackValidationSchema } from '$lib/schema/feedbackSchema';
import { createFeedbackEmailPayload } from '$lib/config/emailConfig.server';
import { createFeedbackReport } from '$lib/server/db/feedback';
import { sendEmail } from '$lib/server/util/emailUtil';
import type { Actions } from '@sveltejs/kit';
import type { FeedbackData } from '$lib/schema/feedbackSchema';

export const actions: Actions = {
  default: async ({ request }) => {
    try {
      const data = Object.fromEntries(await request.formData()) as FeedbackData;

      // validation
      const parseResults = feedbackValidationSchema.safeParse(data);
      if (parseResults.success) {
        // send feedback
        const emailPayload = createFeedbackEmailPayload(parseResults.data);
        sendEmail(emailPayload);

        // insert into feedback report table
        await createFeedbackReport(parseResults.data);

        console.log('received feedback has been recorded and email has been sent!');
      } else {
        // never expect this to happen but here just in case
        const { fieldErrors: feedbackValidationErrors } = parseResults.error.flatten();
        return fail(400, {
          success: false,
          feedbackValidationErrors
        });
      }

      // TODO: add Winston here for logs
      return {
        success: true
      };
    } catch (error) {
      console.log('an internal error occurred', error);
      return fail(500, {
        error: true
      });
    }
  }
};
