import { browser } from '$app/environment';
import { programDataLoaded } from '$lib/client/stores/metadataStore';
import type { Program } from '@prisma/client';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, fetch }) => {
  async function getAvailableProgramData(): Promise<{
    catalogs: string[];
    startYears: string[];
    programData: Program[];
  } | null> {
    // only load this data once on client-side
    if (browser) {
      let loadProgramData = false;
      programDataLoaded.subscribe((val) => (loadProgramData = !val));

      if (loadProgramData) {
        const programData = await fetch('/api/data/getAvailableProgramData');
        programDataLoaded.set(true);
        if (programData.ok) {
          return (await programData.json()) as {
            catalogs: string[];
            startYears: string[];
            programData: Program[];
          };
        }
      }
    }
    return null;
  }

  return {
    ...data,
    programData: getAvailableProgramData()
  };
};
