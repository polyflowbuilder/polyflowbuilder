import type { Props } from 'tippy.js';
import type { TermTypicallyOffered } from '@prisma/client';

// MutableForEachContainer
export type MutableForEachContainerItemInternal = {
  id: string;
  item: unknown;
};

// item types for MutableForEachContainer
export type FlowListItemData = {
  idx: number;
  id: string;
  name: string;
  tooltipParams: Partial<Props>;
};

export type CourseItemData = {
  idName: string;
  displayName: string;
  units: string;
  color: string;
  tooltipParams: Partial<Props>;

  metadata: {
    // to assign searched courses to a program
    flowProgramIndex: number;
  };
};

export type ComputedCourseItemDisplayData = {
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
};
