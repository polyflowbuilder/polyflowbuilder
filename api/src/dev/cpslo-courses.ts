/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
// javascript to interact with CPSLO course catalog data!
// use these routines to generate all the course metadata needed!

// dependencies
import { JSDOM } from 'jsdom';
import fetch from 'isomorphic-fetch';
import fs from 'fs-extra';
import path from 'path';

import { StaticCourseData, StaticCourseRequisiteData, StaticGEData } from '../../types/static';
import { getFiles, apiRoot } from './common';

// see https://previouscatalogs.calpoly.edu/
const catalogRoots = [
  // see "updates to the catalog" links on these to get itemized changes w/in catalog!
  'http://catalog.calpoly.edu/previouscatalogs/2015-2017/coursesaz/',
  'http://catalog.calpoly.edu/previouscatalogs/2017-2019/coursesaz/',
  'http://catalog.calpoly.edu/previouscatalogs/2019-2020/coursesaz/',
  'https://catalog.calpoly.edu/previouscatalogs/2020-2021/coursesaz/',
  'https://catalog.calpoly.edu/previouscatalogs/2021-2022/coursesaz/',
  'http://catalog.calpoly.edu/coursesaz/' // latest, 2022-2026 "fluid"
];
const catalogNames = JSON.parse(
  fs.readFileSync(`${apiRoot}/cpslo-catalog-years-data.json`, 'utf8')
);

// scrapes http://catalog.calpoly.edu/coursesaz/ to get all links for program classes
async function getAllProgramLinks(root: string) {
  console.log('starting getAllProgramLinks ...');
  console.log('scraping root link ...');

  const programLinks = [];

  const response = await fetch(root);
  const text = await response.text();
  const dom = new JSDOM(text);
  const parentTable = dom.window.document.querySelectorAll('.sitemaplink');

  for (const tElement of Array.from(parentTable)) {
    // grab href to get full link
    const programCode = tElement.attributes.getNamedItem('href')!.textContent;
    programLinks.push(`http://catalog.calpoly.edu${programCode}`);
  }
  return programLinks;
}

// uses programLinks to get all course data by scraping each link
async function getAllCourses(programLinks: string[], outFile: string, root: string) {
  console.log('starting getAllCourses ...');
  console.log('start scrape ...');

  const allCourseData = [];

  for (const link of programLinks) {
    console.log(`scraping ${link} ...`);
    const response = await fetch(link);
    const text = await response.text();
    const dom = new JSDOM(text);

    const prefix = link.replace(root, '').slice(0, -1);
    console.log(`prefix is ${prefix}`);

    const courseBlocks = dom.window.document.querySelectorAll('.courseblock');
    for (const courseBlock of Array.from(courseBlocks)) {
      const courseData: StaticCourseData = {
        cID: '',
        cDisplayName: '',
        cNum: '',
        cUnits: '',
        cDesc: '',
        cAddl: ''
      };

      // grab course ID and display name; not optimal as we're relying on
      // HTML formatting on unknown webpage that may change in future, breaking this!
      // keep cID as array to coerce array type for ts
      let cID: string[] = [courseBlock.querySelector('.courseblocktitle > strong')!.textContent!];
      cID = cID[0].slice(0, cID[0].indexOf('\n')).split(/. (.+)/); // regex for splitting on FIRST '. ' ONLY!
      const cDisplayName = cID[1].substring(0, cID[1].length - 1);
      const cNum = cID[0].replace(/\D/g, '');
      cID = [cID[0].replace(/\s/g, '')];

      // units
      let cUnits = courseBlock.querySelector('.courseblockhours')!.textContent!;
      cUnits = cUnits.slice(0, cUnits.indexOf(' '));

      // description - need to be be able to handle any amount of paragraphs
      const cDescQuery = courseBlock.querySelectorAll('.courseblockdesc > p');
      let cDesc = '';
      cDescQuery.forEach((desc) => {
        cDesc += `${desc.textContent}\n`;
      });

      // additional info - need to be able to handle any amount of paragraphs
      const cAddlQuery = courseBlock.querySelectorAll('.courseextendedwrap > p');
      let cAddl = '';
      if (cAddlQuery.length === 0) {
        cAddl = 'n/a';
      } else {
        cAddlQuery.forEach((addl) => {
          cAddl += `${addl.textContent}\n`;
        });
      }

      // add data; object destructuring
      [courseData.cID] = cID; // array destructuring; courseData.cID = cID[0];
      courseData.cDisplayName = cDisplayName;
      courseData.cNum = cNum;
      courseData.cUnits = cUnits;
      courseData.cDesc = cDesc;
      courseData.cAddl = cAddl;

      // add into master for program
      allCourseData.push(courseData);
    }
  }

  console.log(`writing out catalog data to [${outFile}]`);
  fs.writeFileSync(outFile, JSON.stringify(allCourseData, null, 4));
}

async function updateAllCourseData(root: string, outFile: string) {
  console.log(`root is ${root}`);

  const programLinks = await getAllProgramLinks(root);
  await getAllCourses(programLinks, outFile, root);
}

async function buildCourseDataAllCatalogYears() {
  // will create files for catalog data for each year
  // we will then need to upload each unique class to master DB
  // when app starts up, download all this DB data

  console.log('Starting master course data construction ...');

  const courseDataAllRootDir = `${apiRoot}/courses`;

  if (fs.existsSync(courseDataAllRootDir)) {
    fs.removeSync(courseDataAllRootDir);
  }
  fs.mkdirSync(courseDataAllRootDir);

  for (let i = 0; i < catalogRoots.length; i += 1) {
    await updateAllCourseData(catalogRoots[i], `${courseDataAllRootDir}/${catalogNames[i]}.json`);
  }
}

function sniffGWRCourses(inFile: string, outFile: string) {
  console.log(`starting sniffGWRcourses, infile ${inFile}, outFile ${outFile}`);

  const courseData = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const gwrCourses: string[] = [];

  courseData.forEach((c: StaticCourseData) => {
    if (c.cAddl.includes('GWR\n') || c.cAddl.includes('GWR;')) {
      gwrCourses.push(c.cID);
    }
  });

  fs.writeFileSync(outFile, JSON.stringify(gwrCourses, null, 4));
  console.log(`successfully wrote sniffed GWR courses to ${outFile}`);
}
function sniffUSCPCourses(inFile: string, outFile: string) {
  console.log(`starting sniffUSCPcourses, infile ${inFile}, outFile ${outFile}`);

  const courseData = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const uscpCourses: string[] = [];

  courseData.forEach((c: StaticCourseData) => {
    if (c.cAddl.includes('USCP\n') || c.cAddl.includes('USCP;')) {
      uscpCourses.push(c.cID);
    }
  });

  fs.writeFileSync(outFile, JSON.stringify(uscpCourses, null, 4));
  console.log(`successfully wrote sniffed USCP courses to ${outFile}`);
}
function sniffGECourses(inFile: string, outFile: string) {
  console.log(`starting sniffGEcourses, infile ${inFile}, outFile ${outFile}`);

  const courseData = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const geCourses: StaticGEData = {
    geA1: [],
    geA2: [],
    geA3: [],
    geB1: [],
    geB2: [],
    geB3: [],
    geB4: [],
    geUDB: [],
    geC1: [],
    geC2: [],
    geUDC: [],
    geD1: [],
    geD2: [],
    geUDD: [],
    geE: []
  };

  courseData.forEach((c: StaticCourseData) => {
    if (c.cAddl.includes('GE Area A1\n')) {
      geCourses.geA1.push(c.cID);
    }
    if (c.cAddl.includes('GE Area A2\n')) {
      geCourses.geA2.push(c.cID);
    }
    if (c.cAddl.includes('GE Area A3\n')) {
      geCourses.geA3.push(c.cID);
    }
    if (c.cAddl.includes('GE Area B1\n')) {
      geCourses.geB1.push(c.cID);
    }
    if (c.cAddl.includes('GE Area B2\n')) {
      geCourses.geB2.push(c.cID);
    }
    if (c.cAddl.includes('GE Area B3\n')) {
      geCourses.geB3.push(c.cID);
    }
    if (c.cAddl.includes('GE Area B4\n')) {
      geCourses.geB4.push(c.cID);
    }
    if (c.cAddl.includes('GE Area B4\n')) {
      geCourses.geB4.push(c.cID);
    }
    if (c.cAddl.includes('Upper-Div GE Area B\n')) {
      geCourses.geUDB!.push(c.cID);
    }
    if (c.cAddl.includes('GE Area C1\n')) {
      geCourses.geC1.push(c.cID);
    }
    if (c.cAddl.includes('GE Area C2\n')) {
      geCourses.geC2.push(c.cID);
    }
    if (c.cAddl.includes('Upper-Div GE Area C\n')) {
      geCourses.geUDC!.push(c.cID);
    }
    if (c.cAddl.includes('GE Area D1\n')) {
      geCourses.geD1.push(c.cID);
    }
    if (c.cAddl.includes('GE Area D2\n')) {
      geCourses.geD2.push(c.cID);
    }
    if (c.cAddl.includes('Upper-Div GE Area D\n')) {
      geCourses.geUDD!.push(c.cID);
    }
    if (c.cAddl.includes('GE Area E\n')) {
      geCourses.geE!.push(c.cID);
    }
  });

  fs.writeFileSync(outFile, JSON.stringify(geCourses, null, 4));
  console.log(`successfully wrote sniffed GE courses to ${outFile}`);
}

function findGWRUSCPGECoursesAllCatalogs() {
  // will sniff out GWR & USCP courses in all catalogs
  // ***MAKE SURE TO STILL MANUALLY VERIFY!***

  (async () => {
    // for now, will only do 2020-2021 as that's the only catalog year we have data for
    for await (const f of getFiles(`${__dirname}/../api/courses`)) {
      if (path.extname(f) === '.json') {
        console.log(`sniffing GWR courses for ${f}`);
        sniffGWRCourses(f, `${__dirname}/../api/courses/${path.basename(f, '.json')}-GWR.json`);

        console.log(`sniffing USCP courses for ${f}`);
        sniffUSCPCourses(f, `${__dirname}/../api/courses/${path.basename(f, '.json')}-USCP.json`);

        console.log(`sniffing GE courses for ${f}`);
        sniffGECourses(f, `${__dirname}/../api/courses/${path.basename(f, '.json')}-GE.json`);
      }
    }
  })();
}

// will produce prereq files with the following fields:
// - prerequisite classes
// - corequisite classes
// - recommended classes
// - concurrent classes
function generateCourseRequisiteData(catalogYearString: string) {
  console.log(`generating course prereq/coreq/recommended data for ${catalogYearString}...`);
  // read data
  const courseData: StaticCourseData[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/courses/${catalogYearString}/${catalogYearString}.json`, 'utf8')
  );
  const prereqData: StaticCourseRequisiteData[] = [];

  // for static course data overrides
  const OVERWRITE_EXISTING_OVERRIDE_COURSE_LIST = false;
  const overrideCoursesList: StaticCourseData[] = [];

  courseData.forEach((course: StaticCourseData) => {
    // generate strings
    let prereqString = '';
    let coreqString = '';
    let recommendedString = '';
    let concurrentString = '';

    // replace "prerequisite or concurrent" and "prerequisite or corequisite" with corequisite
    // (because that's what it is)
    let searchString = course.cAddl;
    searchString = searchString.replace(
      /prerequisite or concurrent|prerequisite or corequisite/gi,
      'Corequisite'
    );

    // extra cond for prereq due to 'prerequisites' (with an s)
    if (searchString.indexOf('Prerequisite:') !== -1) {
      prereqString = searchString.substring(
        searchString.indexOf('Prerequisite:') + 14,
        searchString.indexOf('.', searchString.indexOf('Prerequisite:'))
      );
    } else if (searchString.indexOf('Prerequisites:') !== -1) {
      prereqString = searchString.substring(
        searchString.indexOf('Prerequisites:') + 15,
        searchString.indexOf('.', searchString.indexOf('Prerequisites:'))
      );
    }

    if (searchString.indexOf('Corequisite:') !== -1) {
      coreqString = searchString.substring(
        searchString.indexOf('Corequisite:') + 13,
        searchString.indexOf('.', searchString.indexOf('Corequisite:'))
      );
    }
    if (searchString.indexOf('Recommended:') !== -1) {
      recommendedString = searchString.substring(
        searchString.indexOf('Recommended:') + 13,
        searchString.indexOf('.', searchString.indexOf('Recommended:'))
      );
    }
    if (searchString.indexOf('Concurrent:') !== -1) {
      concurrentString = searchString.substring(
        searchString.indexOf('Concurrent:') + 12,
        searchString.indexOf('.', searchString.indexOf('Concurrent:'))
      );
    }

    // check to see if any course details are present in cDesc
    // if they are, this needs to be resolved manually in [catalog]-override.json
    const searchStringCDescCheck = course.cDesc.replace(
      /prerequisite or concurrent|prerequisite or corequisite/gi,
      'Corequisite'
    );
    if (
      searchStringCDescCheck.indexOf('Prerequisite:') !== -1 ||
      searchStringCDescCheck.indexOf('Prerequisites:') !== -1 ||
      searchStringCDescCheck.indexOf('Corequisite:') !== -1 ||
      searchStringCDescCheck.indexOf('Recommended:') !== -1 ||
      searchStringCDescCheck.indexOf('Concurrent:') !== -1
    ) {
      // create [catalog]-override.json and add these courses into it for easier modification
      console.log(
        'ADDL COURSE REQ DATA FOUND IN CDESC (resolve this manually by editing the [catalog]-override.json file)! Catalog:',
        catalogYearString,
        'Course:',
        course.cID
      );
      overrideCoursesList.push(course);
    }

    const dataObj = {
      cID: course.cID,
      prereq: prereqString.split(/,|, and /),
      coreq: coreqString.split(','),
      recomm: recommendedString.split(','),
      concur: concurrentString.split(',')
    };
    // push to new object
    prereqData.push(dataObj);
  });

  console.log('writing out JSON API static course data');

  // this file is now updated MANULLY, so DO NOT WRITE!!
  fs.writeFileSync(
    `${apiRoot}/courses/${catalogYearString}/${catalogYearString}-req.json`,
    JSON.stringify(prereqData, null, 4)
  );

  // write out [catalog]-override.json file
  if (
    fs.existsSync(`${apiRoot}/courses/${catalogYearString}/${catalogYearString}-override.json`) &&
    !OVERWRITE_EXISTING_OVERRIDE_COURSE_LIST
  ) {
    console.log(
      'Override file already exists; NOT overwriting due to overwrite flag not being set.'
    );
  } else {
    fs.writeFileSync(
      `${apiRoot}/courses/${catalogYearString}/${catalogYearString}-override.json`,
      JSON.stringify(overrideCoursesList, null, 4)
    );
    console.log('Override file written out successfully.');
  }

  console.log('done!');
}

// generateCoursePrerequisiteData("2015-2017");
// generateCoursePrerequisiteData("2017-2019");
// generateCoursePrerequisiteData("2019-2020");
// generateCoursePrerequisiteData("2020-2021");
// updateCoursePrerequisiteData('2020-2021');

// updateAllCourseData('http://catalog.calpoly.edu/coursesaz/', `${apiRoot}/courses/2022-2026/2022-2026.json`);
// sniffGECourses(`${apiRoot}/courses/2022-2026/2022-2026.json`, `${apiRoot}/courses/2022-2026/2022-2026-GE.json`);
// sniffGWRCourses(`${apiRoot}/courses/2022-2026/2022-2026.json`, `${apiRoot}/courses/2022-2026/2022-2026-GWR.json`);
// sniffUSCPCourses(`${apiRoot}/courses/2022-2026/2022-2026.json`, `${apiRoot}/courses/2022-2026/2022-2026-USCP.json`);
generateCourseRequisiteData('2022-2026');
