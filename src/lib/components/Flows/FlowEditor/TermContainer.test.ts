import TermContainer from './TermContainer.svelte';
import { render, screen } from '@testing-library/svelte';
import type { Term } from '$lib/common/schema/flowchartSchema';

const TEST_TERM_COURSES: Term = {
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
};

const TEST_TERM_EMPTY: Term = {
  tIndex: 0,
  tUnits: '0',
  courses: []
};

describe('TermContainer component tests', () => {
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
        flowProgramId: ['68be11b7-389b-4ebc-9b95-8997e7314497'],
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
