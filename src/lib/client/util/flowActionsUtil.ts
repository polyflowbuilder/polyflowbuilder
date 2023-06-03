import { v4 as uuid } from 'uuid';
import { selectedCourses } from '../stores/UIDataStore';
import { FLOW_NAME_MAX_LENGTH } from '$lib/common/config/flowDataConfig';
import { submitUserDataUpdateChunk } from './mutateUserDataUtilClient';
import { UPDATE_CHUNK_DELAY_TIME_MS } from '../config/editorConfig';
import { UserDataUpdateChunkTERM_MODCourseDataFrom, UserDataUpdateChunkType } from '$lib/types';
import type { Course, Flowchart, Term } from '$lib/common/schema/flowchartSchema';

export function deleteSelectedCourses(
  flowchartId: string,
  termData: Term[],
  selectedCourseEntries: Set<string>
) {
  const termDataIdxs = termData.map((term) => {
    return {
      tIndex: term.tIndex,
      cIndexes: term.courses.map((_, i) => i)
    };
  });
  const changedTIndexes = new Set<number>();

  // collect terms that have deleted courses in them
  selectedCourseEntries.forEach((entry) => {
    changedTIndexes.add(Number(entry.split(',')[0]));
  });

  // collect the non-deleted courses for each term
  // with deleted courses in them
  changedTIndexes.forEach((tIndex) => {
    const curTermData = termDataIdxs.find((term) => term.tIndex === tIndex);

    if (!curTermData) {
      throw new Error('could not find modified term for course deletion');
    }

    const cIndexesRemaining = curTermData.cIndexes.filter(
      (cIndex) => !selectedCourseEntries.has(`${tIndex},${cIndex}`)
    );

    submitUserDataUpdateChunk({
      type: UserDataUpdateChunkType.FLOW_TERM_MOD,
      data: {
        id: flowchartId,
        tIndex,
        termData: cIndexesRemaining.map((cIndex) => {
          return {
            from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
            data: {
              tIndex,
              cIndex
            }
          };
        })
      }
    });
  });

  // clear selected courses
  // wait a bit so it looks uniform in the UI
  setTimeout(() => {
    selectedCourses.update((set) => {
      set.clear();
      return set;
    });
  }, UPDATE_CHUNK_DELAY_TIME_MS);
}

export function colorSelectedCourses(
  flowchartId: string,
  termData: Term[],
  selectedCourseEntries: Set<string>,
  selectedColor: string
) {
  const changedTIndexes = new Set<number>();

  // collect terms that have deleted courses in them
  selectedCourseEntries.forEach((entry) => {
    changedTIndexes.add(Number(entry.split(',')[0]));
  });

  // apply color update to each course
  changedTIndexes.forEach((tIndex) => {
    const curTermData = termData.find((term) => term.tIndex === tIndex);

    if (!curTermData) {
      throw new Error('could not find modified term for course color change');
    }

    submitUserDataUpdateChunk({
      type: UserDataUpdateChunkType.FLOW_TERM_MOD,
      data: {
        id: flowchartId,
        tIndex,
        termData: curTermData.courses.map((course, cIndex) => {
          if (selectedCourseEntries.has(`${tIndex},${cIndex}`)) {
            return {
              from: UserDataUpdateChunkTERM_MODCourseDataFrom.NEW,
              data: {
                ...course,
                color: selectedColor
              }
            };
          } else {
            return {
              from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
              data: {
                tIndex,
                cIndex
              }
            };
          }
        })
      }
    });
  });
}

// TODO: if we have onlyUnitsChange and the unit count is the same
// as the unit count in the course metadata, remove customUnits property
export function updateCourseData(
  flowchartId: string,
  termData: Term[],
  selectedCourseEntries: Set<string>,
  courseChanges: {
    name: string;
    displayName: string;
    desc: string;
    units: string;
    onlyUnitsChange: boolean;
  }
) {
  const changedTIndexes = new Set<number>();

  // collect terms that have deleted courses in them
  selectedCourseEntries.forEach((entry) => {
    changedTIndexes.add(Number(entry.split(',')[0]));
  });

  // apply course changes to each applicable course in the term
  changedTIndexes.forEach((tIndex) => {
    const curTermData = termData.find((term) => term.tIndex === tIndex);

    if (!curTermData) {
      throw new Error('could not find modified term for course customize');
    }

    submitUserDataUpdateChunk({
      type: UserDataUpdateChunkType.FLOW_TERM_MOD,
      data: {
        id: flowchartId,
        tIndex,
        termData: curTermData.courses.map((course, cIndex) => {
          if (selectedCourseEntries.has(`${tIndex},${cIndex}`)) {
            const newCourseData: Course = courseChanges.onlyUnitsChange
              ? {
                  ...course,
                  customUnits: courseChanges.units
                }
              : {
                  id: null,
                  color: course.color,
                  customId: courseChanges.name,
                  ...(course.programIdIndex && {
                    programIdIndex: course.programIdIndex
                  }),
                  ...(courseChanges.displayName.length && {
                    customDisplayName: courseChanges.displayName
                  }),
                  ...(courseChanges.desc.length && {
                    customDesc: courseChanges.desc
                  }),
                  customUnits: courseChanges.units
                };

            return {
              from: UserDataUpdateChunkTERM_MODCourseDataFrom.NEW,
              data: newCourseData
            };
          } else {
            return {
              from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
              data: {
                tIndex,
                cIndex
              }
            };
          }
        })
      }
    });
  });
}

export function duplicateFlowchart(flowchart: Flowchart, userFlowchartsLength: number) {
  const newFlowchart = structuredClone(flowchart);

  // update properties
  newFlowchart.id = uuid();
  newFlowchart.name = `Copy of ${newFlowchart.name}`.substring(0, FLOW_NAME_MAX_LENGTH);
  newFlowchart.publishedId = null;
  newFlowchart.importedId = null;

  submitUserDataUpdateChunk({
    type: UserDataUpdateChunkType.FLOW_UPSERT_ALL,
    data: {
      flowchart: newFlowchart,
      pos: userFlowchartsLength
    }
  });

  // alert after the changes have been made
  setTimeout(
    () =>
      alert(
        `The flowchart has been copied as "${newFlowchart.name}" and is located at the bottom of your flowchart list.`
      ),
    UPDATE_CHUNK_DELAY_TIME_MS
  );
}
