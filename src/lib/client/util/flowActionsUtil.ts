import { selectedCourses } from '../stores/UIDataStore';
import { submitUserDataUpdateChunk } from './mutateUserDataUtilClient';
import { UPDATE_CHUNK_DELAY_TIME_MS } from '../config/editorConfig';
import { UserDataUpdateChunkTERM_MODCourseDataFrom, UserDataUpdateChunkType } from '$lib/types';
import type { Term } from '$lib/common/schema/flowchartSchema';

export function deleteSelectedCourses(
  flowchartId: string,
  termData: Term[],
  selectedCoursesEntries: Set<string>
) {
  const termDataIdxs = termData.map((term) => {
    return {
      tIndex: term.tIndex,
      cIndexes: term.courses.map((_, i) => i)
    };
  });
  const changedTIndexes = new Set<number>();

  // collect terms that have deleted courses in them
  selectedCoursesEntries.forEach((entry) => {
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
      (cIndex) => !selectedCoursesEntries.has(`${tIndex},${cIndex}`)
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
  selectedCoursesEntries: Set<string>,
  selectedColor: string
) {
  const changedTIndexes = new Set<number>();

  // collect terms that have deleted courses in them
  selectedCoursesEntries.forEach((entry) => {
    changedTIndexes.add(Number(entry.split(',')[0]));
  });

  // apply color update to each course
  changedTIndexes.forEach((tIndex) => {
    const curTermData = termData.find((term) => term.tIndex === tIndex);

    if (!curTermData) {
      throw new Error('could not find modified term for course deletion');
    }

    submitUserDataUpdateChunk({
      type: UserDataUpdateChunkType.FLOW_TERM_MOD,
      data: {
        id: flowchartId,
        tIndex,
        termData: curTermData.courses.map((course, cIndex) => {
          if (selectedCoursesEntries.has(`${tIndex},${cIndex}`)) {
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
