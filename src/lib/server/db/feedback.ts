import type { FeedbackData } from '$lib/schema/feedbackSchema';
import { prisma } from '$lib/server/db/prisma';

export async function createFeedbackReport(feedbackData: FeedbackData): Promise<void> {
  await prisma.feedbackReport.create({
    data: {
      ...feedbackData
    }
  });
}
