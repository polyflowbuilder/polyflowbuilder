import userEvent from '@testing-library/user-event';
import FlowEditorHeader from './FlowEditorHeader.svelte';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

async function testArrowScrollState(stateLeft: boolean, stateRight: boolean) {
  const user = userEvent.setup();

  const leftScrollArrowClickEventHandler = vi.fn();
  const rightScrollArrowClickEventHandler = vi.fn();

  render(FlowEditorHeader, {
    props: {
      name: 'test',
      enableLeftScrollArrow: stateLeft,
      enableRightScrollArrow: stateRight
    },
    events: {
      leftScrollArrowClick: leftScrollArrowClickEventHandler,
      rightScrollArrowClick: rightScrollArrowClickEventHandler
    }
  });

  // ensure correct things are visible and configured properly
  expect(
    screen.getByRole('heading', {
      name: 'test'
    })
  ).toBeVisible();

  expect(
    screen.getByRole('button', {
      name: 'flow editor left scroll'
    })
  ).toBeVisible();
  if (stateLeft) {
    expect(
      screen.getByRole('button', {
        name: 'flow editor left scroll'
      })
    ).toBeEnabled();
  } else {
    expect(
      screen.getByRole('button', {
        name: 'flow editor left scroll'
      })
    ).toBeDisabled();
  }

  expect(
    screen.getByRole('button', {
      name: 'flow editor right scroll'
    })
  ).toBeVisible();
  if (stateRight) {
    expect(
      screen.getByRole('button', {
        name: 'flow editor right scroll'
      })
    ).toBeEnabled();
  } else {
    expect(
      screen.getByRole('button', {
        name: 'flow editor right scroll'
      })
    ).toBeDisabled();
  }

  // now test event dispatch
  expect(leftScrollArrowClickEventHandler).toHaveBeenCalledTimes(0);
  expect(rightScrollArrowClickEventHandler).toHaveBeenCalledTimes(0);

  await user.click(
    screen.getByRole('button', {
      name: 'flow editor left scroll'
    })
  );
  expect(leftScrollArrowClickEventHandler).toHaveBeenCalledTimes(stateLeft ? 1 : 0);

  await user.click(
    screen.getByRole('button', {
      name: 'flow editor right scroll'
    })
  );
  expect(rightScrollArrowClickEventHandler).toHaveBeenCalledTimes(stateRight ? 1 : 0);
}

describe('FlowEditorHeader component tests', () => {
  test('default component state correct', async () => {
    await testArrowScrollState(false, false);
  });

  test('enable left scroll arrow state correct', async () => {
    await testArrowScrollState(true, false);
  });

  test('enable right scroll arrow state correct', async () => {
    await testArrowScrollState(false, true);
  });

  test('enable both scroll arrow state correct', async () => {
    await testArrowScrollState(true, true);
  });
});
