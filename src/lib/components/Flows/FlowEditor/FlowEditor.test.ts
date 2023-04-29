import FlowEditor from './FlowEditor.svelte';
import { render, screen } from '@testing-library/svelte';
import { CURRENT_FLOW_DATA_VERSION } from '$lib/common/config/flowDataConfig';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

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

describe('FlowEditor component tests', () => {
  test('not displaying credit bin', () => {
    render(FlowEditor, {
      props: {
        flowchart: TEST_FLOWCHART,
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

    // TODO: update logic for footer
    expect(screen.getByText('units: 76')).toBeVisible();
  });

  test('displaying credit bin', () => {
    render(FlowEditor, {
      props: {
        flowchart: TEST_FLOWCHART,
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

    // TODO: update logic for footer
    expect(screen.getByText('units: 76')).toBeVisible();
  });

  test('flowchart with no terms', () => {
    const testFlowchartWithNoTerms = structuredClone(TEST_FLOWCHART);
    testFlowchartWithNoTerms.termData = testFlowchartWithNoTerms.termData.slice(0, 1);
    testFlowchartWithNoTerms.unitTotal = '0';

    console.log('terms', testFlowchartWithNoTerms.termData);

    render(FlowEditor, {
      props: {
        flowchart: testFlowchartWithNoTerms,
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

    // TODO: update logic for footer
    expect(screen.getByText('units: 0')).toBeVisible();
  });
});
