import fs from 'node:fs';

const path = 'scripts/apply-polish-pass.mjs';
let source = fs.readFileSync(path, 'utf8');

source = source.replace(
  'window.requestAnimationFrame(() => document.getElementById(`record-tab-${nextTab}`)?.focus());',
  "window.requestAnimationFrame(() => document.getElementById('record-tab-' + nextTab)?.focus());",
);
source = source.replace(
  '<div className={`annotation-row ${selectedAnnotationId === annotation.id ? \'is-active\' : \'\'}`} key={annotation.id}>',
  "<div className={'annotation-row ' + (selectedAnnotationId === annotation.id ? 'is-active' : '')} key={annotation.id}>",
);

fs.writeFileSync(path, source);
console.log('Temporary polish applicator quoting repaired.');
