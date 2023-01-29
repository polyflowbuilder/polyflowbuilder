// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { PrismaClient } from '@prisma/client';

// and what to do when importing types
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session?: {
        email: string;
        username: string;
      };
    }
    // interface PageData {}
    // interface Platform {}
  }

  // need var so the client is defined globally
  // TODO: find a way to remove this
  // eslint-disable-next-line no-var
  var prisma_DO_NOT_IMPORT: PrismaClient;
}

export {};
