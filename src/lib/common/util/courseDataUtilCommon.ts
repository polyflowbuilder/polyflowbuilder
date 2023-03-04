// handles common functionality with course data

import type { Program } from '@prisma/client';

export function getCourseCatalogFromCourse(
  courseProgramIDIndex: number,
  programId: string[],
  programCache: Program[]
): string | undefined {
  const program = programCache.find((prog) => prog.id === programId[courseProgramIDIndex]);
  return program?.catalog;
}
