import ProgramSelector from './ProgramSelector.svelte';
import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { act, render, screen } from '@testing-library/svelte';
import type { Program } from '@prisma/client';

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

    let programId = 'uninitialized';
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
    const user = userEvent.setup();

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
    await user.selectOptions(
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
    const user = userEvent.setup();

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
    await user.selectOptions(
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
    component.$set({
      programIdInput: program.id
    });
    // flush all svelte state changes
    await act();

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

    // once for first program, another time for second program
    expect(mock).toHaveBeenCalledTimes(2);
    expect(programId).toBe(program.id);
  });

  test('update program in UI and expect correct response', async () => {
    const user = userEvent.setup();

    // guarantee we pick a program with more than one conc
    const programList = apiDataConfig.apiData.programData.filter(
      (prog) =>
        apiDataConfig.apiData.programData.filter(
          (prog2) => prog2.catalog === prog.catalog && prog2.majorName === prog.majorName
        ).length > 1
    );
    const program = programList[Math.floor(Math.random() * programList.length)];

    // mock program ID update
    let programId = 'uninitialized';
    const mock = vi.fn((event) => (programId = event.detail));

    const { component } = render(ProgramSelector, {
      catalogYearsData: apiDataConfig.apiData.catalogs,
      programData: apiDataConfig.apiData.programData,
      programIdInput: '',
      alreadySelectedProgramIds: []
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

    // select the given program

    // select catalog
    const selectedCatalogOption = screen.getByRole('option', {
      name: program.catalog
    }) as HTMLOptionElement;
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

    // select major option
    const selectedMajorOption = majorOptions.find(
      (opt) => opt.value === program.majorName
    ) as HTMLOptionElement;
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

    // select a concentration
    const selectedConcOption = concOptions.find(
      (opt) => opt.value === program.id
    ) as HTMLOptionElement;
    console.log(`selectedConcOption value [${selectedConcOption.value}]`);
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
    console.log(`newSelectedConcOption1 value [${newSelectedConcOption1.value}]`);
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Concentration'
      }),
      newSelectedConcOption1
    );

    const expectedProgram1 = apiDataConfig.apiData.programData.find(
      (prog) => prog.id === newSelectedConcOption1.value
    )?.id;
    expect(typeof expectedProgram1).toBe('string');
    expect(newSelectedConcOption1.selected).toBe(true);
    expect(mock).toBeCalledTimes(2);
    expect(programId).toBe(expectedProgram1);

    // then change major (but same catalog)
    let program1: Program;
    do {
      program1 =
        apiDataConfig.apiData.programData[
          Math.floor(Math.random() * apiDataConfig.apiData.programData.length)
        ];
    } while (
      // same catalog but different major
      program1.catalog !== program.catalog ||
      program1.majorName === program.majorName
    );

    console.log(`selected program1 id [${program1.id}]`);

    // update the major
    const selectedMajorOption1 = majorOptions.find(
      (opt) => opt.value === program1.majorName
    ) as HTMLOptionElement;
    console.log(`selectedMajorOption value [${selectedMajorOption1.value}]`);
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
      apiDataConfig.apiData.programData
        .filter(
          (prog) => prog.catalog === program1.catalog && prog.majorName === program1.majorName
        )
        .map((prog) => prog.concName)
        .sort()
    );
    const concOptions1 = screen.getAllByRole('option', {
      name: (accessibleName) => expectedConcOptions1.has(accessibleName)
    }) as HTMLOptionElement[];
    for (const option of concOptions1) {
      expect(option).toBeVisible();
    }
    console.log('expected', expectedConcOptions1);
    console.log(
      'actual',
      concOptions1.map((o) => o.value)
    );
    expect(concOptions1.length).toBe(expectedConcOptions1.size);

    // select a concentration
    const selectedConcOption1 = concOptions1.find(
      (opt) => opt.value === program1.id
    ) as HTMLOptionElement;
    console.log(`selectedConcOption value [${selectedConcOption1.value}]`);
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Concentration'
      }),
      selectedConcOption1
    );

    const expectedProgram2 = apiDataConfig.apiData.programData.find(
      (prog) => prog.id === selectedConcOption1.value
    )?.id;
    expect(typeof expectedProgram2).toBe('string');
    expect(selectedConcOption1.selected).toBe(true);
    expect(mock).toBeCalledTimes(4);
    expect(programId).toBe(expectedProgram2);

    // then switch catalog, major, conc

    let program2: Program;
    do {
      program2 =
        apiDataConfig.apiData.programData[
          Math.floor(Math.random() * apiDataConfig.apiData.programData.length)
        ];
    } while (
      // different catalog
      program2.catalog === program.catalog
    );

    // select catalog
    const selectedCatalogOption2 = screen.getByRole('option', {
      name: program2.catalog
    }) as HTMLOptionElement;
    console.log(`selectedCatalogOption2 value [${selectedCatalogOption2.value}]`);
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
      apiDataConfig.apiData.programData
        .filter((prog) => prog.catalog === selectedCatalogOption2.value)
        .map((prog) => prog.majorName)
        .sort()
    );
    const majorOptions2 = screen.getAllByRole('option', {
      name: (accessibleName) => expectedPrograms2.has(accessibleName)
    }) as HTMLOptionElement[];
    for (const option of majorOptions2) {
      expect(option).toBeVisible();
    }
    expect(majorOptions2.length).toBe(expectedPrograms2.size);

    // select major option
    const selectedMajorOption2 = majorOptions2.find(
      (opt) => opt.value === program2.majorName
    ) as HTMLOptionElement;
    console.log(`selectedMajorOption2 value [${selectedMajorOption2.value}]`);
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
      apiDataConfig.apiData.programData
        .filter(
          (prog) =>
            prog.catalog === selectedCatalogOption2.value &&
            prog.majorName === selectedMajorOption2.value
        )
        .map((prog) => prog.concName)
        .sort()
    );
    const concOptions2 = screen.getAllByRole('option', {
      name: (accessibleName) => expectedConcOptions2.has(accessibleName)
    }) as HTMLOptionElement[];
    for (const option of concOptions2) {
      expect(option).toBeVisible();
    }
    console.log('expected', expectedConcOptions2);
    console.log(
      'actual',
      concOptions2.map((o) => o.value)
    );
    expect(concOptions2.length).toBe(expectedConcOptions2.size);

    // select a concentration
    const selectedConcOption2 = concOptions2.find(
      (opt) => opt.value === program2.id
    ) as HTMLOptionElement;
    console.log(`selectedConcOption2 value [${selectedConcOption2.value}]`);
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
