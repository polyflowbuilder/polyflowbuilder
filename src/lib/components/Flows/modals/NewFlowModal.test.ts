import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { mockModalOpenStore } from '../../../../../tests/util/storeMocks';

// this import NEEDS to be down here or else the vi.mock() call that we're using to mock
// the newFlowModalOpenStore FAILS!! because vi.mock() MUST be called
// before the NewFlowModal component is imported or else things break
import NewFlowModal from './NewFlowModal.svelte';

// load necessary API data
await apiDataConfig.init();

describe('NewFlowModal component tests ', () => {
  beforeAll(() => {
    // need to mock out relevant store
    vi.mock('$lib/client/stores/modalStateStore', () => {
      return {
        newFlowModalOpen: mockModalOpenStore
      };
    });
  });

  test('default state for NewFlowModal correct', async () => {
    const user = userEvent.setup();

    render(NewFlowModal, {
      props: {
        availableFlowchartStartYears: apiDataConfig.apiData.startYears,
        availableFlowchartCatalogs: apiDataConfig.apiData.catalogs,
        programCache: apiDataConfig.apiData.programData
      }
    });

    // ensure modal is not visible at first
    expect(screen.getByText('Create New Flowchart')).not.toBeVisible();

    // update store state for visibility
    mockModalOpenStore.set(true);

    // now ensure modal is visible
    expect(screen.getByText('Create New Flowchart')).toBeVisible();

    // make sure FlowPropertiesSelector values are at default
    // flow name
    expect(
      screen.getByRole('textbox', {
        name: 'Flow Name'
      })
    ).toBeVisible();
    expect(
      screen.getByRole('textbox', {
        name: 'Flow Name'
      })
    ).toHaveTextContent('');
    expect(screen.getByText('(0/80)')).toBeVisible();
    expect(screen.getByText('(0/80)')).toHaveClass('text-red-600');

    // starting year
    expect(
      screen.getByRole('combobox', {
        name: 'Starting Year'
      })
    ).toBeVisible();
    expect(
      screen.getByRole('combobox', {
        name: 'Starting Year'
      })
    ).toHaveTextContent('Choose ...');

    // correct program count
    expect(screen.getAllByText('PRIMARY').length).toBe(1);
    expect(screen.queryAllByRole('button', { name: 'REMOVE' }).length).toBe(0);
    expect(screen.queryAllByText('ADDITIONAL').length).toBe(0);

    // empty first program
    expect(
      screen.getAllByRole('combobox', {
        name: 'Catalog'
      }).length
    ).toBe(1);
    expect(
      screen.getAllByRole('combobox', {
        name: 'Catalog'
      })[0]
    ).toHaveTextContent('Choose ...');

    expect(
      screen.getAllByRole('combobox', {
        name: 'Major'
      }).length
    ).toBe(1);
    expect(
      screen.getAllByRole('combobox', {
        name: 'Major'
      })[0]
    ).toHaveTextContent('Choose ...');

    expect(
      screen.getAllByRole('combobox', {
        name: 'Concentration'
      }).length
    ).toBe(1);
    expect(
      screen.getAllByRole('combobox', {
        name: 'Concentration'
      })[0]
    ).toHaveTextContent('Choose ...');

    // can add program
    expect(screen.getByRole('button', { name: 'Add Program' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add Program' })).toBeEnabled();

    // flow generation options set default
    expect(screen.getByRole('checkbox', { name: 'Remove GE Courses' })).not.toBeChecked();

    // button state valid
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();

    // closing modal updates state properly
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Create New Flowchart')).not.toBeVisible();

    // make sure modal is set to visible for other tests
    mockModalOpenStore.set(true);
  });

  test('valid program results in ability to create', async () => {
    const user = userEvent.setup();

    render(NewFlowModal, {
      props: {
        availableFlowchartStartYears: apiDataConfig.apiData.startYears,
        availableFlowchartCatalogs: apiDataConfig.apiData.catalogs,
        programCache: apiDataConfig.apiData.programData
      }
    });

    await user.type(
      screen.getByRole('textbox', {
        name: 'Flow Name'
      }),
      'test'
    );
    expect(
      screen.getByRole('textbox', {
        name: 'Flow Name'
      })
    ).toHaveValue('test');
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

    // set year
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Starting Year'
      }),
      '2020'
    );
    expect(
      screen.getByRole('combobox', {
        name: 'Starting Year'
      })
    ).toHaveDisplayValue('2020');
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

    // populate first program
    const program1 =
      apiDataConfig.apiData.programData[
        Math.floor(Math.random() * apiDataConfig.apiData.programData.length)
      ];

    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Catalog'
      })[0],
      program1.catalog
    );
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Major'
      })[0],
      program1.majorName
    );
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

    // just to satisfy types, but will always be non-null
    if (program1.concName) {
      await user.selectOptions(
        screen.getAllByRole('combobox', {
          name: 'Concentration'
        })[0],
        program1.id
      );
    }

    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  });

  test('changing removeGECourses option works', async () => {
    const user = userEvent.setup();

    render(NewFlowModal, {
      props: {
        availableFlowchartStartYears: apiDataConfig.apiData.startYears,
        availableFlowchartCatalogs: apiDataConfig.apiData.catalogs,
        programCache: apiDataConfig.apiData.programData
      }
    });

    // starts as not checked
    expect(screen.getByRole('checkbox', { name: 'Remove GE Courses' })).not.toBeChecked();

    // check and verify
    await user.click(screen.getByRole('checkbox', { name: 'Remove GE Courses' }));
    expect(screen.getByRole('checkbox', { name: 'Remove GE Courses' })).toBeChecked();

    // uncheck and verify
    await user.click(screen.getByRole('checkbox', { name: 'Remove GE Courses' }));
    expect(screen.getByRole('checkbox', { name: 'Remove GE Courses' })).not.toBeChecked();
  });
});
