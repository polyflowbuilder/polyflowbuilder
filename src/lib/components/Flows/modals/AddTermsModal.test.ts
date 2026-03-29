import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TEST_FLOWCHART_SINGLE_PROGRAM_2 } from '$test/util/testFlowcharts';
import { act, getAllByRole, queryAllByRole, render, screen, within } from '@testing-library/svelte';
import {
  mockModalOpenStore,
  mockSelectedFlowIndexStore,
  mockUserFlowchartsStore
} from '$test/util/storeMocks';

// this import NEEDS to be down here or else the vi.mock() call that we're using to mock
// the addTermsModalOpenStore FAILS!! because vi.mock() MUST be called
// before the NewFlowModal component is imported or else things break
import AddTermsModal from './AddTermsModal.svelte';

describe('AddTermsModal component tests', () => {
  beforeAll(() => {
    // mock out required stores
    vi.mock('$lib/client/stores/modalStateStore', () => {
      return {
        addTermsModalOpen: mockModalOpenStore
      };
    });
    vi.mock('$lib/client/stores/userDataStore', () => {
      return {
        userFlowcharts: mockUserFlowchartsStore
      };
    });
    vi.mock('$lib/client/stores/UIDataStore', () => {
      return {
        selectedFlowIndex: mockSelectedFlowIndexStore
      };
    });
  });

  const getAddTermsSelector = () => {
    return screen.getByRole('listbox', {
      name: 'select flowchart terms to add'
    });
  };

  const getAddTermsOptionsElements = (getSelectedOptions = false) => {
    // use queryAllByRole because getAllByRole throws an error if there are no elements found
    return within(getAddTermsSelector()).queryAllByRole<HTMLOptionElement>('option', {
      selected: getSelectedOptions
    });
  };

  test('default state for AddTermsModal correct', async () => {
    const user = userEvent.setup();

    render(AddTermsModal);

    // ensure modal is not visible at first
    expect(screen.getByText('Add Flowchart Terms')).not.toBeVisible();

    // update store state for visibility
    mockModalOpenStore.set(true);

    // now ensure modal is visible
    expect(screen.getByText('Add Flowchart Terms')).toBeVisible();

    // with empty flowchart (default), expect no terms to be present to select
    expect(getAddTermsOptionsElements()).toHaveLength(0);

    // button state valid
    expect(screen.getByRole('button', { name: 'Add Terms to Flowchart' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();

    // closing modal updates state properly
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Add Flowchart Terms')).not.toBeVisible();

    // make sure modal is set to visible for other tests
    mockModalOpenStore.set(true);
  });

  test('terms to add are correct', async () => {
    render(AddTermsModal);

    // see that terms are not present
    expect(getAddTermsOptionsElements()).toHaveLength(0);

    // load a flowchart
    mockUserFlowchartsStore.set([TEST_FLOWCHART_SINGLE_PROGRAM_2]);
    mockSelectedFlowIndexStore.set(0);

    // persist changes
    await act();

    // ensure the correct terms are present
    expect(getAddTermsOptionsElements().map((elem) => elem.value)).toStrictEqual([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24'
    ]);

    expect(getAddTermsOptionsElements().map((elem) => elem.text)).toStrictEqual([
      'Summer 2017',
      'Fall 2017',
      'Winter 2018',
      'Spring 2018',
      'Summer 2018',
      'Fall 2018',
      'Winter 2019',
      'Spring 2019',
      'Summer 2019',
      'Fall 2019',
      'Winter 2020',
      'Spring 2020',
      'Summer 2020',
      'Fall 2020',
      'Winter 2021',
      'Spring 2021',
      'Summer 2021',
      'Fall 2021',
      'Winter 2022',
      'Spring 2022',
      'Summer 2022',
      'Fall 2022',
      'Winter 2023',
      'Spring 2023',
      'Summer 2023'
    ]);
  });

  test('can select single term', async () => {
    const user = userEvent.setup();

    render(AddTermsModal);

    // select single option and expect able to create
    await user.selectOptions(getAddTermsSelector(), 'Summer 2018');
    expect(getAddTermsOptionsElements(true).map((elem) => elem.text)).toStrictEqual([
      'Summer 2018'
    ]);
    expect(
      screen.getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
    ).toBeEnabled();

    // deselect and expect unable to create
    await user.deselectOptions(getAddTermsSelector(), 'Summer 2018');
    expect(
      screen.getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
    ).toBeDisabled();

    // select another option and expect able to create
    await user.selectOptions(getAddTermsSelector(), 'Fall 2022');
    expect(getAddTermsOptionsElements(true).map((elem) => elem.text)).toStrictEqual(['Fall 2022']);
    expect(
      screen.getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
    ).toBeEnabled();
  });

  test('can select multiple terms', async () => {
    const user = userEvent.setup();

    render(AddTermsModal);

    // select single option and expect able to create
    await user.selectOptions(getAddTermsSelector(), 'Summer 2018');
    expect(getAddTermsOptionsElements(true).map((elem) => elem.text)).toStrictEqual([
      'Summer 2018'
    ]);
    expect(
      screen.getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
    ).toBeEnabled();

    // select another option and expect able to create with more than one
    await user.selectOptions(getAddTermsSelector(), 'Fall 2022');
    expect(getAddTermsOptionsElements(true).map((elem) => elem.text)).toStrictEqual([
      'Summer 2018',
      'Fall 2022'
    ]);
    expect(
      screen.getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
    ).toBeEnabled();

    // close modal and reopen to verify that all options are cleared
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Add Flowchart Terms')).not.toBeVisible();
    mockModalOpenStore.set(true);
    expect(screen.getByText('Add Flowchart Terms')).toBeVisible();

    expect(getAddTermsOptionsElements(true)).toHaveLength(0);
  });
});
