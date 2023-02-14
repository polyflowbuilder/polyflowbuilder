import type { Course, CourseRequisite, GECourse, Program } from '@prisma/client';

export type APIData = {
  // available flowchart data
  catalogs: string[];
  startYears: string[];
  programData: Program[];

  // course-related data
  courseData: Course[];
  geCourseData: GECourse[];
  reqCourseData: CourseRequisite[];
};
