import { computeCourseDisplayValues } from './courseItemUtil';
import type { Course } from '$lib/common/schema/flowchartSchema';
import type { APICourseFull, ComputedCourseItemDisplayData } from '$lib/types';

// TODO: add tests for buildTermCourseItemsData, generateCourseItemTooltipHTML,
// buildTermModUpdateChunkFromCourseItems

describe('computeCourseDisplayValues tests', () => {
  const courseMetadata: APICourseFull = {
    id: 'AERO460',
    catalog: '2015-2017',
    displayName: 'Aerospace Engineering Professional Preparation',
    units: '1',
    desc: 'Topics on professional development for student success including resume building and career prospecting, current events in the aerospace industry, graduate studies, engineering ethics, intellectual property, non-disclosure agreements, teamwork, and innovation and entrepreneurship.  1 activity.\n',
    addl: 'Term Typically Offered: F\nPrerequisite: Senior standing.\n',
    gwrCourse: false,
    uscpCourse: false,
    dynamicTerms: {
      termFall: true,
      termWinter: true,
      termSpring: false,
      termSummer: true
    }
  };

  test('error thrown when course id is invalid', () => {
    expect(() =>
      computeCourseDisplayValues(
        {
          color: 'white',
          id: null
        },
        null
      )
    ).toThrowError('course id not valid for course');
  });

  test('standard course with course metadata generates correct data', () => {
    const expected: ComputedCourseItemDisplayData = {
      idName: 'AERO460',
      displayName: 'Aerospace Engineering Professional Preparation',
      units: '1',
      color: 'white',
      tooltip: {
        custom: false,
        desc: 'Topics on professional development for student success including resume building and career prospecting, current events in the aerospace industry, graduate studies, engineering ethics, intellectual property, non-disclosure agreements, teamwork, and innovation and entrepreneurship.  1 activity.\n',
        addlDesc: 'Term Typically Offered: F\nPrerequisite: Senior standing.\n',
        termsOffered: {
          termFall: true,
          termWinter: true,
          termSpring: false,
          termSummer: true
        }
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tooltip, ...main } = expected;

    expect(
      computeCourseDisplayValues(
        {
          id: 'AERO460',
          color: 'white'
        },
        courseMetadata
      )
    ).toStrictEqual(expected);

    expect(
      computeCourseDisplayValues(
        {
          id: 'AERO460',
          color: 'white'
        },
        courseMetadata,
        false
      )
    ).toStrictEqual(main);
  });

  test('custom course generates correct data', () => {
    const customCourse: Course = {
      id: null,
      customId: 'test',
      customDisplayName: 'test course',
      customDesc: 'this is a test course!',
      customUnits: '10-12',
      color: 'black'
    };

    const expected: ComputedCourseItemDisplayData = {
      idName: 'test',
      displayName: 'test course',
      units: '10-12',
      color: 'black',
      tooltip: {
        custom: true,
        desc: 'this is a test course!',
        addlDesc: '',
        termsOffered: null
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tooltip, ...main } = expected;

    expect(computeCourseDisplayValues(customCourse, null)).toStrictEqual(expected);
    expect(computeCourseDisplayValues(customCourse, null, false)).toStrictEqual(main);
  });
});
