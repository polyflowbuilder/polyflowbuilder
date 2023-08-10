import userEvent from '@testing-library/user-event';
import { act, getAllByRole, render, screen } from '@testing-library/svelte';
import {
  mockModalOpenStore,
  mockSelectedFlowIndexStore,
  mockUserFlowchartsStore
} from '../../../../../tests/util/storeMocks';
import { vi } from 'vitest';
import { TEST_FLOWCHART_SINGLE_PROGRAM_2 } from '../../../../../tests/util/testFlowcharts';

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
    expect(
      screen
        .getByRole('listbox', {
          name: 'select flowchart terms to add'
        })
        .hasChildNodes()
    ).toBeFalsy();

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

    const multiselect = screen.getByRole('listbox', {
      name: 'select flowchart terms to add'
    });

    // see that terms are not present
    expect(multiselect.hasChildNodes()).toBeFalsy();

    // load a flowchart
    mockUserFlowchartsStore.set([TEST_FLOWCHART_SINGLE_PROGRAM_2]);
    mockSelectedFlowIndexStore.set(0);

    // persist changes
    await act();

    // ensure the correct terms are present
    expect(
      getAllByRole<HTMLOptionElement>(multiselect, 'option').map((elem) => elem.value)
    ).toStrictEqual([
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

    expect(
      getAllByRole<HTMLOptionElement>(multiselect, 'option').map((elem) => elem.text)
    ).toStrictEqual([
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

    const multiselect = screen.getByRole('listbox', {
      name: 'select flowchart terms to add'
    });

    // select single option and expect able to create
    await user.selectOptions(multiselect, 'Summer 2018');
    expect(
      getAllByRole<HTMLOptionElement>(multiselect, 'option', {
        selected: true
      }).map((elem) => elem.text)
    ).toStrictEqual(['Summer 2018']);
    expect(
      screen.getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
    ).toBeEnabled();

    // deselect and expect unable to create
    await user.deselectOptions(multiselect, 'Summer 2018');
    expect(
      screen.getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
    ).toBeDisabled();

    // select another option and expect able to create
    await user.selectOptions(multiselect, 'Fall 2022');
    expect(
      getAllByRole<HTMLOptionElement>(multiselect, 'option', {
        selected: true
      }).map((elem) => elem.text)
    ).toStrictEqual(['Fall 2022']);
    expect(
      screen.getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
    ).toBeEnabled();
  });

  test('can select multiple terms', async () => {
    const user = userEvent.setup();

    render(AddTermsModal);

    const multiselect = screen.getByRole('listbox', {
      name: 'select flowchart terms to add'
    });

    // select single option and expect able to create
    await user.selectOptions(multiselect, 'Summer 2018');
    expect(
      getAllByRole<HTMLOptionElement>(multiselect, 'option', {
        selected: true
      }).map((elem) => elem.text)
    ).toStrictEqual(['Summer 2018']);
    expect(
      screen.getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
    ).toBeEnabled();

    // select another option and expect able to create with more than one
    await user.selectOptions(multiselect, 'Fall 2022');
    expect(
      getAllByRole<HTMLOptionElement>(multiselect, 'option', {
        selected: true
      }).map((elem) => elem.text)
    ).toStrictEqual(['Summer 2018', 'Fall 2022']);
    expect(
      screen.getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
    ).toBeEnabled();
  });
});
