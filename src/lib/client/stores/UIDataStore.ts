import { derived, writable } from 'svelte/store';
import { programData } from './apiDataStore';
import { userFlowcharts } from './userDataStore';
import type { FlowListUIData } from '$lib/types';

// required data for flow list UI
export const flowListUIData = derived([userFlowcharts, programData], ([userFlows, progData]) => {
  // TODO: see POLY-511
  const flowListData: FlowListUIData[] = !progData.length
    ? []
    : userFlows.map((flow) => {
        // get the display info for each program
        const selectedProgramDataArr = flow.programId.map((flowProgramId) => {
          // this should NEVER returned undefined - if so we have a bug!
          const prog = progData.find((prog) => prog.id === flowProgramId);
          if (!prog) {
            throw new Error('could not find program for flowchart');
          }
          return prog;
        });

        return {
          id: flow.id,
          name: flow.name,
          startYear: flow.startYear,
          displayInfo: selectedProgramDataArr.map((prog) => {
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
