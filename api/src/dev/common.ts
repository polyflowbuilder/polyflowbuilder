// things that multiple dev utilities use

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RETRY_COUNT = 5;

export const apiRoot = `${__dirname}/../../../api`;

// recursively return all files in directory asynchronously
export async function* getFiles(dir: string): AsyncGenerator<string> {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

// "synchronous" async wait
export function asyncWait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchRetry(input: RequestInfo, init: RequestInit | undefined = undefined) {
  let count = RETRY_COUNT;
  while (count > 0) {
    try {
      return await fetch(input, init);
    } catch (_error) {
      console.log(
        `fetch request failed, trying again ... (${(RETRY_COUNT - count + 1).toString()}/${RETRY_COUNT.toString()})`
      );
    }
    count -= 1;
  }

  throw new Error(`Too many retries`);
}

export function nthIndex(str: string, pat: string, n: number) {
  const L = str.length;
  let i = -1;
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
}
