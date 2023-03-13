// generate default flow data here
import fs from 'fs';
import path from 'path';
import http from 'http';
import { JSDOM } from 'jsdom';
import { v4 as uuid } from 'uuid';

import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { apiRoot, asyncWait, nthIndex, fetchRetry, getFiles } from './common';
import { updateFlowchartDataModel } from '$lib/server/util/userDataModelSync';
import type { Program } from '@prisma/client';

type TemplateFlowchartMetadata = {
  flows: Program[];
  cSheets: Program[];
};

// helper for scrapeTemplateFlowchartMetadataDirect
function parseOptionsResponse(optionsResponse: string) {
  return optionsResponse
    .split('</option>')
    .slice(1, -1) // remove first and last elements, (garbage elements)
    .map((val) => val.replace("<option value='", '').split("'>"));
}

async function scrapeTemplateFlowMetadata() {
  console.log('starting scrapeTemplateFlowchartMetadata ...');

  // only scrape links for catalogs that are eligible
  const eligibleCatalogYears: string[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  );

  console.log('eligible catalog years for scrape', eligibleCatalogYears);

  const flowchartLinks: Program[] = [];
  const cSheetLinks: Program[] = [];

  const root = 'http://flowcharts.calpoly.edu'; // cannot use HTTPS when downloading the links in downloadPDFsFromLinks()
  const response = await fetchRetry(root);
  const text = await response.text();
  const dom = new JSDOM(text);
  const document = dom.window.document;

  const fetchWait = 500;

  const cYearSelectorOpts = (
    document.querySelector('#dots_roadmapCatalogYear') as HTMLSelectElement | null
  )?.options;

  if (!cYearSelectorOpts) {
    console.log('CYEARSELECTOR RETURNED NULL, BAIL!');
    return;
  }

  for (const cYearOpt of Array.from(cYearSelectorOpts)) {
    // regex to remove spaces due to spacing and newline inconsistencies on source page
    const cYearOptCleaned = cYearOpt.innerHTML.replace(/\r?\n|\r/g, '').replace(/\s/g, '');

    if (
      cYearOpt.value !== '' &&
      eligibleCatalogYears.find((cYearEntry) => cYearEntry === cYearOptCleaned)
    ) {
      const cYearID = cYearOpt.value;

      // hit endpoint to get data
      // comes in the form of HTML <option> elements, will need to parse
      const majorDataRaw = await fetchRetry(
        `http://flowcharts.calpoly.edu/lookups/myPlan.php?cat=${cYearID}&plan=false`
      ).then((resp) => resp.text());

      const majorDataArr = parseOptionsResponse(majorDataRaw);

      for (const majorDataOpt of majorDataArr) {
        const curMajorName = majorDataOpt[1];

        // hit endpoint to get data
        const concDataRaw = await fetchRetry(
          `http://flowcharts.calpoly.edu/lookups/myProgram.php?cat=${cYearID}&plan=${majorDataOpt[0]}`
        ).then((resp) => resp.text());

        const concDataArr = parseOptionsResponse(concDataRaw);

        for (const concDataOpt of concDataArr) {
          const curConcName = concDataOpt[1]
            .replace('\n', '')
            .replace('\r', '')
            .replace('&amp;', '&');
          console.log(
            `\ngetting links for [${cYearOptCleaned} | ${curMajorName} | ${curConcName}] `
          );

          // hit endpoint to get data
          const resultsDataRaw = await fetchRetry(
            `http://flowcharts.calpoly.edu/lookups/myButtons.php?cat=${cYearID}&plan=${majorDataOpt[0]}&prog=${concDataOpt[0]}`
          ).then((resp) => resp.text());

          // to prevent possible rate limiting
          await asyncWait(fetchWait);

          // need to do unique parsing here since now we have the hrefs
          const resultsDataArr = resultsDataRaw
            .split('</a>')
            .map(
              (res) =>
                `${root}${res.substring(res.indexOf('href="') + 8, res.indexOf('class') - 2)}`
            )
            .slice(0, -1);

          const flowId = resultsDataArr[0].split('/').pop()?.replace('.pdf', '');
          if (!flowId) {
            console.log('FLOWID IS NULL, BAIL!');
            return;
          }
          const flowMajorString = flowId.substring(0, nthIndex(flowId, '.', 2)) || flowId; // if we don't have 2 .'s, then use the entire flowId

          // finally, add metadata
          flowchartLinks.push({
            id: uuid(),
            catalog: cYearOptCleaned,
            majorName: curMajorName,
            concName: curConcName,
            code: flowId || '',
            dataLink: resultsDataArr[0]
          });
          console.log(`added dflow link [${resultsDataArr[0]}]`);

          if (!cSheetLinks.find((cSheetLinkObj) => cSheetLinkObj.code === flowMajorString)) {
            cSheetLinks.push({
              id: uuid(),
              catalog: cYearOptCleaned,
              majorName: curMajorName,
              concName: '',
              code: flowMajorString,
              dataLink: resultsDataArr[1]
            });
            console.log(`added csheet link [${resultsDataArr[1]}]`);
          }
        }
      }
    }
  }

  // save this data to file
  console.log('writing out scraped links ...');
  fs.writeFileSync(
    `${apiRoot}/data/cpslo-template-flow-data.json`,
    JSON.stringify(
      {
        flows: flowchartLinks,
        cSheets: cSheetLinks
      },
      null,
      2
    )
  );

  console.log('done!');
  process.exit(0);
}

async function downloadPDFsFromLinks() {
  const downloadIdleTime = 100;

  console.log('starting download of PDFs from links ...');

  // read in
  const allLinkData: TemplateFlowchartMetadata = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-template-flow-data.json`, 'utf8')
  );
  const { flows } = allLinkData;
  const { cSheets } = allLinkData;

  // now download all of these PDFs!!

  // cleanup first
  console.log('clearing existing PDFs...');

  const pdfRootDir = `${apiRoot}/data/flows/pdf`;

  if (fs.existsSync(pdfRootDir)) {
    fs.rmSync(pdfRootDir, {
      recursive: true
    });
  }

  // create directory structure
  console.log('starting PDF downloads ...');
  fs.mkdirSync(pdfRootDir, { recursive: true });
  fs.mkdirSync(`${pdfRootDir}/dflows`);
  fs.mkdirSync(`${pdfRootDir}/csheet`);

  let globalLinkWorkingOn = '';
  let workingDir = '';

  // will occur when TCP connection is closed - wait for a bit, redownload
  process.on('uncaughtException', async () => {
    console.log(`CAUGHT TCP CLOSE, redownloading ${globalLinkWorkingOn}`);

    const file = fs.createWriteStream(`${workingDir}/${path.basename(globalLinkWorkingOn)}`);
    http.get(globalLinkWorkingOn, (response) => {
      response.pipe(file);
    });

    await asyncWait(downloadIdleTime);
    console.log('redownloaded successfully, continue ...');
  });

  console.log('download default flows ...');
  for (const flowData of flows) {
    workingDir = `${pdfRootDir}/dflows/${flowData.catalog}/${flowData.majorName}`;
    fs.mkdirSync(workingDir, { recursive: true });

    console.log(`downloading PDF ${path.basename(flowData.dataLink)}`);
    globalLinkWorkingOn = flowData.dataLink;

    const file = fs.createWriteStream(`${workingDir}/${path.basename(flowData.dataLink)}`);
    http.get(flowData.dataLink, (response) => {
      response.pipe(file);
    });

    await asyncWait(downloadIdleTime);
  }

  console.log('download default flow curriculum sheets ...');
  for (const cSheetData of cSheets) {
    workingDir = `${pdfRootDir}/csheet/${cSheetData.catalog}`;
    fs.mkdirSync(workingDir, { recursive: true });

    console.log(`downloading cSheet ${path.basename(cSheetData.dataLink)}`);
    globalLinkWorkingOn = cSheetData.dataLink;

    const file = fs.createWriteStream(`${workingDir}/${path.basename(cSheetData.dataLink)}`);
    http.get(cSheetData.dataLink, (response) => {
      response.pipe(file);
    });

    await asyncWait(downloadIdleTime);
  }

  console.log('done!');
  process.exit(0);
}

// creating JSON files based off of flowchart PDF names
function createJSONFiles() {
  // read in link data to make folders
  const allLinkData: TemplateFlowchartMetadata = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-template-flow-data.json`, 'utf8')
  );
  const { flows } = allLinkData;

  const jsonRootDir = `${apiRoot}/data/flows/json`;

  // creating JSON files for dflows; will do csheet later once we actually fully implement this

  // use dflows directory names, but could use csheet too; should be the same
  // don't create new directories/files if they exist already
  for (const flowData of flows) {
    const flowDataDir = `${jsonRootDir}/dflows/${flowData.catalog}/${flowData.majorName}`;
    fs.mkdirSync(flowDataDir, { recursive: true });

    console.log(`start create JSON file: ${path.basename(flowData.code, '.pdf')}.json`);

    if (!fs.existsSync(`${flowDataDir}/${path.basename(flowData.code, '.pdf')}.json`)) {
      fs.closeSync(fs.openSync(`${flowDataDir}/${path.basename(flowData.code, '.pdf')}.json`, 'w'));
      console.log('make JSON', `${flowDataDir}/${path.basename(flowData.code, '.pdf')}.json`);
    }
  }
}

async function updateTemplateFlowchartsToLatestDataVersion() {
  await apiDataConfig.init();
  for await (const f of getFiles(`${apiRoot}/data/flows/json/dflows`)) {
    if (path.extname(f) === '.json') {
      console.log(`attempt data version update for flowchart ${f}`);
      try {
        // read, update, and write back out
        const templateFlowData = JSON.parse(fs.readFileSync(f, 'utf8'));

        if (!templateFlowData?.dataModelVersion && !templateFlowData?.version) {
          throw new Error('not a valid flowchart file');
        }

        const updatedTemplateFlowData = updateFlowchartDataModel(
          '11111111-1111-1111-1111-111111111111',
          templateFlowData
        );
        fs.writeFileSync(f, JSON.stringify(updatedTemplateFlowData, null, 2));
      } catch {
        console.log('error with updating flowchart (most likely file is empty)');
      }
    }
  }
}

// scrapeTemplateFlowMetadata();
//downloadPDFsFromLinks();
// createJSONFiles();
updateTemplateFlowchartsToLatestDataVersion();
