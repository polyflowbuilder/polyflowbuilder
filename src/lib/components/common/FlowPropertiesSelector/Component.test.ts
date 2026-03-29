import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import {
  mockProgramCacheStore,
  initMockedAPIDataStores,
  mockConcOptionsCacheStore,
  mockMajorOptionsCacheStore,
  mockAvailableFlowchartCatalogsStore,
  mockAvailableFlowchartStartYearsStore
} from '$test/util/storeMocks';
import type { UserEvent } from '@testing-library/user-event';

// load necessary API data
await apiDataConfig.init();
const apiDataProgramDataArr = Array.from(apiDataConfig.apiData.programData.values());

// this import NEEDS to be down here or else the vi.mock() call that we're using to mock
// the programCache and courseCache stores FAILS!! because vi.mock() MUST be called
// before the FlowEditor component is imported or else things break
import Component from './Component.svelte';

async function setFlowNameStartingYear(user: UserEvent) {
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
}

// assumes that things are filled out in idx order
// eg program 1 first, program 2 next
async function setProgram(
  user: UserEvent,
  idx: number,
  alreadySelectedProgramIds: string[],
  selectProgramWithMultipleConcs = false
) {
  // choose program

  const alreadySelectedMajorNames = alreadySelectedProgramIds
    .filter((str) => str.length)
    .map((progId) => apiDataProgramDataArr.find((prog) => prog.id === progId)?.majorName);
  const programList = apiDataProgramDataArr.filter(
    (prog) =>
      !alreadySelectedMajorNames.includes(prog.majorName) &&
      (!selectProgramWithMultipleConcs ||
        apiDataProgramDataArr.filter(
          (prog2) => prog2.catalog === prog.catalog && prog2.majorName === prog.majorName
        ).length > 1)
  );
  const program = programList[Math.floor(Math.random() * programList.length)];

  await user.selectOptions(
    screen.getAllByRole('combobox', {
      name: 'Catalog'
    })[idx],
    program.catalog
  );
  await user.selectOptions(
    screen.getAllByRole('combobox', {
      name: 'Major'
    })[idx],
    program.majorName
  );
  // just to satisfy types, but will always be non-null
  if (program.concName) {
    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Concentration'
      })[idx],
      program.id
    );
  }

  return program;
}

describe('FlowPropertiesSelector/Component initial mount tests', () => {
  // need to mock out relevant stores since FlowPropertiesSelector depends on these
  // mock call is hoisted to top of file
  beforeAll(() => {
    vi.mock('$lib/client/stores/apiDataStore', () => {
      return {
        programCache: mockProgramCacheStore,
        concOptionsCache: mockConcOptionsCacheStore,
        majorOptionsCache: mockMajorOptionsCacheStore,
        availableFlowchartCatalogs: mockAvailableFlowchartCatalogsStore,
        availableFlowchartStartYears: mockAvailableFlowchartStartYearsStore
      };
    });
  });

  test('default state for Component correct', () => {
    render(Component, {
      props: {
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      }
    });

    // ensure visible with correct values

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
  });
});

describe('FlowPropertiesSelector/Component invalid options tests', () => {
  // dont need to remock bc hoisted, but do need to re-init relevant stores
  beforeAll(initMockedAPIDataStores);

  // helper function for verifying invalid state given options
  const assertOptionsInvalid = (props: {
    flowName: string;
    flowStartYear: string;
    programIdInputs: string[];
  }) => {
    let optionsValid = false;
    const optionsValidUpdateEventHandler = vi.fn(
      (event: CustomEvent<boolean>) => (optionsValid = event.detail)
    );

    render(Component, {
      props,
      events: {
        optionsValidUpdate: optionsValidUpdateEventHandler
      }
    });

    // event fired when component is initialized
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(1);
    expect(optionsValid).toBeFalsy();
  };

  test('empty everything is invalid', () => {
    assertOptionsInvalid({
      flowName: '',
      flowStartYear: '',
      programIdInputs: ['']
    });
  });

  test('just name is invalid', () => {
    assertOptionsInvalid({
      flowName: 'test',
      flowStartYear: '',
      programIdInputs: ['']
    });
  });

  test('just start year is invalid', () => {
    assertOptionsInvalid({
      flowName: '',
      flowStartYear: '2021-2022',
      programIdInputs: ['']
    });
  });

  test('just a valid program is invalid', () => {
    assertOptionsInvalid({
      flowName: '',
      flowStartYear: '',
      programIdInputs: ['fc22cb1a-abad-466a-81f7-6010b09a15c9']
    });
  });

  test('everything but name is invalid', () => {
    assertOptionsInvalid({
      flowName: '',
      flowStartYear: '2020-2021',
      programIdInputs: ['fc22cb1a-abad-466a-81f7-6010b09a15c9']
    });
  });

  test('everything but start year is invalid', () => {
    assertOptionsInvalid({
      flowName: 'test',
      flowStartYear: '',
      programIdInputs: ['fc22cb1a-abad-466a-81f7-6010b09a15c9']
    });
  });

  test('everything but valid program is invalid', () => {
    assertOptionsInvalid({
      flowName: 'test',
      flowStartYear: '2020-2021',
      programIdInputs: ['']
    });
  });

  test('everything valid except name too long is invalid', () => {
    assertOptionsInvalid({
      flowName:
        'sdlkvmsdklvmksdlvmlksdmvkldsmvklsdmvklsdmvlksdmvksldmvsdlkvmsdlkmvslkdvmslkkmlvslksd',
      flowStartYear: '2020-2021',
      programIdInputs: ['fc22cb1a-abad-466a-81f7-6010b09a15c9']
    });
  });

  test('everything valid except additional empty programs is invalid', () => {
    assertOptionsInvalid({
      flowName: 'test',
      flowStartYear: '2020-2021',
      programIdInputs: ['fc22cb1a-abad-466a-81f7-6010b09a15c9', '', '']
    });
  });
});

describe('FlowPropertiesSelector/Component valid options/updates tests', () => {
  // dont need to remock bc hoisted, but do need to re-init relevant stores
  beforeAll(initMockedAPIDataStores);

  test('create valid payloads', async () => {
    const user = userEvent.setup();

    let programIds = [''];
    let optionsValid = false;
    const flowProgramIdsUpdateEventHandler = vi.fn(
      (event: CustomEvent<string[]>) => (programIds = event.detail)
    );
    const optionsValidUpdateEventHandler = vi.fn(
      (event: CustomEvent<boolean>) => (optionsValid = event.detail)
    );

    render(Component, {
      props: {
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      },
      events: {
        flowProgramIdsUpdate: flowProgramIdsUpdateEventHandler,
        optionsValidUpdate: optionsValidUpdateEventHandler
      }
    });

    // initialize expected states
    // events fired when component is initialized
    let expectedEventFiredCount = 1;
    const expectedProgramIds = [''];

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    await setFlowNameStartingYear(user);
    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create second program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedEventFiredCount += 1;
    expectedProgramIds.push('');

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program2 = await setProgram(user, 1, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program2.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create third program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedEventFiredCount += 1;
    expectedProgramIds.push('');

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program3 = await setProgram(user, 2, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program3.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create fourth program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedEventFiredCount += 1;
    expectedProgramIds.push('');

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program4 = await setProgram(user, 3, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program4.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create fifth program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedEventFiredCount += 1;
    expectedProgramIds.push('');

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program5 = await setProgram(user, 4, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program5.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // check that we cannot create any more programs
    expect(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    ).toBeDisabled();
    expect(
      screen.getByText(
        'Max program count reached. If you need more for your flowchart, please reach out to us about your use case.'
      )
    ).toBeVisible();
  });

  test('remove program from valid payload is still valid', async () => {
    const user = userEvent.setup();

    let programIds = [''];
    let optionsValid = false;
    const flowProgramIdsUpdateEventHandler = vi.fn(
      (event: CustomEvent<string[]>) => (programIds = event.detail)
    );
    const optionsValidUpdateEventHandler = vi.fn(
      (event: CustomEvent<boolean>) => (optionsValid = event.detail)
    );

    render(Component, {
      props: {
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      },
      events: {
        flowProgramIdsUpdate: flowProgramIdsUpdateEventHandler,
        optionsValidUpdate: optionsValidUpdateEventHandler
      }
    });

    // initialize expected states
    // events fired when component is initialized
    let flowProgramIdsUpdateExpectedEventFiredCount = 1;
    let optionsValidUpdateExpectedEventFiredCount = 1;
    const expectedProgramIds = [''];

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    await setFlowNameStartingYear(user);
    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate three programs

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds);
    flowProgramIdsUpdateExpectedEventFiredCount += 1;
    optionsValidUpdateExpectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create second program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    flowProgramIdsUpdateExpectedEventFiredCount += 1;
    optionsValidUpdateExpectedEventFiredCount += 1;
    expectedProgramIds.push('');

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program2 = await setProgram(user, 1, expectedProgramIds);
    flowProgramIdsUpdateExpectedEventFiredCount += 1;
    optionsValidUpdateExpectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program2.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create third program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    flowProgramIdsUpdateExpectedEventFiredCount += 1;
    optionsValidUpdateExpectedEventFiredCount += 1;
    expectedProgramIds.push('');

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program3 = await setProgram(user, 2, expectedProgramIds);
    flowProgramIdsUpdateExpectedEventFiredCount += 1;
    optionsValidUpdateExpectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program3.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // remove a program
    await user.click(
      screen.getAllByRole('button', {
        name: 'REMOVE'
      })[0] // 0th remove is on 1st addl program
    );
    flowProgramIdsUpdateExpectedEventFiredCount += 1;
    expectedProgramIds.splice(1, 1);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();
  });

  test('change conc in valid payload is still valid', async () => {
    const user = userEvent.setup();

    let programIds = [''];
    let optionsValid = false;
    const flowProgramIdsUpdateEventHandler = vi.fn(
      (event: CustomEvent<string[]>) => (programIds = event.detail)
    );
    const optionsValidUpdateEventHandler = vi.fn(
      (event: CustomEvent<boolean>) => (optionsValid = event.detail)
    );

    render(Component, {
      props: {
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      },
      events: {
        flowProgramIdsUpdate: flowProgramIdsUpdateEventHandler,
        optionsValidUpdate: optionsValidUpdateEventHandler
      }
    });

    // initialize expected states
    // events fired when component is initialized
    let flowProgramIdsUpdateExpectedEventFiredCount = 1;
    let optionsValidUpdateExpectedEventFiredCount = 1;
    const expectedProgramIds = [''];

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    await setFlowNameStartingYear(user);
    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds, true);
    flowProgramIdsUpdateExpectedEventFiredCount += 1;
    optionsValidUpdateExpectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // then change just conc and expect still valid
    const newProgramSelectOptions = apiDataProgramDataArr
      .filter((prog) => prog.catalog === program1.catalog && prog.majorName === program1.majorName)
      .filter(
        (prog) =>
          prog.id !==
          screen.getByRole<HTMLSelectElement>('combobox', {
            name: 'Concentration'
          }).value
      );
    const newProgram =
      newProgramSelectOptions[Math.floor(Math.random() * newProgramSelectOptions.length)];

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Concentration' }),
      newProgram.id
    );
    flowProgramIdsUpdateExpectedEventFiredCount += 1;
    expectedProgramIds[0] = newProgram.id;

    // check that UI is still correct and updates happened appropriately
    expect(
      screen.getByRole('combobox', {
        name: 'Catalog'
      })
    ).toHaveValue(program1.catalog);
    expect(
      screen.getByRole('combobox', {
        name: 'Major'
      })
    ).toHaveValue(program1.majorName);
    expect(
      screen.getByRole('combobox', {
        name: 'Concentration'
      })
    ).toHaveValue(newProgram.id);
    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(
      flowProgramIdsUpdateExpectedEventFiredCount
    );
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(
      optionsValidUpdateExpectedEventFiredCount
    );
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();
  });
});

describe('FlowPropertiesSelector/Component invalid updates tests', () => {
  test('update once-valid payload w/ 1 program to invalid, expect invalid', async () => {
    const user = userEvent.setup();

    let programIds = [''];
    let optionsValid = false;
    const flowProgramIdsUpdateEventHandler = vi.fn(
      (event: CustomEvent<string[]>) => (programIds = event.detail)
    );
    const optionsValidUpdateEventHandler = vi.fn(
      (event: CustomEvent<boolean>) => (optionsValid = event.detail)
    );

    render(Component, {
      props: {
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      },
      events: {
        flowProgramIdsUpdate: flowProgramIdsUpdateEventHandler,
        optionsValidUpdate: optionsValidUpdateEventHandler
      }
    });

    // initialize expected states
    // events fired when component is initialized
    let expectedEventFiredCount = 1;
    const expectedProgramIds = [''];

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    await setFlowNameStartingYear(user);
    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate three programs

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create second program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedEventFiredCount += 1;
    expectedProgramIds.push('');

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program2 = await setProgram(user, 1, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program2.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create third program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedEventFiredCount += 1;
    expectedProgramIds.push('');

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program3 = await setProgram(user, 2, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program3.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // change info on a program
    const removeSelectedCatalog = apiDataConfig.apiData.catalogs.filter(
      (c) =>
        c !==
        (
          screen.getAllByRole('combobox', {
            name: 'Catalog'
          })[1] as HTMLOptionElement
        ).value
    );
    const newCatalogValue =
      removeSelectedCatalog[Math.floor(Math.random() * removeSelectedCatalog.length)];

    await user.selectOptions(
      screen.getAllByRole('combobox', { name: 'Catalog' })[1],
      newCatalogValue
    );
    expectedEventFiredCount += 1;
    expectedProgramIds[1] = '';

    // check that UI updated correctly and that options are no longer valid
    expect(
      screen.getAllByRole('combobox', {
        name: 'Catalog'
      })[1]
    ).toHaveValue(newCatalogValue);
    expect(
      screen.getAllByRole('combobox', {
        name: 'Major'
      })[1]
    ).toHaveValue('');
    expect(
      screen.getAllByRole('combobox', {
        name: 'Concentration'
      })[1]
    ).toHaveValue('');
    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // set new program and expect valid
    const newProgram1 = await setProgram(user, 1, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds[1] = newProgram1.id;
    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // then change major and expect conc to reset while everything else stays the same
    // make sure we pick a major that isn't already selected in another program (second filter)
    const selectedMajors = expectedProgramIds.map((prog) => {
      const progMetadata = apiDataProgramDataArr.find((entry) => entry.id === prog);
      if (!progMetadata) {
        throw new Error(`progMetadata for program ${prog} not found`);
      }
      return progMetadata.majorName;
    });
    const removeSelectedMajor = apiDataProgramDataArr
      .filter((prog) => prog.catalog === newProgram1.catalog)
      .filter((prog) => !selectedMajors.includes(prog.majorName))
      .map((prog) => prog.majorName);
    const newMajorValue =
      removeSelectedMajor[Math.floor(Math.random() * removeSelectedMajor.length)];

    await user.selectOptions(screen.getAllByRole('combobox', { name: 'Major' })[1], newMajorValue);
    expectedEventFiredCount += 1;
    expectedProgramIds[1] = '';

    expect(
      screen.getAllByRole('combobox', {
        name: 'Catalog'
      })[1]
    ).toHaveValue(newProgram1.catalog);
    expect(
      screen.getAllByRole('combobox', {
        name: 'Major'
      })[1]
    ).toHaveValue(newMajorValue);
    expect(
      screen.getAllByRole('combobox', {
        name: 'Concentration'
      })[1]
    ).toHaveValue('');
    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();
  });

  test('cannot create a program with same major (same catalog)', async () => {
    const user = userEvent.setup();

    let programIds = [''];
    let optionsValid = false;
    const flowProgramIdsUpdateEventHandler = vi.fn(
      (event: CustomEvent<string[]>) => (programIds = event.detail)
    );
    const optionsValidUpdateEventHandler = vi.fn(
      (event: CustomEvent<boolean>) => (optionsValid = event.detail)
    );

    render(Component, {
      props: {
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      },
      events: {
        flowProgramIdsUpdate: flowProgramIdsUpdateEventHandler,
        optionsValidUpdate: optionsValidUpdateEventHandler
      }
    });

    // initialize expected states
    // events fired when component is initialized
    let expectedEventFiredCount = 1;
    const expectedProgramIds = [''];

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    await setFlowNameStartingYear(user);
    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate programs

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create second program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedEventFiredCount += 1;
    expectedProgramIds.push('');

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // try to populate second program with the same major and ensure it fails
    const programList = apiDataProgramDataArr.filter(
      (prog) => prog.majorName === program1.majorName && prog.catalog === program1.catalog
    );
    const program2 = programList[Math.floor(Math.random() * programList.length)];
    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Catalog'
      })[1],
      program2.catalog
    );
    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Major'
      })[1],
      program2.majorName
    );
    expect(
      screen.getAllByRole('combobox', {
        name: 'Concentration'
      })
    );
    let failed = false;
    try {
      await user.selectOptions(
        screen.getAllByRole('combobox', {
          name: 'Concentration'
        })[1],
        program2.id
      );
    } catch (_error) {
      failed = true;
    }
    if (!failed) {
      throw new Error('able to find conc option when not supposed to');
    }
  });

  test('cannot create a program with same major (different catalog)', async () => {
    const user = userEvent.setup();

    let programIds = [''];
    let optionsValid = false;
    const flowProgramIdsUpdateEventHandler = vi.fn(
      (event: CustomEvent<string[]>) => (programIds = event.detail)
    );
    const optionsValidUpdateEventHandler = vi.fn(
      (event: CustomEvent<boolean>) => (optionsValid = event.detail)
    );

    render(Component, {
      props: {
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      },
      events: {
        flowProgramIdsUpdate: flowProgramIdsUpdateEventHandler,
        optionsValidUpdate: optionsValidUpdateEventHandler
      }
    });

    // initialize expected states
    // events fired when component is initialized
    let expectedEventFiredCount = 1;
    const expectedProgramIds = [''];

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    await setFlowNameStartingYear(user);
    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate programs

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds);
    expectedEventFiredCount += 1;
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create second program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedEventFiredCount += 1;
    expectedProgramIds.push('');

    expect(flowProgramIdsUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(optionsValidUpdateEventHandler).toHaveBeenCalledTimes(expectedEventFiredCount);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // try to populate second program with the same major and ensure it fails
    const programList = apiDataProgramDataArr.filter(
      (prog) => prog.majorName === program1.majorName && prog.catalog !== program1.catalog
    );
    const program2 = programList[Math.floor(Math.random() * programList.length)];
    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Catalog'
      })[1],
      program2.catalog
    );
    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Major'
      })[1],
      program2.majorName
    );
    expect(
      screen.getAllByRole('combobox', {
        name: 'Concentration'
      })
    );
    let failed = false;
    try {
      await user.selectOptions(
        screen.getAllByRole('combobox', {
          name: 'Concentration'
        })[1],
        program2.id
      );
    } catch (_error) {
      failed = true;
    }
    if (!failed) {
      throw new Error('able to find conc option when not supposed to');
    }
  });
});
