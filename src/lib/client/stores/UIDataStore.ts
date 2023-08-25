import { programCache } from './apiDataStore';
import { userFlowcharts } from './userDataStore';
import { derived, writable } from 'svelte/store';
import { COLOR_PICKER_UI_DEFAULT_COLOR } from '../config/uiConfig';
import type { FlowListUIData } from '$lib/types';

// required data for flow list UI
export const flowListUIData = derived([userFlowcharts, programCache], ([userFlows, progCache]) => {
  // TODO: see POLY-511
  const flowListData: FlowListUIData[] = !progCache.length
    ? []
    : userFlows.map((flow) => {
        // get the display info for each program
        const flowchartProgramsArr = flow.programId.map((flowProgramId) => {
          // this should NEVER returned undefined - if so we have a bug!
          const prog = progCache.find((prog) => prog.id === flowProgramId);
          if (!prog) {
            throw new Error('could not find program for flowchart');
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
