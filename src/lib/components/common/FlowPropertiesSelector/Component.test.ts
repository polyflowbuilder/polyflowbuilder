import Component from './Component.svelte';
import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';

// load necessary API data
await apiDataConfig.init();

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
    .map(
      (progId) => apiDataConfig.apiData.programData.find((prog) => prog.id === progId)?.majorName
    );
  const programList = apiDataConfig.apiData.programData.filter(
    (prog) =>
      !alreadySelectedMajorNames.includes(prog.majorName) &&
      (!selectProgramWithMultipleConcs ||
        (selectProgramWithMultipleConcs &&
          apiDataConfig.apiData.programData.filter(
            (prog2) => prog2.catalog === prog.catalog && prog2.majorName === prog.majorName
          ).length > 1))
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
  test('default state for Component correct', () => {
    render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      }
    });

    // ensure visible with correct values

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
  });
});

describe('FlowPropertiesSelector/Component invalid options tests', () => {
  test('empty everything is invalid', () => {
    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      }
    });

    // do it this way bc dispatch events don't get fired before component mounted
    // (eg when reactive stuff is setup)
    // see https://github.com/sveltejs/svelte/issues/4470
    let optionsValid = false;
    const mock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', mock);
    expect(mock).toHaveBeenCalledTimes(0);
    expect(optionsValid).toBeFalsy();
  });

  test('just name is invalid', () => {
    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: 'test',
        flowStartYear: '',
        programIdInputs: ['']
      }
    });

    // do it this way bc dispatch events don't get fired before component mounted
    // (eg when reactive stuff is setup)
    // see https://github.com/sveltejs/svelte/issues/4470
    let optionsValid = false;
    const mock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', mock);
    expect(mock).toHaveBeenCalledTimes(0);
    expect(optionsValid).toBeFalsy();
  });

  test('just start year is invalid', () => {
    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '2021-2022',
        programIdInputs: ['']
      }
    });

    // do it this way bc dispatch events don't get fired before component mounted
    // (eg when reactive stuff is setup)
    // see https://github.com/sveltejs/svelte/issues/4470
    let optionsValid = false;
    const mock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', mock);
    expect(mock).toHaveBeenCalledTimes(0);
    expect(optionsValid).toBeFalsy();
  });

  test('just a valid program is invalid', () => {
    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['fc22cb1a-abad-466a-81f7-6010b09a15c9']
      }
    });

    // do it this way bc dispatch events don't get fired before component mounted
    // (eg when reactive stuff is setup)
    // see https://github.com/sveltejs/svelte/issues/4470
    let optionsValid = false;
    const mock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', mock);
    expect(mock).toHaveBeenCalledTimes(0);
    expect(optionsValid).toBeFalsy();
  });

  test('everything but name is invalid', () => {
    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '2020-2021',
        programIdInputs: ['fc22cb1a-abad-466a-81f7-6010b09a15c9']
      }
    });

    // do it this way bc dispatch events don't get fired before component mounted
    // (eg when reactive stuff is setup)
    // see https://github.com/sveltejs/svelte/issues/4470
    let optionsValid = false;
    const mock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', mock);
    expect(mock).toHaveBeenCalledTimes(0);
    expect(optionsValid).toBeFalsy();
  });

  test('everything but start year is invalid', () => {
    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: 'test',
        flowStartYear: '',
        programIdInputs: ['fc22cb1a-abad-466a-81f7-6010b09a15c9']
      }
    });

    // do it this way bc dispatch events don't get fired before component mounted
    // (eg when reactive stuff is setup)
    // see https://github.com/sveltejs/svelte/issues/4470
    let optionsValid = false;
    const mock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', mock);
    expect(mock).toHaveBeenCalledTimes(0);
    expect(optionsValid).toBeFalsy();
  });

  test('everything but valid program is invalid', () => {
    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: 'test',
        flowStartYear: '2020-2021',
        programIdInputs: ['']
      }
    });

    // do it this way bc dispatch events don't get fired before component mounted
    // (eg when reactive stuff is setup)
    // see https://github.com/sveltejs/svelte/issues/4470
    let optionsValid = false;
    const mock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', mock);
    expect(mock).toHaveBeenCalledTimes(0);
    expect(optionsValid).toBeFalsy();
  });

  test('everything valid except name too long', () => {
    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName:
          'sdlkvmsdklvmksdlvmlksdmvkldsmvklsdmvklsdmvlksdmvksldmvsdlkvmsdlkmvslkdvmslkkmlvslksd',
        flowStartYear: '2020-2021',
        programIdInputs: ['fc22cb1a-abad-466a-81f7-6010b09a15c9']
      }
    });

    // do it this way bc dispatch events don't get fired before component mounted
    // (eg when reactive stuff is setup)
    // see https://github.com/sveltejs/svelte/issues/4470
    let optionsValid = false;
    const mock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', mock);
    expect(mock).toHaveBeenCalledTimes(0);
    expect(optionsValid).toBeFalsy();
  });

  test('everything valid except additional empty programs', () => {
    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: 'test',
        flowStartYear: '2020-2021',
        programIdInputs: ['fc22cb1a-abad-466a-81f7-6010b09a15c9', '', '']
      }
    });

    // do it this way bc dispatch events don't get fired before component mounted
    // (eg when reactive stuff is setup)
    // see https://github.com/sveltejs/svelte/issues/4470
    let optionsValid = false;
    const mock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', mock);
    expect(mock).toHaveBeenCalledTimes(0);
    expect(optionsValid).toBeFalsy();
  });
});

describe('FlowPropertiesSelector/Component valid options/updates tests', () => {
  test('create valid payloads', async () => {
    const user = userEvent.setup();

    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      }
    });

    let programIds = [''];
    let optionsValid = false;
    const programIdEventHandlerMock = vi.fn((event) => (programIds = event.detail));
    const optionsValidEventHandlerMock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', optionsValidEventHandlerMock);
    component.$on('flowProgramIdsUpdate', programIdEventHandlerMock);

    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    const expectedProgramIds: string[] = [];

    await setFlowNameStartingYear(user);
    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create second program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedProgramIds.push('');
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program2 = await setProgram(user, 1, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program2.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(3);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(3);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create third program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedProgramIds.push('');
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(4);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(4);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program3 = await setProgram(user, 2, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program3.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(5);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(5);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create fourth program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedProgramIds.push('');
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(6);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(6);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program4 = await setProgram(user, 3, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program4.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(7);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(7);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create fifth program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedProgramIds.push('');
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(8);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(8);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program5 = await setProgram(user, 4, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program5.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(9);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(9);
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

    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      }
    });

    let programIds = [''];
    let optionsValid = false;
    const programIdEventHandlerMock = vi.fn((event) => (programIds = event.detail));
    const optionsValidEventHandlerMock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', optionsValidEventHandlerMock);
    component.$on('flowProgramIdsUpdate', programIdEventHandlerMock);

    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    await setFlowNameStartingYear(user);
    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    // populate three programs
    const expectedProgramIds: string[] = [];

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create second program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedProgramIds.push('');
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program2 = await setProgram(user, 1, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program2.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(3);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(3);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create third program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedProgramIds.push('');
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(4);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(4);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program3 = await setProgram(user, 2, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program3.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(5);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(5);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // remove a program
    await user.click(
      screen.getAllByRole('button', {
        name: 'REMOVE'
      })[0] // 0th remove is on 1st addl program
    );
    expectedProgramIds.splice(1, 1);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(6);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(5);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();
  });

  test('change conc in valid payload is still valid', async () => {
    const user = userEvent.setup();

    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      }
    });

    let programIds = [''];
    let optionsValid = false;
    const programIdEventHandlerMock = vi.fn((event) => (programIds = event.detail));
    const optionsValidEventHandlerMock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', optionsValidEventHandlerMock);
    component.$on('flowProgramIdsUpdate', programIdEventHandlerMock);

    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    const expectedProgramIds: string[] = [];

    await setFlowNameStartingYear(user);
    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds, true);
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // then change just conc and expect still valid
    const newProgramSelectOptions = apiDataConfig.apiData.programData
      .filter((prog) => prog.catalog === program1.catalog && prog.majorName === program1.majorName)
      .filter(
        (prog) =>
          prog.id !==
          (
            screen.getByRole('combobox', {
              name: 'Concentration'
            }) as HTMLOptionElement
          ).value
      );
    const newProgram =
      newProgramSelectOptions[Math.floor(Math.random() * newProgramSelectOptions.length)];

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Concentration' }),
      newProgram.id
    );

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
    expectedProgramIds[0] = newProgram.id;
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();
  });
});

describe('FlowPropertiesSelector/Component invalid updates tests', () => {
  test('update once-valid payload w/ 1 program to invalid, expect invalid', async () => {
    const user = userEvent.setup();

    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      }
    });

    let programIds = [''];
    let optionsValid = false;
    const programIdEventHandlerMock = vi.fn((event) => (programIds = event.detail));
    const optionsValidEventHandlerMock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', optionsValidEventHandlerMock);
    component.$on('flowProgramIdsUpdate', programIdEventHandlerMock);

    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    await setFlowNameStartingYear(user);
    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    // populate three programs
    const expectedProgramIds: string[] = [];

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create second program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedProgramIds.push('');
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program2 = await setProgram(user, 1, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program2.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(3);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(3);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create third program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedProgramIds.push('');
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(4);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(4);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // populate
    const program3 = await setProgram(user, 2, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program3.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(5);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(5);
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
    expectedProgramIds[1] = '';
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(6);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(6);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // set new program and expect valid
    const newProgram1 = await setProgram(user, 1, expectedProgramIds);
    expectedProgramIds[1] = newProgram1.id;
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(7);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(7);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // then change major and expect conc to reset while everything else stays the same
    const removeSelectedMajor = apiDataConfig.apiData.programData
      .filter((prog) => prog.catalog === newProgram1.catalog)
      .filter(
        (prog) =>
          prog.majorName !==
          (
            screen.getAllByRole('combobox', {
              name: 'Major'
            })[1] as HTMLOptionElement
          ).value
      )
      .map((prog) => prog.majorName);
    const newMajorValue =
      removeSelectedMajor[Math.floor(Math.random() * removeSelectedMajor.length)];
    await user.selectOptions(screen.getAllByRole('combobox', { name: 'Major' })[1], newMajorValue);

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
    expectedProgramIds[1] = '';
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(8);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(8);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();
  });

  test('cannot create a program with same major (same catalog)', async () => {
    const user = userEvent.setup();

    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      }
    });

    let programIds = [''];
    let optionsValid = false;
    const programIdEventHandlerMock = vi.fn((event) => (programIds = event.detail));
    const optionsValidEventHandlerMock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', optionsValidEventHandlerMock);
    component.$on('flowProgramIdsUpdate', programIdEventHandlerMock);

    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    await setFlowNameStartingYear(user);
    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    // populate three programs
    const expectedProgramIds: string[] = [];

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create second program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedProgramIds.push('');
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // try to populate second program with the same major and ensure it fails
    const programList = apiDataConfig.apiData.programData.filter(
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
    } catch (error) {
      failed = true;
    }
    if (!failed) {
      throw new Error('able to find conc option when not supposed to');
    }
  });

  test('cannot create a program with same major (different catalog)', async () => {
    const user = userEvent.setup();

    const { component } = render(Component, {
      props: {
        startYearsData: apiDataConfig.apiData.startYears,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        programData: apiDataConfig.apiData.programData,
        flowName: '',
        flowStartYear: '',
        programIdInputs: ['']
      }
    });

    let programIds = [''];
    let optionsValid = false;
    const programIdEventHandlerMock = vi.fn((event) => (programIds = event.detail));
    const optionsValidEventHandlerMock = vi.fn((event) => (optionsValid = event.detail));
    component.$on('optionsValidUpdate', optionsValidEventHandlerMock);
    component.$on('flowProgramIdsUpdate', programIdEventHandlerMock);

    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    await setFlowNameStartingYear(user);
    expect(programIdEventHandlerMock).not.toHaveBeenCalled();
    expect(optionsValidEventHandlerMock).not.toHaveBeenCalled();
    expect(programIds).toStrictEqual(['']);
    expect(optionsValid).toBeFalsy();

    // populate three programs
    const expectedProgramIds: string[] = [];

    // populate first program
    const program1 = await setProgram(user, 0, expectedProgramIds);
    expectedProgramIds.pop();
    expectedProgramIds.push(program1.id);
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(1);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeTruthy();

    // create second program
    await user.click(
      screen.getByRole('button', {
        name: 'Add Program'
      })
    );
    expectedProgramIds.push('');
    expect(programIdEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(optionsValidEventHandlerMock).toHaveBeenCalledTimes(2);
    expect(programIds).toStrictEqual(expectedProgramIds);
    expect(optionsValid).toBeFalsy();

    // try to populate second program with the same major and ensure it fails
    const programList = apiDataConfig.apiData.programData.filter(
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
    } catch (error) {
      failed = true;
    }
    if (!failed) {
      throw new Error('able to find conc option when not supposed to');
    }
  });
});
