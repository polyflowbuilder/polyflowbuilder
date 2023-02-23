import ProgramSelector from './ProgramSelector.svelte';
import * as apiDataConfig from '$lib/config/apiDataConfig.server';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';

// see https://github.com/davipon/svelte-component-test-recipes

// load necessary API data
await apiDataConfig.init();

describe('FlowPropertiesSelector/ProgramSelector initial mount tests', () => {
  test('default state for catalog selector correct', () => {
    render(ProgramSelector, {
      props: {
        programData: apiDataConfig.apiData.programData,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        alreadySelectedProgramIds: [],
        programIdInput: ''
      }
    });

    // ensure visible with correct values
    expect(
      screen.getByRole('combobox', {
        name: 'Catalog'
      })
    ).toBeVisible();
    expect(
      screen.getByRole('combobox', {
        name: 'Catalog'
      })
    ).toHaveValue('');
    expect(
      screen.getByRole('combobox', {
        name: 'Catalog'
      })
    ).toHaveTextContent('Choose ...');

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
        programData: apiDataConfig.apiData.programData,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        alreadySelectedProgramIds: [],
        programIdInput: ''
      }
    });

    // ensure visible with correct values
    expect(
      screen.getByRole('combobox', {
        name: 'Major'
      })
    ).toBeVisible();
    expect(
      screen.getByRole('combobox', {
        name: 'Major'
      })
    ).toHaveValue('');
    expect(
      screen.getByRole('combobox', {
        name: 'Major'
      })
    ).toHaveTextContent('Choose ...');

    // no selectable options visible at mount time
    expect(
      screen.getAllByRole('option', {
        name: (_, element) => element.parentElement?.getAttribute('name') === 'programName'
      })
    ).toHaveLength(1);
  });

  test('default state for major selector correct', () => {
    render(ProgramSelector, {
      props: {
        programData: apiDataConfig.apiData.programData,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        alreadySelectedProgramIds: [],
        programIdInput: ''
      }
    });

    // ensure visible with correct values
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
        programData: apiDataConfig.apiData.programData,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        alreadySelectedProgramIds: [],
        programIdInput: ''
      }
    });

    let programId: string | null = 'uninitialized';
    const mock = vi.fn((event) => (programId = event.detail));
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
      catalogYearsData: [],
      programData: [],
      alreadySelectedProgramIds: [],
      programIdInput: '',
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

  test('changing disableSelectingDefaultOption customization prop works', () => {
    // test default
    const view = render(ProgramSelector, {
      props: {
        programData: apiDataConfig.apiData.programData,
        catalogYearsData: apiDataConfig.apiData.catalogs,
        alreadySelectedProgramIds: [],
        programIdInput: ''
      }
    });

    // disabled
    for (const elem of screen.getAllByRole('option', {
      name: 'Choose ...'
    })) {
      expect(elem).toBeDisabled();
    }

    // enabled
    view.rerender({
      catalogYearsData: [],
      programData: [],
      alreadySelectedProgramIds: [],
      programIdInput: '',
      disableSelectingDefaultOption: false
    });
    for (const elem of screen.getAllByRole('option', {
      name: 'Choose ...'
    })) {
      expect(elem).toBeEnabled();
    }
  });
});

describe('FlowPropertiesSelector/ProgramSelector program update functionality works', () => {
  // https://cathalmacdonnacha.com/how-to-test-a-select-element-with-react-testing-library
  test('select a random program and expect programIdUpdate', async () => {
    userEvent.setup();

    // mock program ID update
    let programId = 'uninitialized';
    const mock = vi.fn((event) => (programId = event.detail));

    const { component } = render(ProgramSelector, {
      catalogYearsData: apiDataConfig.apiData.catalogs,
      programData: apiDataConfig.apiData.programData,
      alreadySelectedProgramIds: [],
      programIdInput: ''
    });

    component.$on('programIdUpdate', mock);

    // select random catalog

    const selectedCatalogOption = screen.getByRole('option', {
      name: apiDataConfig.apiData.catalogs[
        Math.floor(Math.random() * apiDataConfig.apiData.catalogs.length)
      ]
    }) as HTMLOptionElement;
    console.log(`selectedCatalogOption value [${selectedCatalogOption.value}]`);
    await userEvent.selectOptions(
      screen.getByRole('combobox', {
        name: 'Catalog'
      }),
      selectedCatalogOption
    );
    expect(selectedCatalogOption.selected).toBe(true);
    expect(mock).not.toBeCalled();

    // make sure all the major options are displayed
    const expectedPrograms = new Set(
      apiDataConfig.apiData.programData
        .filter((prog) => prog.catalog === selectedCatalogOption.value)
        .map((prog) => prog.majorName)
        .sort()
    );
    const majorOptions = screen.getAllByRole('option', {
      name: (accessibleName) => expectedPrograms.has(accessibleName)
    }) as HTMLOptionElement[];
    for (const option of majorOptions) {
      expect(option).toBeVisible();
    }
    expect(majorOptions.length).toBe(expectedPrograms.size);

    // select random major option
    const selectedMajorOption = majorOptions[Math.floor(Math.random() * majorOptions.length)];
    console.log(`selectedMajorOption value [${selectedMajorOption.value}]`);
    await userEvent.selectOptions(
      screen.getByRole('combobox', {
        name: 'Major'
      }),
      selectedMajorOption
    );
    expect(selectedMajorOption.selected).toBe(true);
    expect(mock).not.toBeCalled();

    // make sure all conc options are displayed
    const expectedConcOptions = new Set(
      apiDataConfig.apiData.programData
        .filter(
          (prog) =>
            prog.catalog === selectedCatalogOption.value &&
            prog.majorName === selectedMajorOption.value
        )
        .map((prog) => prog.concName)
        .sort()
    );
    const concOptions = screen.getAllByRole('option', {
      name: (accessibleName) => expectedConcOptions.has(accessibleName)
    }) as HTMLOptionElement[];
    for (const option of concOptions) {
      expect(option).toBeVisible();
    }
    expect(concOptions.length).toBe(expectedConcOptions.size);

    // select a random concentration
    const selectedConcOption = concOptions[Math.floor(Math.random() * concOptions.length)];
    console.log(`selectedConcOption value [${selectedConcOption.value}]`);
    await userEvent.selectOptions(
      screen.getByRole('combobox', {
        name: 'Concentration'
      }),
      selectedConcOption
    );

    const expectedProgram = apiDataConfig.apiData.programData.find(
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
    userEvent.setup();

    const program =
      apiDataConfig.apiData.programData[
        Math.floor(Math.random() * apiDataConfig.apiData.programData.length)
      ];
    console.log(`selected program id [${program.id}]`);

    // mock program ID update
    let programId = 'uninitialized';
    const mock = vi.fn((event) => (programId = event.detail));

    const { component } = render(ProgramSelector, {
      catalogYearsData: apiDataConfig.apiData.catalogs,
      programData: apiDataConfig.apiData.programData,
      programIdInput: program.id,
      alreadySelectedProgramIds: []
    });

    component.$on('programIdUpdate', mock);

    // check correct catalog
    expect(
      (
        (await screen.findByRole('option', {
          name: program.catalog
        })) as HTMLOptionElement
      ).selected
    ).toBe(true);

    // check correct major
    expect(
      (
        (await screen.findByRole('option', {
          name: program.majorName
        })) as HTMLOptionElement
      ).selected
    ).toBe(true);

    // check correct conc
    if (!program.concName) {
      throw new Error('Selected program in ProgramSelector has a concName of null');
    }
    expect(
      (
        (await screen.findByRole('option', {
          name: program.concName
        })) as HTMLOptionElement
      ).selected
    ).toBe(true);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(programId).toBe(program.id);
  });

  test('set input after mount and expect correct response', async () => {
    const program =
      apiDataConfig.apiData.programData[
        Math.floor(Math.random() * apiDataConfig.apiData.programData.length)
      ];
    console.log(`selected program id [${program.id}]`);

    // mock program ID update
    let programId = 'uninitialized';
    const mock = vi.fn((event) => (programId = event.detail));

    const { component } = render(ProgramSelector, {
      catalogYearsData: apiDataConfig.apiData.catalogs,
      programData: apiDataConfig.apiData.programData,
      alreadySelectedProgramIds: [],
      programIdInput: ''
    });

    component.$on('programIdUpdate', mock);

    // expect nothing at first
    const initSelectedOptions = screen
      .getAllByRole('option', {
        name: (_, element) => (element as HTMLOptionElement).selected === true
      })
      .map((elem) => elem.textContent);
    expect(initSelectedOptions.length).toBe(3);
    expect(initSelectedOptions).toEqual(['Choose ...', 'Choose ...', 'Choose ...']);
    expect(mock).not.toHaveBeenCalled();
    expect(programId).toBe('uninitialized');

    // select a random program (same code as test above)

    // select random catalog
    const selectedCatalogOption = screen.getByRole('option', {
      name: apiDataConfig.apiData.catalogs[
        Math.floor(Math.random() * apiDataConfig.apiData.catalogs.length)
      ]
    }) as HTMLOptionElement;
    console.log(`selectedCatalogOption value [${selectedCatalogOption.value}]`);
    await userEvent.selectOptions(
      screen.getByRole('combobox', {
        name: 'Catalog'
      }),
      selectedCatalogOption
    );
    expect(selectedCatalogOption.selected).toBe(true);
    expect(mock).not.toBeCalled();

    // make sure all the major options are displayed
    const expectedPrograms = new Set(
      apiDataConfig.apiData.programData
        .filter((prog) => prog.catalog === selectedCatalogOption.value)
        .map((prog) => prog.majorName)
        .sort()
    );
    const majorOptions = screen.getAllByRole('option', {
      name: (accessibleName) => expectedPrograms.has(accessibleName)
    }) as HTMLOptionElement[];
    for (const option of majorOptions) {
      expect(option).toBeVisible();
    }
    expect(majorOptions.length).toBe(expectedPrograms.size);

    // select random major option
    const selectedMajorOption = majorOptions[Math.floor(Math.random() * majorOptions.length)];
    console.log(`selectedMajorOption value [${selectedMajorOption.value}]`);
    await userEvent.selectOptions(
      screen.getByRole('combobox', {
        name: 'Major'
      }),
      selectedMajorOption
    );
    expect(selectedMajorOption.selected).toBe(true);
    expect(mock).not.toBeCalled();

    // make sure all conc options are displayed
    const expectedConcOptions = new Set(
      apiDataConfig.apiData.programData
        .filter(
          (prog) =>
            prog.catalog === selectedCatalogOption.value &&
            prog.majorName === selectedMajorOption.value
        )
        .map((prog) => prog.concName)
        .sort()
    );
    const concOptions = screen.getAllByRole('option', {
      name: (accessibleName) => expectedConcOptions.has(accessibleName)
    }) as HTMLOptionElement[];
    for (const option of concOptions) {
      expect(option).toBeVisible();
    }
    console.log('expected', expectedConcOptions);
    console.log(
      'actual',
      concOptions.map((o) => o.value)
    );
    expect(concOptions.length).toBe(expectedConcOptions.size);

    // select a random concentration
    const selectedConcOption = concOptions[Math.floor(Math.random() * concOptions.length)];
    console.log(`selectedConcOption value [${selectedConcOption.value}]`);
    await userEvent.selectOptions(
      screen.getByRole('combobox', {
        name: 'Concentration'
      }),
      selectedConcOption
    );

    const expectedProgram = apiDataConfig.apiData.programData.find(
      (prog) => prog.id === selectedConcOption.value
    )?.id;
    expect(typeof expectedProgram).toBe('string');
    expect(selectedConcOption.selected).toBe(true);
    expect(mock).toBeCalledTimes(1);
    expect(programId).toBe(expectedProgram);

    // then do an update
    // even tho editor says this isn't async, MARK AS ASYNC SO WE HAVE THE
    // UPDATES DONE ASYNCHRONOUSLY!! fixes race conditions
    await component.$set({
      programIdInput: program.id
    });

    // then verify that the UI was updated
    // check correct catalog
    expect(
      (
        (await screen.findByRole('option', {
          name: program.catalog
        })) as HTMLOptionElement
      ).selected
    ).toBe(true);

    // check correct major
    expect(
      (
        (await screen.findByRole('option', {
          name: program.majorName
        })) as HTMLOptionElement
      ).selected
    ).toBe(true);

    // check correct conc
    if (!program.concName) {
      throw new Error('Selected program in ProgramSelector has a concName of null');
    }
    expect(
      (
        (await screen.findByRole('option', {
          name: program.concName
        })) as HTMLOptionElement
      ).selected
    ).toBe(true);

    // have a single "invalid" marker of "" during transition of programs
    // due to necessary ticks that we run in ProgramSelector
    expect(mock).toHaveBeenCalledTimes(3);
    expect(programId).toBe(program.id);
  });
});
