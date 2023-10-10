import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { getUserFlowcharts } from '$lib/server/db/flowchart';
import { generatePDFSchema } from '$lib/server/schema/generatePDFSchema';
import { generateCourseCacheFlowcharts } from '$lib/server/util/courseCacheUtil';
import { extractPDFDataFromFlowchart, generatePDF } from '$lib/server/util/generatePDF';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/util/generateFlowchartPDF)');

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
      // get and validate that we have a flowchart to generate a PDF from
      const userFlowchartData = await getUserFlowcharts(
        locals.session.id,
        [parseResults.data.flowchartId],
        true
      );
      if (!userFlowchartData.length) {
        return json(
          {
            message: 'Unable to locate the requested flowchart for this user.'
          },
          {
            status: 404
          }
        );
      }
      const { flowchart, programMetadata } = userFlowchartData[0];

      logger.info(`Generating flowchart PDF for flowchart ${flowchart.id}`);

      // fetch necessary course cache info
      if (!programMetadata) {
        throw new Error('programMetadata not found');
      }
      const courseCacheFlowchart = await generateCourseCacheFlowcharts(
        [flowchart],
        programMetadata
      );

      // generate the PDF
      const flowchartPDFData = extractPDFDataFromFlowchart(
        flowchart,
        courseCacheFlowchart,
        programMetadata
      );
      const pdfBuffer = await generatePDF(flowchartPDFData);

      logger.info(`Flowchart PDF generation for flowchart ${flowchart.id} was successful`);

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
