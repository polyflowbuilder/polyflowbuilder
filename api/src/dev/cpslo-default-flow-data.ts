/* eslint-disable @typescript-eslint/no-unused-vars */
// generate default flow data here
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import http from 'http';

import { apiRoot, getFiles, asyncWait } from './common';
import { loadEnv } from '../../config/envConfig';
import { conPool } from '../../config/dbConfig';

import type {
  APICatalogYearsData,
  APICSheetMetadata,
  APIFlowMetadata,
  DefaultFlowchartMetadata
} from '../types/apiDataTypes';
import type { Flowchart } from '../types/userDataTypes';
// import { performUserDataModelUpgrade } from '../server/userDataModelSync';

// init environment
loadEnv();

// helper function for below
function nthIndex(str: string, pat: string, n: number) {
  const L = str.length;
  let i = -1;
  // eslint-disable-next-line no-plusplus, no-param-reassign
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
}

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
  const eligibleCatalogYears: APICatalogYearsData[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/cpslo-catalog-years-data.json`, 'utf8')
  );

  console.log('eligible catalog years for scrape', eligibleCatalogYears);

  const flowchartLinks: APIFlowMetadata[] = [];
  const cSheetLinks: APICSheetMetadata[] = [];

  const root = 'http://flowcharts.calpoly.edu'; // cannot use HTTPS when downloading the links in downloadPDFsFromLinks()
  const response = await fetch(root);
  const text = await response.text();
  const dom = new JSDOM(text);
  const document = dom.window.document;

  const fetchWait = 500;

  const cYearSelector: HTMLSelectElement = document.querySelector('#dots_roadmapCatalogYear');
  for (const cYearOpt of Array.from(cYearSelector.options)) {
    // regex to remove spaces due to spacing and newline inconsistencies on source page
    const cYearOptCleaned = cYearOpt.innerHTML.replace(/\r?\n|\r/g, '').replace(/\s/g, '');

    if (
      cYearOpt.value !== '' &&
      eligibleCatalogYears.find((cYearEntry) => cYearEntry.full === cYearOptCleaned)
    ) {
      const cYearID = cYearOpt.value;

      // hit endpoint to get data
      // comes in the form of HTML <option> elements, will need to parse
      const majorDataRaw = await fetch(
        `http://flowcharts.calpoly.edu/lookups/myPlan.php?cat=${cYearID}&plan=false`
      ).then((resp) => resp.text());

      const majorDataArr = parseOptionsResponse(majorDataRaw);

      for (const majorDataOpt of majorDataArr) {
        const curMajorName = majorDataOpt[1];

        // hit endpoint to get data
        const concDataRaw = await fetch(
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
          const resultsDataRaw = await fetch(
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
          const flowMajorString = flowId.substring(0, nthIndex(flowId, '.', 2)) || flowId; // if we don't have 2 .'s, then use the entire flowId

          // finally, add metadata
          flowchartLinks.push({
            catalogYear: cYearOptCleaned,
            majorName: curMajorName,
            concName: curConcName,
            flowId: flowId || '',
            link: resultsDataArr[0]
          });
          console.log(`added dflow link [${resultsDataArr[0]}]`);

          if (!cSheetLinks.find((cSheetLinkObj) => cSheetLinkObj.cSheetId === flowMajorString)) {
            cSheetLinks.push({
              catalogYear: cYearOptCleaned,
              majorName: curMajorName,
              cSheetId: flowMajorString,
              link: resultsDataArr[1]
            });
            console.log(`added csheet link [${resultsDataArr[1]}]`);
          }
        }
      }
    }
  }

  // save this data to file
  // TODO: also write out available-program-metadata here instead of in cpslo-courses?
  console.log('writing out scraped links ...');
  fs.writeFileSync(
    `${apiRoot}/cpslo-default-flow-data-links.json`,
    JSON.stringify(
      {
        flows: flowchartLinks,
        cSheets: cSheetLinks
      },
      null,
      4
    )
  );

  console.log('done!');
  process.exit(0);
}

async function downloadPDFsFromLinks() {
  const downloadIdleTime = 100;

  console.log('starting download of PDFs from links ...');

  // read in
  const allLinkData: DefaultFlowchartMetadata = JSON.parse(
    fs.readFileSync(`${apiRoot}/cpslo-default-flow-data-links.json`, 'utf8')
  );
  const { flows } = allLinkData;
  const { cSheets } = allLinkData;

  // now download all of these PDFs!!

  // cleanup first
  console.log('clearing existing PDFs...');

  const pdfRootDir = `${apiRoot}/flows/pdf`;

  fs.removeSync(pdfRootDir);

  // create directory structure
  console.log('starting PDF downloads ...');
  fs.mkdirSync(pdfRootDir);
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
    workingDir = `${pdfRootDir}/dflows/${flowData.catalogYear}/${flowData.majorName}`;
    fs.mkdirSync(workingDir, { recursive: true });

    console.log(`downloading PDF ${path.basename(flowData.link)}`);
    globalLinkWorkingOn = flowData.link;

    const file = fs.createWriteStream(`${workingDir}/${path.basename(flowData.link)}`);
    http.get(flowData.link, (response) => {
      response.pipe(file);
    });

    await asyncWait(downloadIdleTime);
  }

  console.log('download default flow curriculum sheets ...');
  for (const cSheetData of cSheets) {
    workingDir = `${pdfRootDir}/csheet/${cSheetData.catalogYear}`;
    fs.mkdirSync(workingDir, { recursive: true });

    console.log(`downloading cSheet ${path.basename(cSheetData.link)}`);
    globalLinkWorkingOn = cSheetData.link;

    const file = fs.createWriteStream(`${workingDir}/${path.basename(cSheetData.link)}`);
    http.get(cSheetData.link, (response) => {
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
  const allLinkData: DefaultFlowchartMetadata = JSON.parse(
    fs.readFileSync(`${apiRoot}/cpslo-default-flow-data-links.json`, 'utf8')
  );
  const { flows } = allLinkData;

  const jsonRootDir = `${apiRoot}/flows/json`;

  // creating JSON files for dflows; will do csheet later once we actually fully implement this

  // use dflows directory names, but could use csheet too; should be the same
  // don't create new directories/files if they exist already
  for (const flowData of flows) {
    const flowDataDir = `${jsonRootDir}/dflows/${flowData.catalogYear}/${flowData.majorName}`;
    fs.mkdirSync(flowDataDir, { recursive: true });

    console.log(`start create JSON file: ${path.basename(flowData.flowId, '.pdf')}.json`);

    if (!fs.existsSync(`${flowDataDir}/${path.basename(flowData.flowId, '.pdf')}.json`)) {
      fs.closeSync(
        fs.openSync(`${flowDataDir}/${path.basename(flowData.flowId, '.pdf')}.json`, 'w')
      );
      console.log('make JSON', `${flowDataDir}/${path.basename(flowData.flowId, '.pdf')}.json`);
    }
  }
}

// updating flowCollection DB table with all default flow data
// for now, this DB table will ONLY include default flows!
async function updateDatabaseWithDefaultFlowData() {
  console.log('starting update of default flows to database ...');

  // clear first
  console.log('clearing all default flows from DB ...');

  await conPool.execute(`TRUNCATE TABLE ${process.env.DB_TABLE_DEFAULT_FLOWS}`);
  console.log('cleared default flows successfully');

  // load cpslo-default-flow-data-links
  const flowDataLinks: DefaultFlowchartMetadata = JSON.parse(
    fs.readFileSync(`${apiRoot}/cpslo-default-flow-data-links.json`, 'utf8')
  );

  // recursively find all JSON files and insert into db
  (async () => {
    for await (const f of getFiles(`${apiRoot}/flows/json/dflows`)) {
      if (path.extname(f) === '.json') {
        console.log(`adding ${f} to defaultflows DB`);

        let defaultFlowData: Flowchart = null;

        try {
          defaultFlowData = JSON.parse(fs.readFileSync(f, 'utf8'));
        } catch {
          console.log('error with parsing (most likely file is empty)');
        }
        if (defaultFlowData.flowName != null) {
          // use cpslo-default-flow-data-links to generate flow-specific notes
          try {
            const flowLink = flowDataLinks.flows.find(
              (flowDataLinkEntry) => flowDataLinkEntry.flowId === defaultFlowData.flowId
            )?.link;
            const cSheetLink = flowDataLinks.cSheets.find(
              (flowCSheetLinkEntry) =>
                flowCSheetLinkEntry.cSheetId ===
                (defaultFlowData.flowId.substring(0, nthIndex(defaultFlowData.flowId, '.', 2)) ||
                  defaultFlowData.flowId)
            )?.link;

            if (!flowLink) {
              console.log(
                'FLOWLINK RETURNED UNDEFINED, EXPECT BAD LOOKUP (most likely a name mismatch)',
                defaultFlowData.flowName
              );
            }
            if (!cSheetLink) {
              console.log(
                'CSHEETLINK RETURNED UNDEFINED, EXPECT BAD LOOKUP (most likely a name mismatch)',
                defaultFlowData.flowName
              );
            }

            const specificFlowNotes = `This is a default, template flowchart. Change it to fit your needs! Here are some official Cal Poly resources for this flowchart:\n\n* Flowchart: "${flowLink}"\n* Curriculum Sheet: "${cSheetLink}"`;

            defaultFlowData.flowNotes = specificFlowNotes;
            console.log('flow notes updated with custom ones successfully');
          } catch (error) {
            console.log('error occurred while getting flow-specific notes, skipping', error);
          }

          const sqlQuery = `INSERT INTO ${process.env.DB_TABLE_DEFAULT_FLOWS} (flowId, flowUnitTotal, data, flowNotes) VALUES (?, ?, ?, ?)`;

          await conPool.execute(sqlQuery, [
            defaultFlowData.flowId,
            defaultFlowData.flowUnitTotal,
            JSON.stringify(defaultFlowData.data),
            defaultFlowData.flowNotes || ''
          ]);
          console.log(
            `Default flow ${defaultFlowData.flowName} added to default flows DB successfully`
          );
        } else {
          console.log('skipping data upload, data is null ...');
        }
      }
    }

    console.log("clearing NULL flows (ones that we haven't implemented yet)");
    const sqlQuery = `DELETE FROM ${process.env.DB_TABLE_DEFAULT_FLOWS} WHERE data IS NULL`;
    await conPool.execute(sqlQuery);
    console.log('All empty data cleared from table');

    console.log('finished updating default flows DB');
    process.exit(0);
  })();
}

// we MUST bootstrap this w/ main app startup (e.g. export and use in regular hooks.ts or envConfig.ts)
// to use this function, do the following:
// 1. comment out the dev env init line at the top of this file
// 2. uncomment out the code inside the if (defaultFlow.dataModelVersion) block
// 3. import this function and use it at the very end of envConfig.ts (before we set global.envLoaded = true)
// 4. start the main dev app and refresh the browser, so it triggers envConfig
// AFTER using this, perform the above steps in reverse order so we can use this file in the dev init env
export async function updateAllDefaultFlowsToNewDataModel() {
  console.log('starting updating default flows to new data model');

  for await (const f of getFiles(`${apiRoot}/flows/json/dflows`)) {
    if (path.extname(f) === '.json') {
      console.log(`updating ${f} to latest datamodel`);

      let defaultFlowData: Flowchart = null;

      try {
        defaultFlowData = JSON.parse(fs.readFileSync(f, 'utf8'));

        if (defaultFlowData.dataModelVersion) {
          // uncomment this and the import at the top to use, so ts-node won't crash when trying to resolve dep
          // also comment out the initEnv(true) line
          // const updateData = performUserDataModelUpgrade(defaultFlowData);
          // fs.writeFileSync(f, JSON.stringify(updateData, null, 4));
        }
      } catch {
        console.log('error with parsing (most likely file is empty)');
      }
    }
  }
}

// downloadPDFsFromLinks();
// scrapeTemplateFlowMetadata();
// updateDatabaseWithDefaultFlowData();

// since everything in SK is ESM, use (IN dev FOLDER) 'node --loader ts-node/esm --experimental-specifier-resolution=node cpslo-default-flow-data.ts' to run this
// see https://stackoverflow.com/questions/65097694/to-load-an-es-module-set-type-module-in-the-package-json-or-use-the-mjs-e
