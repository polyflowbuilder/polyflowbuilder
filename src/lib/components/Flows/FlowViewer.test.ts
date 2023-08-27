import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { TEST_FLOWCHART_SINGLE_PROGRAM_2 } from '../../../../tests/util/testFlowcharts';
import { mockCourseCacheStore, mockProgramCacheStore } from '../../../../tests/util/storeMocks';

await apiDataConfig.init();

// this import NEEDS to be down here or else the vi.mock() call that we're using to mock
// the programCache and courseCache stores FAILS!! because vi.mock() MUST be called
// before the FlowEditor component is imported or else things break
import FlowViewer from './FlowViewer.svelte';

describe('FlowViewer component tests', () => {
  // need to mock out relevant stores since FlowViewer depends on this
  // (computeGroupUnits)
  beforeAll(() => {
    vi.mock('$lib/client/stores/apiDataStore', () => {
      return {
        programCache: mockProgramCacheStore,
        courseCache: mockCourseCacheStore
      };
    });
    mockProgramCacheStore.set(apiDataConfig.apiData.programData);
    mockCourseCacheStore.set(apiDataConfig.apiData.courseData);
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
        flowchart: TEST_FLOWCHART_SINGLE_PROGRAM_2
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
    const flowchartWithCreditBinCourses = structuredClone(TEST_FLOWCHART_SINGLE_PROGRAM_2);
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
