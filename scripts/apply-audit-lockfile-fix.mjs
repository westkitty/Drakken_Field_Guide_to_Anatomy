import { readFile, writeFile } from 'node:fs/promises';

const path = 'package-lock.json';
const lockfile = JSON.parse(await readFile(path, 'utf8'));
lockfile.packages[''].engines = {
  ...(lockfile.packages[''].engines ?? {}),
  node: '>=22.13.0',
};
await writeFile(path, `${JSON.stringify(lockfile, null, 2)}\n`);
console.log('Synchronized package-lock root Node engine with package.json.');
