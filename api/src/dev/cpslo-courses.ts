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
  'https://catalog.calpoly.edu/previouscatalogs/2022-2026/coursesaz/',
  'http://catalog.calpoly.edu/coursesaz/' // latest, 2026-2028 "fluid"
];
const catalogNames = JSON.parse(
  fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
) as string[];

// fluid represents the newest catalog (as HTML may change),
// archive represents all archived catalogs (they share HTML format)
type CatalogFormatType = 'fluid' | 'archive';

// scrapes http://catalog.calpoly.edu/coursesaz/ to get all links for program classes
async function getAllProgramLinks(root: string, format: CatalogFormatType): Promise<string[]> {
  console.log('starting getAllProgramLinks ...');
  console.log('scraping root link ...');

  const programLinks: string[] = [];

  const response = await fetchRetry(root);
  const text = await response.text();
  const dom = new JSDOM(text);

  // support both older catalog format (pre 2026-2028) and new catalog format (2026-2028)
  const parentTable =
    format === 'fluid'
      ? dom.window.document.querySelectorAll('.az_sitemap ul li a')
      : dom.window.document.querySelectorAll('.sitemaplink');
  if (!parentTable.length) {
    console.log('NO PROGRAM LINKS FOUND, BAILING!');
    return [];
  }

  for (const tElement of Array.from(parentTable)) {
    // grab href to get full link
    const namedItem = tElement.attributes.getNamedItem('href');

    // add extra check here because new 2026-2028 catalog selector will grab hrefs
    // that we don't want (they have a format like href="#c4465315")
    if (!namedItem) {
      console.log('MISSING HREF IN TELEMENT, BAIL!', tElement);
      return [];
    }

    if (namedItem.textContent.includes('courses')) {
      programLinks.push(`http://catalog.calpoly.edu${String(namedItem.textContent)}`);
    }
  }

  console.log('successfully scraped', programLinks.length, 'from root', root);
  return programLinks;
}

// uses programLinks to get all course data by scraping each link
async function getAllCoursesCatalog(
  catalog: string,
  programLinks: string[],
  outFile: string,
  root: string,
  format: CatalogFormatType
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
    for (const courseBlock of Array.from(courseBlocks)) {
      // grab course ID and display name; not optimal as we're relying on
      // HTML formatting on unknown webpage that may change in future, breaking this!

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

      if (format === 'archive') {
        const courseIdSelector = courseBlock.querySelector(
          '.courseblocktitle > strong'
        )?.textContent;
        const unitSelector = courseBlock.querySelector('.courseblockhours')?.textContent;
        const descriptionSelector = courseBlock.querySelectorAll('.courseblockdesc > p');
        const addlSelector = courseBlock.querySelectorAll('.courseextendedwrap > p');
        if (!courseIdSelector || !unitSelector) {
          console.log('A SELECTOR FOR THE COURSE WAS NULL, BAIL!', courseBlock);
          return;
        }

        const courseIdParts = courseIdSelector
          .slice(0, courseIdSelector.indexOf('\n'))
          .split(/. (.+)/); // regex for splitting on FIRST '. ' ONLY!

        courseData.id = courseIdParts[0].replace(/\s/g, '');
        courseData.displayName = courseIdParts[1].substring(0, courseIdParts[1].length - 1);

        courseData.units = unitSelector.slice(0, unitSelector.indexOf(' '));

        // description - need to be be able to handle any amount of paragraphs
        descriptionSelector.forEach((desc) => {
          courseData.desc += `${String(desc.textContent)}\n`;
        });

        // additional info - need to be able to handle any amount of paragraphs
        if (addlSelector.length === 0) {
          courseData.addl = 'n/a';
        } else {
          addlSelector.forEach((addl) => {
            courseData.addl += `${String(addl.textContent)}\n`;
          });
        }
      } else {
        // get data

        // raw text input: "AERO 1121"
        // transformed value: "AERO1121"
        const courseId = courseBlock
          .querySelector('.courseblockcode')
          ?.textContent.replace(/\s/g, '');
        // raw text input: "Aerospace Fundamentals"
        // transformed value: "Aerospace Fundamentals" (no change)
        const displayName = courseBlock.querySelector('.courseblock__title')?.textContent;
        // raw text: "(2 units)"
        // transformed value: "2"
        const units = courseBlock
          .querySelector('.courseblock__hours')
          ?.textContent.split(' ')[0]
          .substring(1);

        const desc = courseBlock.querySelector('.courseblock__description')?.textContent;

        if (!courseId || !displayName || !units || !desc) {
          console.log('A SELECTOR FOR THE COURSE WAS NULL, BAIL!', courseBlock);
          return;
        }

        const addlSelector = courseBlock.querySelectorAll('.courseblock__details > span');

        // populate course object with data
        courseData.id = courseId;
        courseData.displayName = displayName;
        courseData.units = units;
        // description - need to be be able to handle any amount of paragraphs
        // (but do not need special logic due to the HTML format)
        if (desc) {
          courseData.desc = desc;
        }
        // additional info - need to be able to handle any amount of paragraphs
        if (addlSelector.length === 0) {
          courseData.addl = 'n/a';
        } else {
          addlSelector.forEach((addl) => {
            courseData.addl += `${String(addl.textContent)}\n`;
          });
        }
      }

      // add into master for program
      allCourseData.push(courseData);
    }
  }

  console.log(`writing out catalog data to [${outFile}]`);
  fs.writeFileSync(outFile, JSON.stringify(allCourseData, null, 2));
}
async function updateAllCourseData(
  catalog: string,
  root: string,
  outFile: string,
  format: CatalogFormatType
) {
  console.log(`root is ${root} (format=${format})`);

  const programLinks = await getAllProgramLinks(root, format);
  await getAllCoursesCatalog(catalog, programLinks, outFile, root, format);
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
    const format: CatalogFormatType = i === catalogRoots.length - 1 ? 'fluid' : 'archive';

    if (!fs.existsSync(`${courseDataAllRootDir}/${catalogNames[i]}`)) {
      fs.mkdirSync(`${courseDataAllRootDir}/${catalogNames[i]}`);
    }
    await updateAllCourseData(
      catalogNames[i],
      catalogRoots[i],
      `${courseDataAllRootDir}/${catalogNames[i]}/${catalogNames[i]}.json`,
      format
    );
  }
}

// how to run: (in dev dir) "npx tsx cpslo-courses.ts"
void buildCourseDataAllCatalogYears();
