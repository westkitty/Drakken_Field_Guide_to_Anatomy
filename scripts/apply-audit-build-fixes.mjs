import { readFile, writeFile, rm } from 'node:fs/promises';
import { glob } from 'node:fs/promises';

const curvePattern = /(class\s+\w+\s+extends\s+THREE\.Curve<THREE\.Vector3>\s*\{\n)(\s*getPoint\s*\()/g;
let constructorCount = 0;

for await (const path of glob('src/scene/**/*.tsx')) {
  let source = await readFile(path, 'utf8');
  const updated = source.replace(curvePattern, (_match, declaration, getPoint) => {
    constructorCount += 1;
    return `${declaration}  constructor() {\n    super();\n  }\n\n  ${getPoint}`;
  });
  if (updated !== source) {
    await writeFile(path, updated);
  }
}

const packagePath = 'package.json';
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
packageJson.engines = { ...packageJson.engines, node: '>=22.13.0' };
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

const validationPath = '.github/workflows/validate-build-skymourn.yml';
const validation = await readFile(validationPath, 'utf8');
await writeFile(validationPath, validation.replace("node-version: '22.12.0'", "node-version: '22.13.0'"));

await rm('src/scene/models/SeedcarrierModels.tsx', { force: true });

console.log(`Added ${constructorCount} explicit curve constructors.`);
console.log('Removed obsolete SeedcarrierModels.tsx and updated Node floor.');

await rm('scripts/apply-audit-build-fixes.mjs', { force: true });
await rm('.github/workflows/apply-audit-build-fixes.yml', { force: true });
