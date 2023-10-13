// will handle create HTML representation of PDF output, render PDF using Puppeteer,
// and then send down to user

// flowexport has vite syntax to import the template as a string
// (?url for some reason wasn't including the hashed .ejs file in the final bundle)

import ejs from 'ejs';
import puppeteer from 'puppeteer';
import pdfTemplateString from '$lib/../../api/data/flows/exports/flowexport.ejs?raw';
import { generateTermString } from '$lib/common/util/flowTermUtilCommon';
import {
  getCourseFromCourseCache,
  computeCourseDisplayValues
} from '$lib/common/util/courseDataUtilCommon';
import type { Program } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types';
import type { FlowchartPDFData, FlowchartPDFTermData } from '$lib/types/generatePDFTypes';

export function extractPDFDataFromFlowchart(
  flowchart: Flowchart,
  courseCache: CourseCache,
  programCache: Program[]
): FlowchartPDFData {
  // get program friendly names
  const programFriendlyNames = flowchart.programId
    .map((id) => {
      const programMetadata = programCache.find((program) => program.id === id);

      // TODO: find a way to return non-500 when this happens
      // (look at TERM_MOD logic?)
      if (!programMetadata) {
        throw new Error(`Unable to find program metadata for program ${id}`);
      }

      return programMetadata;
    })
    .map((program) => `${program.catalog} ${program.majorName} (${program.concName})`)
    .join(', ');

  // create PDF term data
  const pdfTermData: FlowchartPDFTermData[] = [];
  flowchart.termData.forEach((term) => {
    // don't include credit bin if there are no courses in it
    if (term.tIndex === -1 && term.courses.length === 0) {
      return;
    }

    const termData: FlowchartPDFTermData = {
      tName: generateTermString(term.tIndex, flowchart.startYear),
      tData: [],
      tUnits: term.tUnits
    };

    term.courses.forEach((course) => {
      const courseMetadata = getCourseFromCourseCache(
        course,
        flowchart.programId,
        courseCache,
        programCache
      );
      termData.tData.push(computeCourseDisplayValues(course, courseMetadata, false));
    });

    pdfTermData.push(termData);
  });

  const flowchartPDFData: FlowchartPDFData = {
    name: flowchart.name,
    programStringFriendly: programFriendlyNames,
    data: pdfTermData,
    notes: flowchart.notes,
    unitTotal: flowchart.unitTotal
  };

  return flowchartPDFData;
}

export async function generatePDF(flowData: FlowchartPDFData): Promise<Buffer> {
  // generate output HTML
  const content = await ejs.render(pdfTemplateString, flowData, {
    async: true
  });

  // spin up puppeteer instance to create PDF
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox', // required for prod. env.
      '--disable-web-security', // these three are required to disable CORS (blocked locally hosted fonts from loading)
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials'
    ],
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setContent(content, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('screen');
  const bufferedPDF = await page.pdf({
    format: 'a4',
    printBackground: true,
    landscape: true
  });
  await browser.close();

  return bufferedPDF;
}
