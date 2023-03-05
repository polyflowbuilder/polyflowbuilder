import type { APICourse, CourseRequisite, GECourse, Program } from '@prisma/client';

export type CourseCache = {
  catalog: string;
  courses: APICourse[];
};

export type APIData = {
  // available flowchart data
  catalogs: string[];
  startYears: string[];
  programData: Program[];

  // course-related data
  courseData: CourseCache[];
  geCourseData: GECourse[];
  reqCourseData: CourseRequisite[];
};

export type APINotificationContent = {
  content: string;
};
