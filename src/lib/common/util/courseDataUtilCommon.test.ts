import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import {
  computeCourseDisplayValues,
  getCatalogFromProgramIDIndex
} from '$lib/common/util/courseDataUtilCommon';
import type { APICourseFull, ComputedCourseItemDisplayData } from '$lib/types';
import type { Course } from '../schema/flowchartSchema';

// init API data
await apiDataConfig.init();

describe('courseDataUtilCommon tests', () => {
  test('valid catalog with one program', () => {
    const catalog = getCatalogFromProgramIDIndex(
      0,
      ['d38fef1b-990b-4cce-a82c-79d55879f4be'],
      apiDataConfig.apiData.programData
    );
    expect(catalog).toBe('2022-2026');
  });

  test('valid catalog with two programs', () => {
    const programs = [
      '1c3a7751-0eb8-4652-b316-0307f1db312f',
      '0e7e23c6-aeee-418d-93f7-5ba3475ab00b'
    ];
    expect(getCatalogFromProgramIDIndex(0, programs, apiDataConfig.apiData.programData)).toBe(
      '2019-2020'
    );
    expect(getCatalogFromProgramIDIndex(1, programs, apiDataConfig.apiData.programData)).toBe(
      '2020-2021'
    );
  });

  test('valid catalog with max number of programs', () => {
    const programs = [
      '1c3a7751-0eb8-4652-b316-0307f1db312f',
      '0e7e23c6-aeee-418d-93f7-5ba3475ab00b',
      '3f289773-7b54-4d99-8e03-48c829b63636',
      '10ee525b-780d-4aa8-8a91-be6498c89937',
      'bf13b9db-acc0-4967-bd9e-f123693652e5'
    ];
    expect(getCatalogFromProgramIDIndex(4, programs, apiDataConfig.apiData.programData)).toBe(
      '2019-2020'
    );
    expect(getCatalogFromProgramIDIndex(2, programs, apiDataConfig.apiData.programData)).toBe(
      '2015-2017'
    );
  });

  test('undefined catalog', () => {
    const programs = [
      '1c3a7751-0eb8-4652-b316-0307f1db312f',
      '0e7e23c6-aeee-418d-93f7-5ba3475ab00b',
      '3f289773-7b54-4d99-8e03-48c829b63636',
      '10ee525b-780d-4aa8-8a91-be6498c89937',
      'bf13b9db-acc0-4967-bd9e-f123693652e5'
    ];
    expect(
      getCatalogFromProgramIDIndex(-1, programs, apiDataConfig.apiData.programData)
    ).toBeUndefined();
    expect(
      getCatalogFromProgramIDIndex(5, programs, apiDataConfig.apiData.programData)
    ).toBeUndefined();
    expect(getCatalogFromProgramIDIndex(3, programs, [])).toBeUndefined();
  });
});

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
