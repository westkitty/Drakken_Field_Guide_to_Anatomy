import fs from 'node:fs';

const path = 'src/App.tsx';
let source = fs.readFileSync(path, 'utf8');
const block = `  useEffect(() => {\n    const selector = registryOpen\n      ? '.registry-panel.is-open'\n      : toolsOpen\n        ? '.tools-panel.is-open'\n        : recordOpen\n          ? '.record-panel.is-open'\n          : null;\n    if (!selector) return;\n    const frame = window.requestAnimationFrame(() => {\n      const panel = document.querySelector<HTMLElement>(selector);\n      panel?.querySelector<HTMLElement>('input, button, select, [href], [tabindex]:not([tabindex="-1"])')?.focus();\n    });\n    return () => window.cancelAnimationFrame(frame);\n  }, [recordOpen, registryOpen, toolsOpen]);\n\n`;

const first = source.indexOf(block);
if (first === -1) throw new Error('Expected drawer focus effect is missing.');
let next = source.indexOf(block, first + block.length);
while (next !== -1) {
  source = source.slice(0, next) + source.slice(next + block.length);
  next = source.indexOf(block, first + block.length);
}
fs.writeFileSync(path, source);
console.log('Drawer focus effect normalized to one copy.');
