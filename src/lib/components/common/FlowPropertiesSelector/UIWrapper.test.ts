import UIWrapper from './UIWrapper.svelte';
import { render, screen } from '@testing-library/svelte';

describe('FlowPropertiesSelector/UIWrapper functionality tests', () => {
  test('index 0 display correct', () => {
    render(UIWrapper, {
      props: {
        programIdInput: '',
        alreadySelectedProgramIds: [],
        fetchingData: false,
        i: 0
      }
    });

    // check that the correct badge renders
    expect(screen.queryByText('PRIMARY')).toBeVisible();
    expect(screen.queryByText('ADDITIONAL')).toBeFalsy();
    expect(screen.queryByRole('button', { name: 'REMOVE' })).toBeFalsy();
  });

  test('index >0 display correct', () => {
    render(UIWrapper, {
      props: {
        programIdInput: '',
        alreadySelectedProgramIds: [],
        fetchingData: false,
        i: 2
      }
    });

    // check that the correct badge renders
    expect(screen.queryByText('PRIMARY')).toBeFalsy();
    expect(screen.queryByText('ADDITIONAL')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'REMOVE' })).toBeVisible();
  });

  test('prop passthrough test', () => {
    // just pass one passthru prop and expect the rest of them to work
    render(UIWrapper, {
      props: {
        programIdInput: '',
        alreadySelectedProgramIds: [],
        fetchingData: false,
        i: 0,
        defaultOptionText: 'test'
      }
    });

    for (const opt of screen.getAllByRole('option')) {
      expect(opt).toHaveTextContent('test');
    }
  });
});
