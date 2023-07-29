import type {
  APICourse,
  CourseRequisite,
  GECourse,
  Program,
  TermTypicallyOffered
} from '@prisma/client';

export type APICourseFull = APICourse & {
  dynamicTerms: Omit<Omit<TermTypicallyOffered, 'id'>, 'catalog'> | null;
};

export interface CourseCache {
  catalog: string;
  courses: APICourseFull[];
}

export interface APIData {
  // available flowchart data
  catalogs: string[];
  startYears: string[];
  programData: Program[];

  // course-related data
  courseData: CourseCache[];
  geCourseData: GECourse[];
  reqCourseData: CourseRequisite[];
}

export interface APINotificationContent {
  content: string;
}
