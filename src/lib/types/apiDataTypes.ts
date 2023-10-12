import type { ObjectSet } from '$lib/common/util/ObjectSet';
import type {
  Program,
  GECourse,
  APICourse,
  CourseRequisite,
  TermTypicallyOffered
} from '@prisma/client';

export type APICourseFull = APICourse & {
  dynamicTerms: Omit<Omit<TermTypicallyOffered, 'id'>, 'catalog'> | null;
};

export type CourseCache = Map<string, ObjectSet<APICourseFull>>;

export interface MajorNameCache {
  catalog: string;
  majorNames: string[];
}

export interface APIData {
  // available flowchart data
  catalogs: string[];
  startYears: string[];
  programData: Program[];

  // course-related data
  courseData: CourseCache;
  geCourseData: GECourse[];
  reqCourseData: CourseRequisite[];
}

export interface APINotificationContent {
  content: string;
}
