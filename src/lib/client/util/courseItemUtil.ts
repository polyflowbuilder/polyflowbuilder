// client utility functions for course cards

import { browser } from '$app/environment';
import { MAX_TOOLTIP_WIDTH_PX } from '$lib/client/config/uiConfig';
import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';
import { UserDataUpdateChunkType, UserDataUpdateChunkTERM_MODCourseDataFrom } from '$lib/types';
import type { Program } from '@prisma/client';
import type { Course, Term } from '$lib/common/schema/flowchartSchema';
import type {
  UserDataUpdateChunk,
  TermModChangeTermDataEntry,
  TermModChangeTermDataField
} from '$lib/common/schema/mutateUserDataSchema';
import type {
  CourseCache,
  APICourseFull,
  CourseItemData,
  ComputedCourseItemDisplayData
} from '$lib/types';

export function computeCourseDisplayValues(
  course: Course,
  courseMetadata: APICourseFull | null,
  // compute values that visible without looking at tooltip (for pdf gen)
  computeTooltipDisplayData = true
): ComputedCourseItemDisplayData {
  if (!course.id && !course.customId) {
    throw new Error('course id not valid for course');
  }

  // TODO: error checking for if we're using default course data but it's not defined
  return {
    // type cast is safe bc course id will always be nonnull if customId not defined
    idName: course.customId || (course.id as string),
    displayName: course.customDisplayName || courseMetadata?.displayName || '',
    units: course.customUnits || courseMetadata?.units || '0',
    color: course.color,
    ...(computeTooltipDisplayData && {
      tooltip: {
        custom: !!course.customId,
        desc: course.customDesc || courseMetadata?.desc || '',
        addlDesc: course.customDesc ? '' : courseMetadata?.addl || '',
        termsOffered: courseMetadata?.dynamicTerms || null
      }
    })
  };
}

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
            getCatalogFromProgramIDIndex(course.programIdIndex || 0, flowProgramId, programCache)
        )
        ?.courses.find((c) => c.id === course.id) || null;
    const computedCourseDisplayValues = computeCourseDisplayValues(course, courseMetadata);

    const itemData: CourseItemData = {
      idName: computedCourseDisplayValues.idName,
      displayName: computedCourseDisplayValues.displayName,
      units: computedCourseDisplayValues.units,
      color: computedCourseDisplayValues.color,
      metadata: {
        flowProgramIndex: course.programIdIndex || 0,
        tIndex: termData.tIndex,
        cIndex,
        selected: selectedCourses.has(`${termData.tIndex}-${cIndex}`)
      },
      tooltipParams: {}
    };
    if (browser) {
      itemData.tooltipParams = {
        arrow: false,
        placement: 'right-start',
        theme: 'light',
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
    const { flowProgramIndex, ...posData } = item.metadata;

    // TODO: remove magic number
    if (posData.tIndex === -2) {
      // do a lookup from course cache if we come from search
      const catalog = getCatalogFromProgramIDIndex(flowProgramIndex, flowProgramId, programCache);
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
          ...(flowProgramIndex && {
            programIdIndex: flowProgramIndex
          })
        }
      });
    } else {
      // add source position from existing data model
      newTermData.push({
        from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
        data: posData
      });
    }
  });

  return {
    type: UserDataUpdateChunkType.FLOW_TERM_MOD,
    data: {
      id: flowId,
      tIndex,
      // safe to typecast bc we validate earlier in TermContainer
      // that that the termData array (course changes) will not be empty
      termData: newTermData as TermModChangeTermDataField
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
    (tooltipElem.lastElementChild as Element).insertAdjacentElement('afterend', displayNameElem);
  }

  if (data.tooltip) {
    (tooltipElem.lastElementChild as Element).insertAdjacentHTML(
      'afterend',
      '<div class="divider my-1"></div>'
    );

    if (data.tooltip.desc.length) {
      (tooltipElem.lastElementChild as Element).insertAdjacentHTML(
        'afterend',
        `<p>${data.tooltip.desc}</p>`
      );
    }

    if (!data.tooltip.custom && (data.tooltip.addlDesc.length || data.tooltip.termsOffered)) {
      (tooltipElem.lastElementChild as Element).insertAdjacentHTML(
        'afterend',
        `<div class="divider my-1"></div>`
      );

      if (data.tooltip.addlDesc.length) {
        const addlDescElem = document.createElement('p');
        addlDescElem.appendChild(document.createTextNode(data.tooltip.addlDesc));
        (tooltipElem.lastElementChild as Element).insertAdjacentElement('afterend', addlDescElem);
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
      (tooltipElem.lastElementChild as Element).insertAdjacentElement('afterend', termsOfferedElem);
    }
  }

  return tooltipElem;
}
