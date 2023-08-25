import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { TEST_FLOWCHART_SINGLE_PROGRAM_2 } from '../../../../../tests/util/testFlowcharts';
import { mockCourseDataStore, mockProgramDataStore } from '../../../../../tests/util/storeMocks';

// this import NEEDS to be down here or else the vi.mock() call that we're using to mock
// the programCache and courseCache stores FAILS!! because vi.mock() MUST be called
// before the FlowEditor component is imported or else things break
import FlowEditor from './FlowEditor.svelte';

// init api data
await apiDataConfig.init();

describe('FlowEditor component tests', () => {
  // need to mock out relevant stores since FlowEditor depends on this
  // (computeGroupUnits)
  beforeAll(() => {
    vi.mock('$lib/client/stores/apiDataStore', () => {
      return {
        programCache: mockProgramDataStore,
        courseCache: mockCourseDataStore
      };
    });
    mockProgramDataStore.set(apiDataConfig.apiData.programData);
    mockCourseDataStore.set(apiDataConfig.apiData.courseData);
  });

  test('not displaying credit bin', () => {
    render(FlowEditor, {
      props: {
        flowchart: TEST_FLOWCHART_SINGLE_PROGRAM_2,
        flowchartId: TEST_FLOWCHART_SINGLE_PROGRAM_2.id,
        displayCreditBin: false
      }
    });

    // make sure the things that should be visible are visible
    // and things that aren't visible to not be visible
    expect(screen.getByText('TEST_FLOWCHART_NAME')).toBeVisible();

    expect(
      screen.queryByText(
        'This flow does not have any terms. Add terms by clicking "Actions", then "Add Terms".'
      )
    ).toBeNull();
    expect(screen.queryByText('Credit Bin')).toBeNull();
    expect(screen.getByText('Fall 2023')).toBeVisible();
    expect(screen.getByText('Winter 2024')).toBeVisible();
    expect(screen.getByText('Spring 2024')).toBeVisible();
    expect(screen.getByText('17 (5)')).toBeVisible();
    expect(screen.getByText('45 (10)')).toBeVisible();
    expect(screen.getByText('14 (5)')).toBeVisible();

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

  test('displaying credit bin', () => {
    render(FlowEditor, {
      props: {
        flowchart: TEST_FLOWCHART_SINGLE_PROGRAM_2,
        flowchartId: TEST_FLOWCHART_SINGLE_PROGRAM_2.id,
        displayCreditBin: true
      }
    });

    // make sure the things that should be visible are visible
    // and things that aren't visible to not be visible
    expect(screen.getByText('TEST_FLOWCHART_NAME')).toBeVisible();

    expect(
      screen.queryByText(
        'This flow does not have any terms. Add terms by clicking "Actions", then "Add Terms".'
      )
    ).toBeNull();
    expect(screen.getByText('Credit Bin')).toBeVisible();
    expect(screen.getByText('Fall 2023')).toBeVisible();
    expect(screen.getByText('Winter 2024')).toBeVisible();
    expect(screen.getByText('Spring 2024')).toBeVisible();
    expect(screen.getByText('0')).toBeVisible();
    expect(screen.getByText('17 (5)')).toBeVisible();
    expect(screen.getByText('45 (10)')).toBeVisible();
    expect(screen.getByText('14 (5)')).toBeVisible();

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

  test('flowchart with no terms', () => {
    const testFlowchartWithNoTerms = structuredClone(TEST_FLOWCHART_SINGLE_PROGRAM_2);
    testFlowchartWithNoTerms.termData = testFlowchartWithNoTerms.termData.slice(0, 1);
    testFlowchartWithNoTerms.unitTotal = '0';

    console.log('terms', testFlowchartWithNoTerms.termData);

    render(FlowEditor, {
      props: {
        flowchart: testFlowchartWithNoTerms,
        flowchartId: testFlowchartWithNoTerms.id,
        displayCreditBin: true
      }
    });

    // make sure the things that should be visible are visible
    // and things that aren't visible to not be visible
    expect(screen.getByText('TEST_FLOWCHART_NAME')).toBeVisible();

    expect(
      screen.getByText(
        'This flow does not have any terms. Add terms by clicking "Actions", then "Add Terms".'
      )
    ).toBeVisible();
    expect(screen.queryByText('Credit Bin')).toBeNull();
    expect(screen.queryByText('Fall 2023')).toBeNull();
    expect(screen.queryByText('Winter 2024')).toBeNull();
    expect(screen.queryByText('Spring 2024')).toBeNull();
    expect(screen.queryByText('0')).toBeNull();
    expect(screen.queryByText('17 (5)')).toBeNull();
    expect(screen.queryByText('45 (10)')).toBeNull();
    expect(screen.queryByText('14 (5)')).toBeNull();

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
      screen.getByText('Other: 0', {
        exact: true
      })
    ).toBeVisible();

    expect(
      screen.getByText('Total Units: 0', {
        exact: true
      })
    ).toBeVisible();
  });
});
