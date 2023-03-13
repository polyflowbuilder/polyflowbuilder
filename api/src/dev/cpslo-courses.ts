// javascript to interact with CPSLO course catalog data!
// use these routines to generate all the course metadata needed!

// dependencies
import { JSDOM } from 'jsdom';
import fs from 'fs';

import { apiRoot, fetchRetry } from './common';

// API data types
import type { APICourse } from '@prisma/client';

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
  fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
) as string[];

// scrapes http://catalog.calpoly.edu/coursesaz/ to get all links for program classes
async function getAllProgramLinks(root: string): Promise<string[]> {
  console.log('starting getAllProgramLinks ...');
  console.log('scraping root link ...');

  const programLinks: string[] = [];

  const response = await fetchRetry(root);
  const text = await response.text();
  const dom = new JSDOM(text);
  const parentTable = dom.window.document.querySelectorAll('.sitemaplink');

  for (const tElement of Array.from(parentTable) as Element[]) {
    // grab href to get full link
    const namedItem = tElement.attributes.getNamedItem('href');
    if (namedItem) {
      programLinks.push(`http://catalog.calpoly.edu${namedItem.textContent}`);
    } else {
      console.log('MISSING HREF IN TELEMENT, BAIL!', tElement);
      return [];
    }
  }
  return programLinks;
}

// uses programLinks to get all course data by scraping each link
async function getAllCoursesCatalog(
  catalog: string,
  programLinks: string[],
  outFile: string,
  root: string
): Promise<void> {
  console.log('starting getAllCourses ...');
  console.log('start scrape ...');

  const allCourseData: APICourse[] = [];

  for (const link of programLinks) {
    console.log(`scraping ${link} ...`);
    const response = await fetchRetry(link);
    const text = await response.text();
    const dom = new JSDOM(text);

    const prefix = link.replace(root, '').slice(0, -1);
    console.log(`prefix is ${prefix}`);

    const courseBlocks = dom.window.document.querySelectorAll('.courseblock');
    for (const courseBlock of Array.from(courseBlocks) as Element[]) {
      // grab course ID and display name; not optimal as we're relying on
      // HTML formatting on unknown webpage that may change in future, breaking this!
      const courseIdSelector = courseBlock.querySelector('.courseblocktitle > strong')?.textContent;
      const unitSelector = courseBlock.querySelector('.courseblockhours')?.textContent;
      const descriptionSelector = courseBlock.querySelectorAll('.courseblockdesc > p');
      const addlSelector = courseBlock.querySelectorAll('.courseextendedwrap > p');
      if (!courseIdSelector || !unitSelector) {
        console.log('A SELECTOR FOR THE COURSE WAS NULL, BAIL!', courseBlock);
        return;
      }

      const courseData: APICourse = {
        id: '',
        catalog,
        displayName: '',
        units: '',
        desc: '',
        addl: '',
        gwrCourse: false,
        uscpCourse: false
      };

      const courseIdParts = courseIdSelector
        .slice(0, courseIdSelector.indexOf('\n'))
        .split(/. (.+)/); // regex for splitting on FIRST '. ' ONLY!

      courseData.id = courseIdParts[0].replace(/\s/g, '');
      courseData.displayName = courseIdParts[1].substring(0, courseIdParts[1].length - 1);

      courseData.units = unitSelector.slice(0, unitSelector.indexOf(' '));

      // description - need to be be able to handle any amount of paragraphs
      descriptionSelector.forEach((desc) => {
        courseData.desc += `${desc.textContent}\n`;
      });

      // additional info - need to be able to handle any amount of paragraphs
      if (addlSelector.length === 0) {
        courseData.addl = 'n/a';
      } else {
        addlSelector.forEach((addl) => {
          courseData.addl += `${addl.textContent}\n`;
        });
      }

      // add into master for program
      allCourseData.push(courseData);
    }
  }

  console.log(`writing out catalog data to [${outFile}]`);
  fs.writeFileSync(outFile, JSON.stringify(allCourseData, null, 2));
}
async function updateAllCourseData(catalog: string, root: string, outFile: string) {
  console.log(`root is ${root}`);

  const programLinks = await getAllProgramLinks(root);
  await getAllCoursesCatalog(catalog, programLinks, outFile, root);
}

async function buildCourseDataAllCatalogYears() {
  // will create files for catalog data for each year
  // we will then need to upload each unique class to master DB
  // when app starts up, download all this DB data

  console.log('Starting main course data construction ...');

  const courseDataAllRootDir = `${apiRoot}/data/courses`;

  if (!fs.existsSync(courseDataAllRootDir)) {
    fs.mkdirSync(courseDataAllRootDir);
  }

  for (let i = 0; i < catalogRoots.length; i += 1) {
    if (!fs.existsSync(`${courseDataAllRootDir}/${catalogNames[i]}`)) {
      fs.mkdirSync(`${courseDataAllRootDir}/${catalogNames[i]}`);
    }
    await updateAllCourseData(
      catalogNames[i],
      catalogRoots[i],
      `${courseDataAllRootDir}/${catalogNames[i]}/${catalogNames[i]}.json`
    );
  }
}

// how to run: (in dev dir) "ts-node-esm cpslo-courses.ts"
buildCourseDataAllCatalogYears();
