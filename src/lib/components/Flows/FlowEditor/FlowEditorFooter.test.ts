import FlowEditorFooter from './FlowEditorFooter.svelte';
import { render, screen } from '@testing-library/svelte';
import type { FlowEditorFooterUnitCounts } from '$lib/types';

// will test responsiveness of footer in PlayWright tests
// these are just basic tests to make sure unit values are being
// displayed correctly

function testFooterUnitDisplay(unitCounts: FlowEditorFooterUnitCounts) {
  render(FlowEditorFooter, {
    props: {
      unitCounts
    }
  });

  expect(
    screen.getByText(`Major: ${unitCounts.major}`, {
      exact: true
    })
  ).toBeVisible();
  expect(
    screen.getByText(`Support: ${unitCounts.support}`, {
      exact: true
    })
  ).toBeVisible();
  expect(
    screen.getByText(`Concentration #1: ${unitCounts.conc1}`, {
      exact: true
    })
  ).toBeVisible();
  expect(
    screen.getByText(`Concentration #2: ${unitCounts.conc2}`, {
      exact: true
    })
  ).toBeVisible();
  expect(
    screen.getByText(`GE: ${unitCounts.ge}`, {
      exact: true
    })
  ).toBeVisible();
  expect(
    screen.getByText(`Free Elective: ${unitCounts.elective}`, {
      exact: true
    })
  ).toBeVisible();
  expect(
    screen.getByText(`Other: ${unitCounts.other}`, {
      exact: true
    })
  ).toBeVisible();

  expect(
    screen.getByText(`Total Units: ${unitCounts.total}`, {
      exact: true
    })
  ).toBeVisible();
}

describe('FlowEditorFooter component tests', () => {
  test('units test #1', () => {
    testFooterUnitDisplay({
      major: '0',
      support: '0',
      conc2: '0',
      conc1: '0',
      ge: '0',
      elective: '0',
      other: '0',
      total: '0'
    });
  });
  test('units test #2', () => {
    testFooterUnitDisplay({
      major: '10',
      support: '50',
      conc2: '20',
      conc1: '1',
      ge: '0',
      elective: '5',
      other: '3',
      total: '89'
    });
  });
  test('units test #3', () => {
    testFooterUnitDisplay({
      major: '50-55',
      support: '10-12',
      conc2: '25',
      conc1: '17',
      ge: '0-5',
      elective: '11',
      other: '14',
      total: '127-139'
    });
  });
});
