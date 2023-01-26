import { FEEDBACK_MESSAGE_MAX_LENGTH } from '$lib/config/common/feedbackConfig';
import { z } from 'zod';

// validation schema for feedback
export const feedbackValidationSchema = z.object({
  subject: z.enum(['General Comment', 'Issue', 'Feature Request', 'Other'], {
    required_error: 'Subject field is required.',
    invalid_type_error: 'Invalid subject selected.'
  }),
  email: z
    .string({ required_error: 'Email field is required.' })
    .email({
      message: 'Email must be a valid email address.'
    })
    .or(z.literal('')),
  feedback: z
    .string({ required_error: 'Feedback text is required.' })
    .min(1, {
      message: 'Cannot submit empty feedback.'
    })
    .max(FEEDBACK_MESSAGE_MAX_LENGTH, {
      message: `Feedback message too long, ${FEEDBACK_MESSAGE_MAX_LENGTH} character max.`
    })
});

export type FeedbackData = z.infer<typeof feedbackValidationSchema>;
