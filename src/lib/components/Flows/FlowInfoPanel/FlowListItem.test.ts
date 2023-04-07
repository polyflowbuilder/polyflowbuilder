import FlowListItem from './FlowListItem.svelte';
import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/svelte';

// load necessary API data
await apiDataConfig.init();

// TODO: some tests also may be run in Playwright due to limitations
// of the unit testing environment explained throughout

describe('FlowListItem component tests', () => {
  test('standard flow list item with tooltip', async () => {
    const user = userEvent.setup();

    render(FlowListItem, {
      props: {
        item: {
          idx: 0,
          id: 'e7b41c83-7359-49eb-9c90-b3c817112514',
          name: 'test',
          tooltipParams: {
            content: 'hello world'
          }
        }
      }
    });

    // ensure correct things are visible
    expect(screen.getByText('test')).toBeVisible();
    // TODO: investigate accessibilty for tooltip - unsure about
    // how to make accessible for now, so will just query it
    expect(document.querySelector('.text-blue-500')).toBeVisible();

    // ensure correct things are not visible
    // null bc hasn't been shown for the first time yet
    expect(screen.queryByText('hello world')).toBeNull();

    // hover on tooltip and expect visible
    await user.hover(document.querySelector('.text-blue-500') as Element);
    expect(screen.getByText('hello world')).toBeVisible();

    // unhover and expect not visible again after its transition duration time
    // goes invisible instead of being deleted bc may be shown subsequent times
    await user.unhover(document.querySelector('.text-blue-500') as Element);
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByText('hello world')).not.toBeVisible();
  });

  // not sure if necessary
  // idea of this test was to test truncation but this isn't implemented in the FLowListItem
  // bc all name inputs will be validated to have length <= MAX_FLOW_NAME_LENGTH before
  // being passed as a prop to this
  test('long flow list item name with tooltip', async () => {
    const user = userEvent.setup();

    render(FlowListItem, {
      props: {
        item: {
          idx: 0,
          id: 'e7b41c83-7359-49eb-9c90-b3c817112514',
          // MAX_FLOW_NAME_LENGTH characters
          name: 'testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest',
          tooltipParams: {
            content: 'hello world'
          }
        }
      }
    });

    // ensure correct things are visible
    expect(
      screen.getByText(
        'testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest'
      )
    ).toBeVisible();
    // TODO: investigate accessibilty for tooltip - unsure about
    // how to make accessible for now, so will just query it
    expect(document.querySelector('.text-blue-500')).toBeVisible();

    // ensure correct things are not visible
    // null bc hasn't been shown for the first time yet
    expect(screen.queryByText('hello world')).toBeNull();

    // hover on tooltip and expect visible
    await user.hover(document.querySelector('.text-blue-500') as Element);
    expect(screen.getByText('hello world')).toBeVisible();

    // unhover and expect not visible again after its transition duration time
    // goes invisible instead of being deleted bc may be shown subsequent times
    await user.unhover(document.querySelector('.text-blue-500') as Element);
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.getByText('hello world')).not.toBeVisible();
  });

  // TODO: see if we can figure out how to test checking the bg color of the
  // FlowListItem changes when we hover -- looking at the computed styles seems to suggest
  // that the CSS module portion of the component isn't actually rendered in jsdom, only the
  // inline styles that can be detected in the HTML tags
  // will probably have to use PlayWright for this type of test
});
