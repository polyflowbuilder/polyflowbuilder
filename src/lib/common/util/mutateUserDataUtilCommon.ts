// common implementation for updating user data via update chunks (only includes update types common to frontend and backend)

import { computeTermUnits } from '$lib/common/util/unitCounterUtilCommon';
import { performAddTerms, performDeleteTerms } from '$lib/common/util/flowTermUtilCommon';
import { UserDataUpdateChunkTERM_MODCourseDataFrom, UserDataUpdateChunkType } from '$lib/types';
import type { Term } from '$lib/common/schema/flowchartSchema';
import type { Program } from '@prisma/client';
import type { CourseCache } from '$lib/types';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';
import type { MutateFlowchartData, MutateUserDataUtilCommonResult } from '$lib/types';

export function mutateUserFlowcharts(
  curUserFlowchartsData: MutateFlowchartData[],
  updateChunks: UserDataUpdateChunk[],
  courseCache: CourseCache[],
  programCache: Program[]
): MutateUserDataUtilCommonResult {
  const errors: string[] = [];

  const newUserFlowchartsData = structuredClone(curUserFlowchartsData);

  // each chunk needs to modify the lastUpdatedUTC time explicitly since not all
  // flows in curUserFlowchartsData are actually updated for a particular update chunk
  updateChunks.forEach((chunk) => {
    switch (chunk.type) {
      case UserDataUpdateChunkType.FLOW_LIST_CHANGE: {
        // update pos for each flowchart specified in order entries
        for (const flowPosEntry of chunk.data.order) {
          const flowDataArrIdx = newUserFlowchartsData.findIndex(
            (flowData) => flowData.flowchart.id === flowPosEntry.id
          );

          // need to validate as user may pass bad ids
          if (flowDataArrIdx === -1) {
            errors.push(
              `Unable to find flowchart ${
                flowPosEntry.id
              } referenced in flowPosEntry for FLOW_LIST_CHANGE update chunk from provided flowchart list [${newUserFlowchartsData.map(
                ({ flowchart }) => flowchart.id
              )}]`
            );
            break;
          }

          newUserFlowchartsData[flowDataArrIdx].pos = flowPosEntry.pos;
          newUserFlowchartsData[flowDataArrIdx].flowchart.lastUpdatedUTC = new Date();
        }

        // then sort flows by pos since frontend requires this
        newUserFlowchartsData.sort((a, b) => a.pos - b.pos);

        break;
      }
      case UserDataUpdateChunkType.FLOW_UPSERT_ALL: {
        const flowDataArrIdx = newUserFlowchartsData.findIndex(
          (flowData) => flowData.flowchart.id === chunk.data.flowchart.id
        );

        // replace if found, add if not (upsert)
        if (flowDataArrIdx === -1) {
          newUserFlowchartsData.push(chunk.data);
        } else {
          newUserFlowchartsData[flowDataArrIdx] = chunk.data;
        }

        break;
      }
      case UserDataUpdateChunkType.FLOW_DELETE: {
        const flowDataArrIdx = newUserFlowchartsData.findIndex(
          (flowData) => flowData.flowchart.id === chunk.data.id
        );

        // need to validate as user may pass bad ids
        if (flowDataArrIdx === -1) {
          errors.push(
            `Unable to find flowchart ${
              chunk.data.id
            } referenced in flowPosEntry for FLOW_DELETE update chunk from provided flowchart list [${newUserFlowchartsData.map(
              ({ flowchart }) => flowchart.id
            )}]`
          );
          break;
        }

        // delete the flowchart
        newUserFlowchartsData.splice(flowDataArrIdx, 1);

        break;
      }
      case UserDataUpdateChunkType.FLOW_TERM_MOD: {
        const flowDataArrIdx = newUserFlowchartsData.findIndex(
          (flowData) => flowData.flowchart.id === chunk.data.id
        );
        const flowData = newUserFlowchartsData[flowDataArrIdx]?.flowchart;

        // need to validate as user may pass bad ids
        if (!flowData) {
          errors.push(
            `Unable to find flowchart ${
              chunk.data.id
            } referenced in flowPosEntry for FLOW_TERM_MOD update chunk from provided flowchart list [${newUserFlowchartsData.map(
              ({ flowchart }) => flowchart.id
            )}]`
          );
          break;
        }

        // build the new term data from term diff received
        let encounteredError = false;
        const newTermData: Term = {
          tIndex: chunk.data.tIndex,
          courses: [],
          tUnits: '0'
        };

        const termDataArrIdx = newUserFlowchartsData[flowDataArrIdx].flowchart.termData.findIndex(
          (term) => term.tIndex === chunk.data.tIndex
        );

        if (termDataArrIdx === -1) {
          errors.push(
            `Unable to find destination term [${chunk.data.tIndex}] for flowchart ${chunk.data.id} referenced in FLOW_TERM_MOD update chunk.`
          );
          break;
        }

        chunk.data.termData.forEach((courseDiff) => {
          if (courseDiff.from === UserDataUpdateChunkTERM_MODCourseDataFrom.NEW) {
            // insert new course data if new
            newTermData.courses.push(courseDiff.data);
          } else {
            // find and reference existing course data if rearranging
            const term = flowData.termData.find((term) => term.tIndex === courseDiff.data.tIndex);
            const course = term?.courses[courseDiff.data.cIndex];

            if (!course) {
              errors.push(
                `Unable to find existing course at position [${courseDiff.data.tIndex}, ${courseDiff.data.cIndex}] for flowchart ${chunk.data.id} referenced in FLOW_TERM_MOD update chunk.`
              );
              encounteredError = true;
              return;
            }

            newTermData.courses.push(course);
          }
        });

        // only finish update if we didn't run into errors on building course data
        if (!encounteredError) {
          newTermData.tUnits = computeTermUnits(
            newTermData.courses,
            flowData.programId,
            courseCache,
            programCache
          );

          newUserFlowchartsData[flowDataArrIdx].flowchart.termData[termDataArrIdx] = newTermData;

          newUserFlowchartsData[flowDataArrIdx].flowchart.lastUpdatedUTC = new Date();
        }

        break;
      }
      case UserDataUpdateChunkType.FLOW_TERMS_ADD: {
        const flowDataArrIdx = newUserFlowchartsData.findIndex(
          (flowData) => flowData.flowchart.id === chunk.data.id
        );

        // need to validate as user may pass bad ids
        if (flowDataArrIdx === -1) {
          errors.push(
            `Unable to find flowchart ${
              chunk.data.id
            } referenced in flowPosEntry for FLOW_LIST_CHANGE update chunk from provided flowchart list [${newUserFlowchartsData.map(
              ({ flowchart }) => flowchart.id
            )}]`
          );
          break;
        }

        // insert new terms as requested
        newUserFlowchartsData[flowDataArrIdx].flowchart = performAddTerms(
          chunk.data.tIndexes,
          newUserFlowchartsData[flowDataArrIdx].flowchart
        );

        newUserFlowchartsData[flowDataArrIdx].flowchart.lastUpdatedUTC = new Date();

        break;
      }
      case UserDataUpdateChunkType.FLOW_TERMS_DELETE: {
        const flowDataArrIdx = newUserFlowchartsData.findIndex(
          (flowData) => flowData.flowchart.id === chunk.data.id
        );

        // need to validate as user may pass bad ids
        if (flowDataArrIdx === -1) {
          errors.push(
            `Unable to find flowchart ${
              chunk.data.id
            } referenced in flowPosEntry for FLOW_LIST_CHANGE update chunk from provided flowchart list [${newUserFlowchartsData.map(
              ({ flowchart }) => flowchart.id
            )}]`
          );
          break;
        }

        // delete terms as requested
        newUserFlowchartsData[flowDataArrIdx].flowchart = performDeleteTerms(
          chunk.data.tIndexes,
          newUserFlowchartsData[flowDataArrIdx].flowchart
        );

        newUserFlowchartsData[flowDataArrIdx].flowchart.lastUpdatedUTC = new Date();

        break;
      }
      default: {
        // typecast since if we handle all known types above, chunk will resolve to type never
        errors.push(`Unrecognized update chunk type ${(chunk as UserDataUpdateChunk).type}`);
        break;
      }
    }
  });

  if (errors.length) {
    return {
      success: false,
      errors
    };
  } else {
    return {
      success: true,
      flowchartsData: newUserFlowchartsData
    };
  }
}
