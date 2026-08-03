import { access, readFile, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const seedcarrierPath = 'src/scene/models/SeedcarrierModels.tsx';
try {
  await access(seedcarrierPath);
} catch {
  const source = execFileSync('git', ['show', `origin/build-skymourn:${seedcarrierPath}`], { encoding: 'utf8' });
  await writeFile(seedcarrierPath, source);
  console.log('Restored SeedcarrierModels.tsx because canon-correct wrappers import three compatibility bases.');
}

const curvePattern = /(class\s+\w+\s+extends\s+THREE\.Curve<THREE\.Vector3>\s*\{\n)(\s*getPoint\s*\()/g;
let constructorCount = 0;

for await (const path of glob('src/scene/**/*.tsx')) {
  const source = await readFile(path, 'utf8');
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

console.log(`Added ${constructorCount} missing explicit curve constructors.`);
console.log('Updated the declared Node floor.');
