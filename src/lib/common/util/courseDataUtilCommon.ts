// handles common functionality with course data

import type { Program } from '@prisma/client';

export function getCatalogFromProgramIDIndex(
  programIDIndex: number,
  programId: string[],
  programCache: Program[]
): string | undefined {
  const program = programCache.find((prog) => prog.id === programId[programIDIndex]);
  return program?.catalog;
}
