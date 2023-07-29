import CourseItem from './CourseItem.svelte';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/svelte';

describe('CourseItem component tests', () => {
  test('standard course item with tooltip #1', async () => {
    const user = userEvent.setup();

    render(CourseItem, {
      props: {
        item: {
          color: 'red',
          displayName: 'test course',
          idName: 'TEST101',
          metadata: {
            flowProgramIndex: 0,
            tIndex: 0,
            cIndex: 0,
            selected: false
          },
          tooltipParams: {
            content: 'hello world'
          },
          units: '5'
        }
      }
    });

    // ensure correct things are visible
    expect(screen.getByText('test course')).toBeVisible();
    expect(screen.getByText('TEST101')).toBeVisible();
    expect(
      screen.getByText('5 units', {
        exact: true
      })
    ).toBeVisible();

    // ensure correct things are not visible
    // null bc hasn't been shown for the first time yet
    expect(screen.queryByText('hello world')).toBeNull();

    // hover on course and expect visible
    await user.hover(screen.getByText('test course'));
    expect(screen.getByText('hello world')).toBeVisible();

    // unhover and expect not visible again after its transition duration time
    // goes invisible instead of being deleted bc may be shown subsequent times
    await user.unhover(screen.getByText('test course'));
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByText('hello world')).not.toBeVisible();

    // to check bg and other CSS-related stuff (e.g. selection), will probably use
    // PlayWright - see FlowListItem tests for more info
  });

  test('standard course item with tooltip #2', async () => {
    const user = userEvent.setup();

    render(CourseItem, {
      props: {
        item: {
          color: 'red',
          displayName: 'test course',
          idName: 'TEST101',
          metadata: {
            flowProgramIndex: 0,
            tIndex: 0,
            cIndex: 0,
            selected: false
          },
          tooltipParams: {
            content: 'hello world'
          },
          units: '1'
        }
      }
    });

    // ensure correct things are visible
    expect(screen.getByText('test course')).toBeVisible();
    expect(screen.getByText('TEST101')).toBeVisible();
    expect(
      screen.getByText('1 unit', {
        exact: true
      })
    ).toBeVisible();

    // ensure correct things are not visible
    // null bc hasn't been shown for the first time yet
    expect(screen.queryByText('hello world')).toBeNull();

    // hover on course and expect visible
    await user.hover(screen.getByText('TEST101'));
    expect(screen.getByText('hello world')).toBeVisible();

    // unhover and expect not visible again after its transition duration time
    // goes invisible instead of being deleted bc may be shown subsequent times
    await user.unhover(screen.getByText('TEST101'));
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByText('hello world')).not.toBeVisible();

    // to check bg and other CSS-related stuff (e.g. selection), will probably use
    // PlayWright - see FlowListItem tests for more info
  });

  test('standard course item with tooltip #3', async () => {
    const user = userEvent.setup();

    render(CourseItem, {
      props: {
        item: {
          color: 'red',
          displayName: 'test course',
          idName: 'TEST101',
          metadata: {
            flowProgramIndex: 0,
            tIndex: 0,
            cIndex: 0,
            selected: false
          },
          tooltipParams: {
            content: 'hello world'
          },
          units: '6-8'
        }
      }
    });

    // ensure correct things are visible
    expect(screen.getByText('test course')).toBeVisible();
    expect(screen.getByText('TEST101')).toBeVisible();
    expect(
      screen.getByText('6-8 units', {
        exact: true
      })
    ).toBeVisible();

    // ensure correct things are not visible
    // null bc hasn't been shown for the first time yet
    expect(screen.queryByText('hello world')).toBeNull();

    // hover on course and expect visible
    const courseItem = document.querySelector('.courseItem');
    if (!courseItem) {
      throw new Error('courseItem not found');
    }

    await user.hover(courseItem);
    expect(screen.getByText('hello world')).toBeVisible();

    // unhover and expect not visible again after its transition duration time
    // goes invisible instead of being deleted bc may be shown subsequent times
    await user.unhover(courseItem);
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByText('hello world')).not.toBeVisible();

    // to check bg and other CSS-related stuff (e.g. selection), will probably use
    // PlayWright - see FlowListItem tests for more info
  });
});
