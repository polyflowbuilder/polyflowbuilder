import { programCache } from '$lib/client/stores/apiDataStore';
import { userFlowcharts } from '$lib/client/stores/userDataStore';
import { derived, writable } from 'svelte/store';
import { COLOR_PICKER_UI_DEFAULT_COLOR } from '$lib/client/config/uiConfig';
import type { FlowListUIData } from '$lib/types';

// required data for flow list UI
export const flowListUIData = derived([userFlowcharts, programCache], ([userFlows, progCache]) => {
  // TODO: see POLY-511
  const flowListData: FlowListUIData[] = !progCache.size
    ? []
    : userFlows.map((flow) => {
        // get the display info for each program
        const flowchartProgramsArr = flow.programId.map((flowProgramId) => {
          // this should NEVER returned undefined - if so we have a bug!
          const prog = progCache.get(flowProgramId);
          if (!prog) {
            throw new Error(`program ${flowProgramId} missing from programCache`);
          }
          return prog;
        });

        return {
          id: flow.id,
          name: flow.name,
          startYear: flow.startYear,
          displayInfo: flowchartProgramsArr.map((prog) => {
            return {
              catalog: prog.catalog,
              majorName: prog.majorName,
              concName: prog.concName
            };
          }),
          notes: flow.notes,
          published: flow.publishedId !== null,
          imported: flow.importedId !== null
        };
      });
  return flowListData;
});

export const selectedFlowIndex = writable<number>(-1);

export const viewingCreditBin = writable(false);

export const selectedCourses = writable<Set<string>>(new Set());

export const selectedColor = writable<string>(COLOR_PICKER_UI_DEFAULT_COLOR);
