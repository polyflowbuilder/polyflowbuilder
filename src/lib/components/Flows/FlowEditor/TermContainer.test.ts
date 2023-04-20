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
        term: TEST_TERM_EMPTY,
        termName: 'test term 1'
      }
    });

    // TODO: update logic for courses in termcontainer body

    expect(screen.getByText('test term 1')).toBeVisible();
    expect(screen.getByText('0')).toBeVisible();
  });

  test('term with courses', () => {
    render(TermContainer, {
      props: {
        term: TEST_TERM_COURSES,
        termName: 'test term 2'
      }
    });

    // TODO: update logic for courses in termcontainer body

    expect(screen.getByText('test term 2')).toBeVisible();
    expect(screen.getByText('17 (5)')).toBeVisible();
  });
});
