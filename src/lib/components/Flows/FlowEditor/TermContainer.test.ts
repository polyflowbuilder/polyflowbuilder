import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { render, screen } from '@testing-library/svelte';
import { TEST_FLOWCHART_SINGLE_PROGRAM_2 } from '$test/util/testFlowcharts';
import { mockCourseCacheStore, mockProgramCacheStore } from '$test/util/storeMocks';

// load necessary API data
await apiDataConfig.init();

const TEST_TERM_EMPTY = TEST_FLOWCHART_SINGLE_PROGRAM_2.termData[0];
const TEST_TERM_COURSES = TEST_FLOWCHART_SINGLE_PROGRAM_2.termData[1];

// this import NEEDS to be down here or else the vi.mock() call that we're using to mock
// the programCache and courseCache stores FAILS!! because vi.mock() MUST be called
// before the TermContainer component is imported or else things break
import TermContainer from './TermContainer.svelte';

describe('TermContainer component tests', () => {
  // need to mock out relevant stores since TermContainer depends on these
  // mock call is hoisted to top of file
  beforeAll(() => {
    vi.mock('$lib/client/stores/apiDataStore', () => {
      return {
        courseCache: mockCourseCacheStore,
        programCache: mockProgramCacheStore
      };
    });
    mockProgramCacheStore.set(apiDataConfig.apiData.programData);
    mockCourseCacheStore.set(apiDataConfig.apiData.courseData);
  });

  test('empty term', () => {
    render(TermContainer, {
      props: {
        flowId: '68be11b7-389b-4ebc-9b95-8997e7314497',
        flowProgramId: ['68be11b7-389b-4ebc-9b95-8997e7314497'],
        term: TEST_TERM_EMPTY,
        termName: 'test term 1'
      }
    });

    // expect no courses in the container
    expect(document.querySelectorAll('.courseItem')).toHaveLength(0);

    expect(screen.getByText('test term 1')).toBeVisible();
    expect(screen.getByText('0')).toBeVisible();
  });

  test('term with courses that are visible in viewport', () => {
    render(TermContainer, {
      props: {
        flowId: '68be11b7-389b-4ebc-9b95-8997e7314497',
        flowProgramId: ['4fc5d3c2-f5a7-4074-ae3d-5b3e01cb1168'],
        term: TEST_TERM_COURSES,
        termName: 'test term 2'
      }
    });

    // expect all courses to be visible
    // can't do an overflow test here in vitest bc parent doesn't restrict height
    expect(document.querySelectorAll('.courseItem')).toHaveLength(5);
    expect(document.querySelectorAll('.courseItem')[0]).toBeVisible();
    expect(document.querySelectorAll('.courseItem')[1]).toBeVisible();
    expect(document.querySelectorAll('.courseItem')[2]).toBeVisible();
    expect(document.querySelectorAll('.courseItem')[3]).toBeVisible();
    expect(document.querySelectorAll('.courseItem')[4]).toBeVisible();

    expect(
      screen.getByText(
        'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
      )
    ).toBeVisible();
    expect(screen.getByText('MATH142')).toBeVisible();
    expect(screen.getByText('MATH153')).toBeVisible();
    expect(screen.getByText('MATH96')).toBeVisible();
    expect(screen.getByText('MATH112')).toBeVisible();

    expect(screen.getByText('test term 2')).toBeVisible();
    expect(screen.getByText('17 (5)')).toBeVisible();
  });
});
