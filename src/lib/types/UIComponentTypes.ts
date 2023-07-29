import type { Props } from 'tippy.js';
import type { TermTypicallyOffered } from '@prisma/client';

// MutableForEachContainer
export interface MutableForEachContainerItemInternal {
  id: string;
  item: unknown;
}

// item types for MutableForEachContainer
export interface FlowListItemData {
  idx: number;
  id: string;
  name: string;
  tooltipParams: Partial<Props>;
}

export interface CourseItemData {
  idName: string;
  displayName: string;
  units: string;
  color: string;
  tooltipParams: Partial<Props>;

  metadata: {
    // to assign searched courses to a program
    flowProgramIndex: number;

    // to associate course item with its data model representation
    tIndex: number;
    cIndex: number;

    selected: boolean;
  };
}

export interface ComputedCourseItemDisplayData {
  idName: string;
  displayName: string;
  units: string;
  color: string;

  tooltip?: {
    custom: boolean;
    desc: string;
    addlDesc: string;
    termsOffered: Omit<Omit<TermTypicallyOffered, 'id'>, 'catalog'> | null;
  };
}

export interface FlowEditorFooterUnitCounts {
  major: string;
  support: string;
  conc1: string;
  conc2: string;
  ge: string;
  elective: string;
  other: string;
  total: string;
}
