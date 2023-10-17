import type { ObjectMap } from '$lib/common/util/ObjectMap';
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

export interface CourseCacheKey {
  catalog: string;
  id: string;
}
export type CourseCache = ObjectMap<CourseCacheKey, APICourseFull>;

export type ProgramCache = Map<string, Program>;

export type MajorOptionsCache = Map<string, string[]>;

export interface ConcOptionsCacheKey {
  catalog: string;
  majorName: string;
}
export interface ConcOptionsCacheValue {
  name: string;
  id: string;
}
export type ConcOptionsCache = ObjectMap<ConcOptionsCacheKey, ConcOptionsCacheValue[]>;

export interface APIData {
  // available flowchart data
  catalogs: string[];
  startYears: string[];
  programData: ProgramCache;

  // course-related data
  courseData: CourseCache;
  geCourseData: GECourse[];
  reqCourseData: CourseRequisite[];
}

export interface APINotificationContent {
  content: string;
}
