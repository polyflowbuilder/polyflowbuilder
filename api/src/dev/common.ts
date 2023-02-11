// things that multiple dev utilities use

import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const apiRoot = `${__dirname}/../../../api`;

// recursively return all files in directory asynchronously
export async function* getFiles(dir: string): AsyncGenerator<string> {
  const { resolve } = path;
  const { readdir } = fs.promises;
  const dirents = await readdir(dir, { withFileTypes: true });

  for (let i = 0; i < dirents.length; i += 1) {
    const res = resolve(dir, dirents[i].name);
    if (dirents[i].isDirectory()) {
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
