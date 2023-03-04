import NewFlowModal from './NewFlowModal.svelte';
import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/svelte';

// load necessary API data
await apiDataConfig.init();

describe('NewFlowModal component tests ', () => {
  test('default state for NewFlowModal correct', () => {
    render(NewFlowModal, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData
      }
    });

    // ensure modal is visible
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
  });

  test('valid program results in ability to create', async () => {
    userEvent.setup();

    render(NewFlowModal, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData
      }
    });

    await userEvent.type(
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
    await userEvent.selectOptions(
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

    await userEvent.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Catalog'
      })[0],
      program1.catalog
    );
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

    await userEvent.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Major'
      })[0],
      program1.majorName
    );
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();

    // just to satisfy types, but will always be non-null
    if (program1.concName) {
      await userEvent.selectOptions(
        screen.getAllByRole('combobox', {
          name: 'Concentration'
        })[0],
        program1.id
      );
    }

    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  });

  test('changing removeGECourses option works', async () => {
    render(NewFlowModal, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData
      }
    });

    // starts as not checked
    expect(screen.getByRole('checkbox', { name: 'Remove GE Courses' })).not.toBeChecked();

    // check and verify
    await userEvent.click(screen.getByRole('checkbox', { name: 'Remove GE Courses' }));
    expect(screen.getByRole('checkbox', { name: 'Remove GE Courses' })).toBeChecked();

    // uncheck and verify
    await userEvent.click(screen.getByRole('checkbox', { name: 'Remove GE Courses' }));
    expect(screen.getByRole('checkbox', { name: 'Remove GE Courses' })).not.toBeChecked();
  });
});
