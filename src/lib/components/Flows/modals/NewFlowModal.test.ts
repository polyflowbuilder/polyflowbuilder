import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import {
  mockModalOpenStore,
  mockCourseCacheStore,
  mockProgramCacheStore,
  mockMajorNameCacheStore,
  initMockedAPIDataStores,
  mockConcOptionsCacheStore,
  mockAvailableFlowchartCatalogsStore,
  mockAvailableFlowchartStartYearsStore
} from '../../../../../tests/util/storeMocks';

// this import NEEDS to be down here or else the vi.mock() call that we're using to mock
// the newFlowModalOpenStore FAILS!! because vi.mock() MUST be called
// before the NewFlowModal component is imported or else things break
import NewFlowModal from './NewFlowModal.svelte';

// load necessary API data
await apiDataConfig.init();

describe('NewFlowModal component tests', () => {
  beforeAll(() => {
    // need to mock out relevant store
    vi.mock('$lib/client/stores/modalStateStore', () => {
      return {
        newFlowModalOpen: mockModalOpenStore
      };
    });
    vi.mock('$lib/client/stores/apiDataStore', () => {
      return {
        courseCache: mockCourseCacheStore,
        programCache: mockProgramCacheStore,
        majorNameCache: mockMajorNameCacheStore,
        concOptionsCache: mockConcOptionsCacheStore,
        availableFlowchartCatalogs: mockAvailableFlowchartCatalogsStore,
        availableFlowchartStartYears: mockAvailableFlowchartStartYearsStore
      };
    });
    initMockedAPIDataStores();
  });

  test('default state for NewFlowModal correct', async () => {
    const user = userEvent.setup();

    render(NewFlowModal);

    // ensure modal is not visible at first
    expect(screen.getByText('Create New Flowchart')).not.toBeVisible();

    // update store state for visibility
    mockModalOpenStore.set(true);

    // now ensure modal is visible
    expect(screen.getByText('Create New Flowchart')).toBeVisible();

    // make sure FlowPropertiesSelector values are at default

    const flowNameElement = screen.getByRole('textbox', {
      name: 'Flow Name'
    });
    const flowStartingYearElement = screen.getByRole('combobox', {
      name: 'Starting Year'
    });
    const flowProgramCatalogElements = screen.getAllByRole('combobox', {
      name: 'Catalog'
    });
    const flowProgramMajorElements = screen.getAllByRole('combobox', {
      name: 'Major'
    });
    const flowProgramConcentrationElements = screen.getAllByRole('combobox', {
      name: 'Concentration'
    });

    // flow name
    expect(flowNameElement).toBeVisible();
    expect(flowNameElement).toHaveTextContent('');
    expect(screen.getByText('(0/80)')).toBeVisible();
    expect(screen.getByText('(0/80)')).toHaveClass('text-red-600');

    // starting year
    expect(flowStartingYearElement).toBeVisible();
    expect(flowStartingYearElement).toHaveTextContent('Choose ...');

    // correct program count
    expect(screen.getAllByText('PRIMARY').length).toBe(1);
    expect(screen.queryAllByRole('button', { name: 'REMOVE' }).length).toBe(0);
    expect(screen.queryAllByText('ADDITIONAL').length).toBe(0);

    // empty first program
    expect(flowProgramCatalogElements.length).toBe(1);
    expect(flowProgramCatalogElements[0]).toHaveTextContent('Choose ...');

    expect(flowProgramMajorElements.length).toBe(1);
    expect(flowProgramMajorElements[0]).toHaveTextContent('Choose ...');

    expect(flowProgramConcentrationElements.length).toBe(1);
    expect(flowProgramConcentrationElements[0]).toHaveTextContent('Choose ...');

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

    render(NewFlowModal);

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
    const programDataArr = Array.from(apiDataConfig.apiData.programData.values());
    const program1 = programDataArr[Math.floor(Math.random() * programDataArr.length)];

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

    render(NewFlowModal);

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
