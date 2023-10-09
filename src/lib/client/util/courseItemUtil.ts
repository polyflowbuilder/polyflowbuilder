// client utility functions for course cards

import { browser } from '$app/environment';
import { MAX_TOOLTIP_WIDTH_PX } from '$lib/client/config/uiConfig';
import { UserDataUpdateChunkType, UserDataUpdateChunkTERM_MODCourseDataFrom } from '$lib/types';
import {
  computeCourseDisplayValues,
  getCatalogFromProgramIDIndex
} from '$lib/common/util/courseDataUtilCommon';
import type { Term } from '$lib/common/schema/flowchartSchema';
import type { Program } from '@prisma/client';
import type { CourseCache, CourseItemData, ComputedCourseItemDisplayData } from '$lib/types';
import type {
  UserDataUpdateChunk,
  TermModChangeTermDataEntry
} from '$lib/common/schema/mutateUserDataSchema';

export function buildTermCourseItemsData(
  flowProgramId: string[],
  courseCache: CourseCache[],
  programCache: Program[],
  termData: Term,
  selectedCourses: Set<string>
): CourseItemData[] {
  const items: CourseItemData[] = [];

  for (let cIndex = 0; cIndex < termData.courses.length; cIndex++) {
    const course = termData.courses[cIndex];
    const courseMetadata =
      courseCache
        .find(
          (cacheEntry) =>
            cacheEntry.catalog ===
            getCatalogFromProgramIDIndex(course.programIdIndex ?? 0, flowProgramId, programCache)
        )
        ?.courses.find((c) => c.id === course.id) ?? null;
    const computedCourseDisplayValues = computeCourseDisplayValues(course, courseMetadata);

    const itemData: CourseItemData = {
      idName: computedCourseDisplayValues.idName,
      displayName: computedCourseDisplayValues.displayName,
      units: computedCourseDisplayValues.units,
      color: computedCourseDisplayValues.color,
      metadata: {
        flowProgramIndex: course.programIdIndex ?? 0,
        tIndex: termData.tIndex,
        cIndex,
        selected: selectedCourses.has(`${termData.tIndex},${cIndex}`)
      },
      tooltipParams: {}
    };
    if (browser) {
      itemData.tooltipParams = {
        arrow: false,
        placement: 'right-start',
        theme: 'light-border',
        allowHTML: true,
        content: generateCourseItemTooltipHTML(computedCourseDisplayValues),
        maxWidth: MAX_TOOLTIP_WIDTH_PX,
        hideOnClick: false
      };
    }
    items.push(itemData);
  }
  return items;
}

// TODO: clean up this function at some point
export function buildTermModUpdateChunkFromCourseItems(
  flowId: string,
  flowProgramId: string[],
  courseCache: CourseCache[],
  programCache: Program[],
  courseItems: CourseItemData[],
  tIndex: number
): UserDataUpdateChunk {
  const newTermData: TermModChangeTermDataEntry[] = [];

  courseItems.forEach((item) => {
    // TODO: remove magic number
    if (item.metadata.tIndex === -2) {
      // do a lookup from course cache if we come from search
      const catalog = getCatalogFromProgramIDIndex(
        item.metadata.flowProgramIndex,
        flowProgramId,
        programCache
      );
      const cache = courseCache.find((cache) => cache.catalog === catalog);
      const courseData = cache?.courses.find((course) => course.id === item.idName);

      if (!courseData) {
        throw new Error(
          'unable to find course data in cache in buildTermmodUpdateChunkFromCourseItems'
        );
      }

      newTermData.push({
        from: UserDataUpdateChunkTERM_MODCourseDataFrom.NEW,
        data: {
          id: courseData.id,
          color: '#FFFFFF',
          // only include program index if nonzero
          ...(item.metadata.flowProgramIndex && {
            programIdIndex: item.metadata.flowProgramIndex
          })
        }
      });
    } else {
      // add source position from existing data model
      newTermData.push({
        from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
        data: {
          tIndex: item.metadata.tIndex,
          cIndex: item.metadata.cIndex
        }
      });
    }
  });

  return {
    type: UserDataUpdateChunkType.FLOW_TERM_MOD,
    data: {
      id: flowId,
      tIndex,
      // safe bc we validate earlier in TermContainer
      // that that the termData array (course changes) will not be empty
      termData: newTermData
    }
  };
}

function generateCourseItemTooltipHTML(data: ComputedCourseItemDisplayData): Element {
  const tooltipTemplate = document.createElement('div');
  // name is only field that is required to be non-empty
  // guaranteed to not be null in dataModel v6+
  tooltipTemplate.innerHTML = '<div><strong></strong></div>';
  const tooltipElem = tooltipTemplate.firstElementChild as HTMLDivElement;

  tooltipElem.children[0].appendChild(document.createTextNode(data.idName));
  if (data.displayName) {
    const displayNameElem = document.createElement('p');
    displayNameElem.appendChild(document.createTextNode(data.displayName));
    getLastElementChildNotNull(tooltipElem).insertAdjacentElement('afterend', displayNameElem);
  }

  if (data.tooltip) {
    getLastElementChildNotNull(tooltipElem).insertAdjacentHTML(
      'afterend',
      '<div class="divider my-1"></div>'
    );

    if (data.tooltip.desc.length) {
      getLastElementChildNotNull(tooltipElem).insertAdjacentHTML(
        'afterend',
        `<p>${data.tooltip.desc}</p>`
      );
    }

    if (!data.tooltip.custom && (data.tooltip.addlDesc.length || data.tooltip.termsOffered)) {
      getLastElementChildNotNull(tooltipElem).insertAdjacentHTML(
        'afterend',
        `<div class="divider my-1"></div>`
      );

      if (data.tooltip.addlDesc.length) {
        const addlDescElem = document.createElement('p');
        addlDescElem.appendChild(document.createTextNode(data.tooltip.addlDesc));
        getLastElementChildNotNull(tooltipElem).insertAdjacentElement('afterend', addlDescElem);
      }

      const termsOfferedElem = document.createElement('p');
      if (data.tooltip.termsOffered) {
        const termsStringList = [];
        if (data.tooltip.termsOffered.termSummer) {
          termsStringList.push('Summer');
        }
        if (data.tooltip.termsOffered.termFall) {
          termsStringList.push('Fall');
        }
        if (data.tooltip.termsOffered.termWinter) {
          termsStringList.push('Winter');
        }
        if (data.tooltip.termsOffered.termSpring) {
          termsStringList.push('Spring');
        }
        const termsString = termsStringList.length
          ? termsStringList.join(', ')
          : 'Not Usually Offered';
        termsOfferedElem.appendChild(
          document.createTextNode(`\nTerms Typically Offered (Dynamic): ${termsString}`)
        );
      } else {
        termsOfferedElem.appendChild(
          document.createTextNode(`\nTerms Typically Offered (Dynamic): No Information Available`)
        );
      }
      getLastElementChildNotNull(tooltipElem).insertAdjacentElement('afterend', termsOfferedElem);
    }
  }

  return tooltipElem;
}

function getLastElementChildNotNull(elem: Element) {
  if (elem.lastElementChild === null) {
    throw new Error('assertLastElementChildNotNull failed');
  }
  return elem.lastElementChild;
}
