import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { act, render, screen, getAllByRole, findByRole } from '@testing-library/svelte';
import {
  mockProgramCacheStore,
  initMockedAPIDataStores,
  mockConcOptionsCacheStore,
  mockMajorOptionsCacheStore,
  mockAvailableFlowchartCatalogsStore
} from '$test/util/storeMocks';
import type { Program } from '@prisma/client';

// see https://github.com/davipon/svelte-component-test-recipes

// load necessary API data
await apiDataConfig.init();
const apiDataProgramDataArr = Array.from(apiDataConfig.apiData.programData.values());

// this import NEEDS to be down here or else the vi.mock() call that we're using to mock
// the programCache and courseCache stores FAILS!! because vi.mock() MUST be called
// before the FlowEditor component is imported or else things break
import ProgramSelector from './ProgramSelector.svelte';

describe('FlowPropertiesSelector/ProgramSelector initial mount tests', () => {
  // need to mock out relevant stores since ProgramSelector depends on these
  // mock call is hoisted to top of file
  beforeAll(() => {
    vi.mock('$lib/client/stores/apiDataStore', () => {
      return {
        programCache: mockProgramCacheStore,
        concOptionsCache: mockConcOptionsCacheStore,
        majorOptionsCache: mockMajorOptionsCacheStore,
        availableFlowchartCatalogs: mockAvailableFlowchartCatalogsStore
      };
    });
    mockAvailableFlowchartCatalogsStore.set(apiDataConfig.apiData.catalogs);
  });

  test('default state for catalog selector correct', () => {
    render(ProgramSelector, {
      props: {
        alreadySelectedProgramIds: [],
        programIdInput: '',
        fetchingData: false
      }
    });

    const catalogCombobox = screen.getByRole('combobox', {
      name: 'Catalog'
    });

    // ensure visible with correct values
    expect(catalogCombobox).toBeVisible();
    expect(catalogCombobox).toBeEnabled();
    expect(catalogCombobox).toHaveValue('');
    expect(catalogCombobox).toHaveTextContent('Choose ...');

    // make sure we have selectable options
    expect(
      screen.getAllByRole('option', {
        name: (_, element) => element.parentElement?.getAttribute('name') === 'programCatalogYear'
      })
    ).toHaveLength(apiDataConfig.apiData.catalogs.length + 1);
    // +1 is for the "Choose ..." disabled option
  });

  test('default state for major selector correct', () => {
    render(ProgramSelector, {
      props: {
        alreadySelectedProgramIds: [],
        programIdInput: '',
        fetchingData: false
      }
    });

    const majorCombobox = screen.getByRole('combobox', {
      name: 'Major'
    });

    // ensure visible with correct values
    expect(majorCombobox).toBeVisible();
    expect(majorCombobox).toBeEnabled();
    expect(majorCombobox).toHaveValue('');
    expect(majorCombobox).toHaveTextContent('Choose ...');

    // no selectable options visible at mount time
    expect(
      screen.getAllByRole('option', {
        name: (_, element) => element.parentElement?.getAttribute('name') === 'programName'
      })
    ).toHaveLength(1);
  });

  test('default state for concentration selector correct', () => {
    render(ProgramSelector, {
      props: {
        alreadySelectedProgramIds: [],
        programIdInput: '',
        fetchingData: false
      }
    });

    const concentrationCombobox = screen.getByRole('combobox', {
      name: 'Concentration'
    });

    // ensure visible with correct values
    expect(concentrationCombobox).toBeVisible();
    expect(concentrationCombobox).toBeEnabled();
    expect(concentrationCombobox).toHaveValue('');
    expect(concentrationCombobox).toHaveTextContent('Choose ...');

    // no selectable options visible at mount time
    expect(
      screen.getAllByRole('option', {
        name: (_, element) => element.parentElement?.getAttribute('name') === 'programAddlName'
      })
    ).toHaveLength(1);
  });

  test('default output of programId correct', () => {
    // component doesn't emit an output programId
    // unless the inputs are vaid

    const { component } = render(ProgramSelector, {
      props: {
        alreadySelectedProgramIds: [],
        programIdInput: '',
        fetchingData: false
      }
    });

    let programId = 'uninitialized';
    const mock = vi.fn((event: CustomEvent<string>) => (programId = event.detail));
    component.$on('programIdUpdate', mock);

    // want to make sure this was not updated
    expect(mock).not.toHaveBeenCalled();
    expect(programId).toBe('uninitialized');
  });
});

describe('FlowPropertiesSelector/ProgramSelector customization props work', () => {
  test('changing defaultOptionText customization prop works', () => {
    // default already tested, so try switching
    render(ProgramSelector, {
      alreadySelectedProgramIds: [],
      programIdInput: '',
      fetchingData: false,
      defaultOptionText: 'test'
    });

    expect(
      screen.getByRole('combobox', {
        name: 'Catalog'
      })
    ).toHaveTextContent('test');
    expect(
      screen.getByRole('combobox', {
        name: 'Major'
      })
    ).toHaveTextContent('test');
    expect(
      screen.getByRole('combobox', {
        name: 'Concentration'
      })
    ).toHaveTextContent('test');
  });

  test('changing disableSelectingDefaultOption customization prop works', async () => {
    // test default
    const view = render(ProgramSelector, {
      props: {
        alreadySelectedProgramIds: [],
        programIdInput: '',
        fetchingData: false
      }
    });

    // disabled
    for (const elem of screen.getAllByRole('option', {
      name: 'Choose ...'
    })) {
      expect(elem).toBeDisabled();
    }

    // enabled
    await view.rerender({
      alreadySelectedProgramIds: [],
      programIdInput: '',
      disableSelectingDefaultOption: false,
      fetchingData: false
    });
    for (const elem of screen.getAllByRole('option', {
      name: 'Choose ...'
    })) {
      expect(elem).toBeEnabled();
    }
  });

  test('changing fetchingData customization prop works', () => {
    // default tested, so try switching
    render(ProgramSelector, {
      alreadySelectedProgramIds: [],
      programIdInput: '',
      fetchingData: true
    });

    // all fields should be disabled
    expect(
      screen.getByRole('combobox', {
        name: 'Catalog'
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('combobox', {
        name: 'Major'
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('combobox', {
        name: 'Concentration'
      })
    ).toBeDisabled();
  });
});

describe('FlowPropertiesSelector/ProgramSelector program update functionality works', () => {
  // dont need to remock bc hoisted, but do need to re-init relevant stores
  beforeAll(initMockedAPIDataStores);

  // https://cathalmacdonnacha.com/how-to-test-a-select-element-with-react-testing-library
  test('select a random program and expect programIdUpdate', async () => {
    const user = userEvent.setup();

    // mock program ID update
    let programId = 'uninitialized';
    const mock = vi.fn((event: CustomEvent<string>) => (programId = event.detail));

    const { component } = render(ProgramSelector, {
      alreadySelectedProgramIds: [],
      programIdInput: '',
      fetchingData: false
    });

    component.$on('programIdUpdate', mock);

    // select random catalog

    const selectedCatalogOption = screen.getByRole<HTMLOptionElement>('option', {
      name: apiDataConfig.apiData.catalogs[
        Math.floor(Math.random() * apiDataConfig.apiData.catalogs.length)
      ]
    });
    console.log(`selectedCatalogOption value [${selectedCatalogOption.value}]`);
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Catalog'
      }),
      selectedCatalogOption
    );
    expect(selectedCatalogOption.selected).toBe(true);
    expect(mock).not.toBeCalled();
    expect(programId).toBe('uninitialized');

    // make sure all the major options are displayed
    const expectedPrograms = new Set(
      apiDataProgramDataArr
        .filter((prog) => prog.catalog === selectedCatalogOption.value)
        .map((prog) => prog.majorName)
    );
    const majorOptions = screen.getAllByRole<HTMLOptionElement>('option', {
      name: (accessibleName) => expectedPrograms.has(accessibleName)
    });
    for (const option of majorOptions) {
      expect(option).toBeVisible();
    }
    expect(majorOptions.map((elem) => elem.text).sort()).toStrictEqual(
      [...expectedPrograms].sort()
    );

    // select random major option
    const selectedMajorOption = majorOptions[Math.floor(Math.random() * majorOptions.length)];
    console.log(`selectedMajorOption value [${selectedMajorOption.value}]`);
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Major'
      }),
      selectedMajorOption
    );
    expect(selectedMajorOption.selected).toBe(true);
    expect(mock).not.toBeCalled();
    expect(programId).toBe('uninitialized');

    // make sure all conc options are displayed
    const expectedConcOptions = new Set(
      apiDataProgramDataArr
        .filter(
          (prog) =>
            prog.catalog === selectedCatalogOption.value &&
            prog.majorName === selectedMajorOption.value
        )
        .map((prog) => prog.concName)
    );
    // need to find elements from Concentration selector bc there are
    // majors that have the same name as some concentrations,
    // which ends up being counted twice (and failing the test)
    const concSelectorElem = screen.getByRole('combobox', {
      name: 'Concentration'
    });
    const concOptions = getAllByRole<HTMLOptionElement>(concSelectorElem, 'option', {
      name: (accessibleName) => expectedConcOptions.has(accessibleName)
    });
    for (const option of concOptions) {
      expect(option).toBeVisible();
    }
    expect(concOptions.map((elem) => elem.text).sort()).toStrictEqual(
      [...expectedConcOptions].sort()
    );

    // select a random concentration
    const selectedConcOption = concOptions[Math.floor(Math.random() * concOptions.length)];
    console.log(`selectedConcOption value [${selectedConcOption.value}]`);
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Concentration'
      }),
      selectedConcOption
    );

    const expectedProgram = apiDataProgramDataArr.find(
      (prog) => prog.id === selectedConcOption.value
    )?.id;
    expect(typeof expectedProgram).toBe('string');
    expect(selectedConcOption.selected).toBe(true);
    expect(mock).toBeCalledTimes(1);
    expect(programId).toBe(expectedProgram);
  });

  // https://testing-library.com/docs/dom-testing-library/api-async#findby-queries
  // need to use findBy* here bc state change is async
  test('set input on mount and expect correct response', async () => {
    const program = apiDataProgramDataArr[Math.floor(Math.random() * apiDataProgramDataArr.length)];
    console.log(`selected program id [${program.id}]`);

    // mock program ID update
    let programId = 'uninitialized';
    const mock = vi.fn((event: CustomEvent<string>) => (programId = event.detail));

    const { component } = render(ProgramSelector, {
      programIdInput: program.id,
      alreadySelectedProgramIds: [],
      fetchingData: false
    });

    component.$on('programIdUpdate', mock);

    // check correct catalog
    expect(
      (
        await screen.findByRole<HTMLOptionElement>('option', {
          name: program.catalog
        })
      ).selected
    ).toBe(true);

    // check correct major
    expect(
      (
        await screen.findByRole<HTMLOptionElement>('option', {
          name: program.majorName
        })
      ).selected
    ).toBe(true);

    // check correct conc
    if (!program.concName) {
      throw new Error('Selected program in ProgramSelector has a concName of null');
    }
    // need to find elements from Concentration selector bc there are
    // majors that have the same name as some concentrations,
    // which ends up being counted twice (and failing the test)
    const concSelectorElem = screen.getByRole('combobox', {
      name: 'Concentration'
    });
    expect(
      (
        await findByRole<HTMLOptionElement>(concSelectorElem, 'option', {
          name: program.concName
        })
      ).selected
    ).toBe(true);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(programId).toBe(program.id);
  });

  test('set input after mount and expect correct response', async () => {
    const user = userEvent.setup();

    const program = apiDataProgramDataArr[Math.floor(Math.random() * apiDataProgramDataArr.length)];
    console.log(`selected program id [${program.id}]`);

    // mock program ID update
    let programId = 'uninitialized';
    const mock = vi.fn((event: CustomEvent<string>) => (programId = event.detail));

    const { component } = render(ProgramSelector, {
      alreadySelectedProgramIds: [],
      programIdInput: '',
      fetchingData: false
    });

    component.$on('programIdUpdate', mock);

    // expect nothing at first
    const initSelectedOptions = screen
      .getAllByRole('option', {
        name: (_, element) => (element as HTMLOptionElement).selected
      })
      .map((elem) => elem.textContent);
    expect(initSelectedOptions.length).toBe(3);
    expect(initSelectedOptions).toEqual(['Choose ...', 'Choose ...', 'Choose ...']);
    expect(mock).not.toHaveBeenCalled();
    expect(programId).toBe('uninitialized');

    // select a random program (same code as test above)

    // select random catalog
    const selectedCatalogOption = screen.getByRole<HTMLOptionElement>('option', {
      name: apiDataConfig.apiData.catalogs[
        Math.floor(Math.random() * apiDataConfig.apiData.catalogs.length)
      ]
    });
    console.log(`selectedCatalogOption value [${selectedCatalogOption.value}]`);
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Catalog'
      }),
      selectedCatalogOption
    );
    expect(selectedCatalogOption.selected).toBe(true);
    expect(mock).not.toBeCalled();

    // make sure all the major options are displayed
    const expectedPrograms = new Set(
      apiDataProgramDataArr
        .filter((prog) => prog.catalog === selectedCatalogOption.value)
        .map((prog) => prog.majorName)
    );
    const majorOptions = screen.getAllByRole<HTMLOptionElement>('option', {
      name: (accessibleName) => expectedPrograms.has(accessibleName)
    });
    for (const option of majorOptions) {
      expect(option).toBeVisible();
    }
    expect(majorOptions.map((elem) => elem.text).sort()).toStrictEqual(
      [...expectedPrograms].sort()
    );

    // select random major option
    const selectedMajorOption = majorOptions[Math.floor(Math.random() * majorOptions.length)];
    console.log(`selectedMajorOption value [${selectedMajorOption.value}]`);
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Major'
      }),
      selectedMajorOption
    );
    expect(selectedMajorOption.selected).toBe(true);
    expect(mock).not.toBeCalled();

    // make sure all conc options are displayed
    const expectedConcOptions = new Set(
      apiDataProgramDataArr
        .filter(
          (prog) =>
            prog.catalog === selectedCatalogOption.value &&
            prog.majorName === selectedMajorOption.value
        )
        .map((prog) => prog.concName)
    );
    // need to find elements from Concentration selector bc there are
    // majors that have the same name as some concentrations,
    // which ends up being counted twice (and failing the test)
    const concSelectorElem = screen.getByRole('combobox', {
      name: 'Concentration'
    });
    const concOptions = getAllByRole<HTMLOptionElement>(concSelectorElem, 'option', {
      name: (accessibleName) => expectedConcOptions.has(accessibleName)
    });
    for (const option of concOptions) {
      expect(option).toBeVisible();
    }
    console.log('expected', expectedConcOptions);
    console.log(
      'actual',
      concOptions.map((o) => o.value)
    );
    expect(concOptions.map((elem) => elem.text).sort()).toStrictEqual(
      [...expectedConcOptions].sort()
    );

    // select a random concentration
    const selectedConcOption = concOptions[Math.floor(Math.random() * concOptions.length)];
    console.log(`selectedConcOption value [${selectedConcOption.value}]`);
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Concentration'
      }),
      selectedConcOption
    );

    const expectedProgram = apiDataProgramDataArr.find(
      (prog) => prog.id === selectedConcOption.value
    )?.id;
    expect(typeof expectedProgram).toBe('string');
    expect(selectedConcOption.selected).toBe(true);
    expect(mock).toBeCalledTimes(1);
    expect(programId).toBe(expectedProgram);

    // then do an update
    component.$set({
      programIdInput: program.id
    });
    // flush all svelte state changes
    await act();

    // then verify that the UI was updated
    // check correct catalog
    expect(
      (
        await screen.findByRole<HTMLOptionElement>('option', {
          name: program.catalog
        })
      ).selected
    ).toBe(true);

    // check correct major
    expect(
      (
        await screen.findByRole<HTMLOptionElement>('option', {
          name: program.majorName
        })
      ).selected
    ).toBe(true);

    // check correct conc
    if (!program.concName) {
      throw new Error('Selected program in ProgramSelector has a concName of null');
    }
    // need to find elements from Concentration selector bc there are
    // majors that have the same name as some concentrations,
    // which ends up being counted twice (and failing the test)
    expect(
      (
        await findByRole<HTMLOptionElement>(concSelectorElem, 'option', {
          name: program.concName
        })
      ).selected
    ).toBe(true);

    // once for first program, another time for second program
    expect(mock).toHaveBeenCalledTimes(2);
    expect(programId).toBe(program.id);
  });

  test('update program in UI and expect correct response', async () => {
    const user = userEvent.setup();

    // guarantee we pick a program with more than one conc
    const programList = apiDataProgramDataArr.filter(
      (prog) =>
        apiDataProgramDataArr.filter(
          (prog2) => prog2.catalog === prog.catalog && prog2.majorName === prog.majorName
        ).length > 1
    );
    const program = programList[Math.floor(Math.random() * programList.length)];

    // mock program ID update
    let programId = 'uninitialized';
    const mock = vi.fn((event: CustomEvent<string>) => (programId = event.detail));

    const { component } = render(ProgramSelector, {
      programIdInput: '',
      alreadySelectedProgramIds: [],
      fetchingData: false
    });

    component.$on('programIdUpdate', mock);

    // expect nothing at first
    const initSelectedOptions = screen
      .getAllByRole('option', {
        name: (_, element) => (element as HTMLOptionElement).selected
      })
      .map((elem) => elem.textContent);
    expect(initSelectedOptions.length).toBe(3);
    expect(initSelectedOptions).toEqual(['Choose ...', 'Choose ...', 'Choose ...']);
    expect(mock).not.toHaveBeenCalled();
    expect(programId).toBe('uninitialized');

    // select the given program

    // select catalog
    const selectedCatalogOption = screen.getByRole<HTMLOptionElement>('option', {
      name: program.catalog
    });
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Catalog'
      }),
      selectedCatalogOption
    );
    expect(selectedCatalogOption.selected).toBe(true);
    expect(mock).not.toBeCalled();

    // make sure all the major options are displayed
    const expectedPrograms = new Set(
      apiDataProgramDataArr
        .filter((prog) => prog.catalog === selectedCatalogOption.value)
        .map((prog) => prog.majorName)
    );
    const majorOptions = screen.getAllByRole<HTMLOptionElement>('option', {
      name: (accessibleName) => expectedPrograms.has(accessibleName)
    });
    for (const option of majorOptions) {
      expect(option).toBeVisible();
    }
    expect(majorOptions.map((elem) => elem.text).sort()).toStrictEqual(
      [...expectedPrograms].sort()
    );

    // select major option
    const selectedMajorOption = majorOptions.find((opt) => opt.value === program.majorName);
    if (!selectedMajorOption) {
      throw new Error(`selectedMajorOption ${program.majorName} not found`);
    }
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Major'
      }),
      selectedMajorOption
    );
    expect(selectedMajorOption.selected).toBe(true);
    expect(mock).not.toBeCalled();

    // make sure all conc options are displayed
    const expectedConcOptions = new Set(
      apiDataProgramDataArr
        .filter(
          (prog) =>
            prog.catalog === selectedCatalogOption.value &&
            prog.majorName === selectedMajorOption.value
        )
        .map((prog) => prog.concName)
    );

    // need to find elements from Concentration selector bc there are
    // majors that have the same name as some concentrations,
    // which ends up being counted twice (and failing the test)
    const concSelectorElem = screen.getByRole('combobox', {
      name: 'Concentration'
    });
    const concOptions = getAllByRole<HTMLOptionElement>(concSelectorElem, 'option', {
      name: (accessibleName) => expectedConcOptions.has(accessibleName)
    });
    for (const option of concOptions) {
      expect(option).toBeVisible();
    }

    expect(concOptions.map((elem) => elem.text).sort()).toStrictEqual(
      [...expectedConcOptions].sort()
    );

    // select a concentration
    const selectedConcOption = concOptions.find((opt) => opt.value === program.id);
    if (!selectedConcOption) {
      throw new Error(`selectedConcOption ${program.id} not found`);
    }
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Concentration'
      }),
      selectedConcOption
    );

    expect(selectedConcOption.selected).toBe(true);
    expect(mock).toBeCalledTimes(1);
    expect(programId).toBe(program.id);

    // then try variety of manual updates

    // just change to a different conc
    let newSelectedConcOption1 = selectedConcOption;
    while (newSelectedConcOption1.value === selectedConcOption.value) {
      newSelectedConcOption1 = concOptions[Math.floor(Math.random() * concOptions.length)];
    }
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Concentration'
      }),
      newSelectedConcOption1
    );

    const expectedProgram1 = apiDataProgramDataArr.find(
      (prog) => prog.id === newSelectedConcOption1.value
    )?.id;
    expect(typeof expectedProgram1).toBe('string');
    expect(newSelectedConcOption1.selected).toBe(true);
    expect(mock).toBeCalledTimes(2);
    expect(programId).toBe(expectedProgram1);

    // then change major (but same catalog)
    let program1: Program;
    do {
      program1 = apiDataProgramDataArr[Math.floor(Math.random() * apiDataProgramDataArr.length)];
    } while (
      // same catalog but different major
      program1.catalog !== program.catalog ||
      program1.majorName === program.majorName
    );

    // update the major
    const selectedMajorOption1 = majorOptions.find((opt) => opt.value === program1.majorName);
    if (!selectedMajorOption1) {
      throw new Error(`selectedMajorOption1 ${program1.majorName} not found`);
    }
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Major'
      }),
      selectedMajorOption1
    );

    // expect major to be selected AND conc option to be reset
    expect(selectedMajorOption1.selected).toBe(true);
    expect(
      screen.getByRole('combobox', {
        name: 'Concentration'
      })
    ).toBeVisible();
    expect(
      screen.getByRole('combobox', {
        name: 'Concentration'
      })
    ).toHaveValue('');
    expect(
      screen.getByRole('combobox', {
        name: 'Concentration'
      })
    ).toHaveTextContent('Choose ...');
    expect(mock).toBeCalledTimes(3);
    expect(programId).toBe('');

    // then select concentration and expect full update

    // make sure all conc options are displayed
    const expectedConcOptions1 = new Set(
      apiDataProgramDataArr
        .filter(
          (prog) => prog.catalog === program1.catalog && prog.majorName === program1.majorName
        )
        .map((prog) => prog.concName)
    );
    const concOptions1 = getAllByRole<HTMLOptionElement>(concSelectorElem, 'option', {
      name: (accessibleName) => expectedConcOptions1.has(accessibleName)
    });
    for (const option of concOptions1) {
      expect(option).toBeVisible();
    }
    expect(concOptions1.map((elem) => elem.text).sort()).toStrictEqual(
      [...expectedConcOptions1].sort()
    );

    // select a concentration
    const selectedConcOption1 = concOptions1.find((opt) => opt.value === program1.id);
    if (!selectedConcOption1) {
      throw new Error(`selectedConcOption1 ${program1.id} not found`);
    }
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Concentration'
      }),
      selectedConcOption1
    );

    const expectedProgram2 = apiDataProgramDataArr.find(
      (prog) => prog.id === selectedConcOption1.value
    )?.id;
    expect(typeof expectedProgram2).toBe('string');
    expect(selectedConcOption1.selected).toBe(true);
    expect(mock).toBeCalledTimes(4);
    expect(programId).toBe(expectedProgram2);

    // then switch catalog, major, conc

    let program2: Program;
    do {
      program2 = apiDataProgramDataArr[Math.floor(Math.random() * apiDataProgramDataArr.length)];
    } while (
      // different catalog
      program2.catalog === program.catalog
    );

    // select catalog
    const selectedCatalogOption2 = screen.getByRole<HTMLOptionElement>('option', {
      name: program2.catalog
    });
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Catalog'
      }),
      selectedCatalogOption2
    );
    expect(selectedCatalogOption2.selected).toBe(true);
    expect(mock).toBeCalledTimes(5);

    // make sure all the major options are displayed
    const expectedPrograms2 = new Set(
      apiDataProgramDataArr
        .filter((prog) => prog.catalog === selectedCatalogOption2.value)
        .map((prog) => prog.majorName)
    );
    const majorOptions2 = screen.getAllByRole<HTMLOptionElement>('option', {
      name: (accessibleName) => expectedPrograms2.has(accessibleName)
    });
    for (const option of majorOptions2) {
      expect(option).toBeVisible();
    }
    expect(majorOptions2.map((elem) => elem.text).sort()).toStrictEqual(
      [...expectedPrograms2].sort()
    );

    // select major option
    const selectedMajorOption2 = majorOptions2.find((opt) => opt.value === program2.majorName);
    if (!selectedMajorOption2) {
      throw new Error(`selectedMajorOption2 ${program2.majorName} not found`);
    }
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Major'
      }),
      selectedMajorOption2
    );
    expect(selectedMajorOption2.selected).toBe(true);
    expect(mock).toBeCalledTimes(5);

    // make sure all conc options are displayed
    const expectedConcOptions2 = new Set(
      apiDataProgramDataArr
        .filter(
          (prog) =>
            prog.catalog === selectedCatalogOption2.value &&
            prog.majorName === selectedMajorOption2.value
        )
        .map((prog) => prog.concName)
    );
    const concOptions2 = getAllByRole<HTMLOptionElement>(concSelectorElem, 'option', {
      name: (accessibleName) => expectedConcOptions2.has(accessibleName)
    });
    for (const option of concOptions2) {
      expect(option).toBeVisible();
    }
    expect(concOptions2.map((elem) => elem.text).sort()).toStrictEqual(
      [...expectedConcOptions2].sort()
    );

    // select a concentration
    const selectedConcOption2 = concOptions2.find((opt) => opt.value === program2.id);
    if (!selectedConcOption2) {
      throw new Error(`selectedConcOption2 ${program2.id} not found`);
    }
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Concentration'
      }),
      selectedConcOption2
    );

    expect(selectedConcOption2.selected).toBe(true);
    expect(mock).toBeCalledTimes(6);
    expect(programId).toBe(program2.id);
  });
});
