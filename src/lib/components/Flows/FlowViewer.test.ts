import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { CURRENT_FLOW_DATA_VERSION } from '$lib/common/config/flowDataConfig';
import { mockCourseDataStore, mockProgramDataStore } from '../../../../tests/util/storeMocks';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

await apiDataConfig.init();

// this import NEEDS to be down here or else the vi.mock() call that we're using to mock
// the programData and courseCache stores FAILS!! because vi.mock() MUST be called
// before the FlowEditor component is imported or else things break
import FlowViewer from './FlowViewer.svelte';

const TEST_FLOWCHART: Flowchart = {
  id: '118d3c00-541b-411d-8e8c-2e55bc5948fd',
  ownerId: 'ebee4558-4c2f-4b6a-8d87-77b8e5eae39e',
  name: 'TEST_FLOWCHART_NAME',
  startYear: '2017',
  unitTotal: '76',
  notes: '',
  termData: [
    {
      tIndex: -1,
      tUnits: '0',
      courses: []
    },
    {
      tIndex: 25,
      tUnits: '17',
      courses: [
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        },
        {
          id: 'MATH142',
          color: '#FFFFFF'
        },
        {
          id: 'MATH153',
          color: '#FFFFFF'
        },
        {
          id: 'MATH96',
          color: '#FFFFFF'
        },
        {
          id: 'MATH112',
          color: '#FFFFFF'
        }
      ]
    },
    {
      tIndex: 26,
      tUnits: '45',
      courses: [
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'longestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlon',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        },
        {
          id: 'MATH151',
          color: '#FFFFFF'
        },
        {
          id: 'MATH118',
          color: '#FFFFFF'
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        }
      ]
    },
    {
      tIndex: 27,
      tUnits: '14',
      courses: [
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        },
        {
          id: 'MATH116',
          color: '#FFFFFF'
        },
        {
          id: 'MATH126',
          color: '#FFFFFF'
        },
        {
          id: 'MATH128',
          color: '#FFFFFF'
        },
        {
          id: 'MATH141',
          color: '#FFFFFF'
        }
      ]
    }
  ],
  version: CURRENT_FLOW_DATA_VERSION,
  hash: 'c77ca499708c3890ecf5b7e7556df944.f660f328881ca3bbb89ce6247ba08bfc',
  publishedId: null,
  importedId: null,
  lastUpdatedUTC: new Date(),
  programId: ['4fc5d3c2-f5a7-4074-ae3d-5b3e01cb1168']
};

describe('FlowViewer component tests', () => {
  // need to mock out relevant stores since FlowViewer depends on this
  // (computeGroupUnits)
  beforeAll(() => {
    vi.mock('$lib/client/stores/apiDataStore', () => {
      return {
        programData: mockProgramDataStore,
        courseCache: mockCourseDataStore
      };
    });
    mockProgramDataStore.set(apiDataConfig.apiData.programData);
    mockCourseDataStore.set(apiDataConfig.apiData.courseData);
  });

  test('no flowchart selected', () => {
    render(FlowViewer, {
      props: {
        flowchart: null
      }
    });

    expect(screen.getByText('No flow selected. Please select or create a flow.')).toBeVisible();
    expect(
      screen.queryByRole('button', {
        name: 'flow editor left scroll'
      })
    ).toBeNull();
    expect(
      screen.queryByRole('button', {
        name: 'flow editor right scroll'
      })
    ).toBeNull();

    // TODO: update footer tests
    expect(screen.queryByText('units:')).toBeNull();
  });

  test('flowchart selected, no courses in credit bin', () => {
    render(FlowViewer, {
      props: {
        flowchart: TEST_FLOWCHART
      }
    });

    expect(screen.queryByText('No flow selected. Please select or create a flow.')).toBeNull();
    expect(
      screen.getByRole('button', {
        name: 'flow editor left scroll'
      })
    ).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'flow editor right scroll'
      })
    ).toBeVisible();
    expect(screen.getByText('TEST_FLOWCHART_NAME')).toBeVisible();

    expect(screen.queryByText('Credit Bin')).toBeNull();
    expect(screen.getByText('Fall 2023')).toBeVisible();
    expect(screen.getByText('Winter 2024')).toBeVisible();
    expect(screen.getByText('Spring 2024')).toBeVisible();

    // TODO: consolidate with unitCounterUtilClient test util
    expect(
      screen.getByText('Major: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('Support: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('Concentration #1: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('Concentration #2: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('GE: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('Free Elective: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('Other: 76', {
        exact: true
      })
    ).toBeVisible();

    expect(
      screen.getByText('Total Units: 76', {
        exact: true
      })
    ).toBeVisible();
  });

  test('flowchart selected, courses in credit bin', () => {
    const flowchartWithCreditBinCourses = structuredClone(TEST_FLOWCHART);
    flowchartWithCreditBinCourses.termData[0] = {
      tIndex: -1,
      courses: [
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        }
      ],
      tUnits: '5'
    };

    render(FlowViewer, {
      props: {
        flowchart: flowchartWithCreditBinCourses
      }
    });

    expect(screen.queryByText('No flow selected. Please select or create a flow.')).toBeNull();
    expect(
      screen.getByRole('button', {
        name: 'flow editor left scroll'
      })
    ).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'flow editor right scroll'
      })
    ).toBeVisible();
    expect(screen.getByText('TEST_FLOWCHART_NAME')).toBeVisible();

    expect(screen.getByText('Credit Bin')).toBeVisible();
    expect(screen.getByText('Fall 2023')).toBeVisible();
    expect(screen.getByText('Winter 2024')).toBeVisible();
    expect(screen.getByText('Spring 2024')).toBeVisible();

    // TODO: consolidate with unitCounterUtilClient test util
    expect(
      screen.getByText('Major: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('Support: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('Concentration #1: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('Concentration #2: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('GE: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('Free Elective: 0', {
        exact: true
      })
    ).toBeVisible();
    expect(
      screen.getByText('Other: 81', {
        exact: true
      })
    ).toBeVisible();

    expect(
      screen.getByText('Total Units: 76', {
        exact: true
      })
    ).toBeVisible();
  });
});
