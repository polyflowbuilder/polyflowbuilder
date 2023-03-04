import { prisma } from '$lib/server/db/prisma';
import type { FeedbackData } from '$lib/server/schema/feedbackSchema';

export async function createFeedbackReport(feedbackData: FeedbackData): Promise<void> {
  await prisma.feedbackReport.create({
    data: {
      ...feedbackData
    }
  });
}
