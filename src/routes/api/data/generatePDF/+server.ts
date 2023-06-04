import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db/prisma';
import { initLogger } from '$lib/common/config/loggerConfig';
import { generatePDFSchema } from '$lib/server/schema/generatePDFSchema';
import { convertDBFlowchartToFlowchart } from '$lib/server/util/flowDataUtil';
import { extractPDFDataFromFlowchart, generatePDF } from '$lib/server/util/generatePDF';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/data/generatePDF)');

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // ensure request is authenticated
    if (!locals.session) {
      return json(
        {
          message: 'Generate flowchart PDF request must be authenticated.'
        },
        {
          status: 401
        }
      );
    }

    // validation
    const data = Object.fromEntries(url.searchParams);
    const parseResults = generatePDFSchema.safeParse({
      ...data
    });
    if (parseResults.success) {
      const flowchart = await prisma.dBFlowchart.findFirst({
        where: {
          ownerId: locals.session.id,
          id: parseResults.data.flowchartId
        }
      });

      if (!flowchart) {
        return json(
          {
            message: 'Unable to locate the requested flowchart for this user.'
          },
          {
            status: 404
          }
        );
      }

      logger.info(`Generating flowchart PDF for user ${locals.session.id}`);
      const flowchartPDFData = extractPDFDataFromFlowchart(
        convertDBFlowchartToFlowchart(flowchart).flowchart
      );
      const pdfBuffer = await generatePDF(flowchartPDFData);
      logger.info(`Flowchart PDF generation for user ${locals.session.id} was successful`);

      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': pdfBuffer.length.toString()
        },
        status: 200
      });
    } else {
      const { fieldErrors: validationErrors } = parseResults.error.flatten();

      return json(
        {
          message: 'Invalid input received.',
          validationErrors
        },
        {
          status: 400
        }
      );
    }
  } catch (error) {
    logger.error('an internal error occurred', error);
    return json(
      {
        message: 'An error occurred while generating flowchart PDF, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
