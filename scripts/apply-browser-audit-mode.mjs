import fs from 'node:fs';

const chamberPath = 'src/components/ExaminationChamber.tsx';
let chamber = fs.readFileSync(chamberPath, 'utf8');
if (!chamber.includes('const auditMode = useMemo')) {
  chamber = chamber.replace(
    "  const accentLightColor = getSpecimenAccentColor(props.record.archetype);",
    "  const accentLightColor = getSpecimenAccentColor(props.record.archetype);\n  const auditMode = useMemo(\n    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('audit') === '1',\n    [],\n  );\n  const effectiveQualityTier: ChamberProps['qualityTier'] = auditMode ? 'reduced' : props.qualityTier;",
  );
}
chamber = chamber.replace('key={props.qualityTier}', "key={auditMode ? 'audit' : props.qualityTier}");
if (!chamber.includes("frameloop={auditMode ? 'demand' : 'always'}")) {
  chamber = chamber.replace(
    "        shadows={props.qualityTier === 'standard'}",
    "        frameloop={auditMode ? 'demand' : 'always'}\n        shadows={!auditMode && props.qualityTier === 'standard'}",
  );
}
chamber = chamber.replace("dpr={props.qualityTier === 'standard' ? [1, 1.75] : 1}", "dpr={auditMode ? 1 : props.qualityTier === 'standard' ? [1, 1.75] : 1}");
chamber = chamber.replace("gl={{ antialias: props.qualityTier === 'standard', powerPreference: 'high-performance', alpha: false }}", "gl={{ antialias: !auditMode && props.qualityTier === 'standard', powerPreference: 'high-performance', alpha: false }}");
chamber = chamber.replace('<StudioLighting accent={accentLightColor} qualityTier={props.qualityTier} />', '<StudioLighting accent={accentLightColor} qualityTier={effectiveQualityTier} />');
if (!chamber.includes('{!auditMode && (\n          <ContactShadows')) {
  chamber = chamber.replace('          <ContactShadows\n', '          {!auditMode && (\n          <ContactShadows\n');
  chamber = chamber.replace('            frames={1}\n          />\n          <ScaleReference', '            frames={1}\n          />\n          )}\n          <ScaleReference');
}
fs.writeFileSync(chamberPath, chamber);

const auditPath = 'scripts/immersive-browser-audit.mjs';
let audit = fs.readFileSync(auditPath, 'utf8');
if (!audit.includes('const auditUrl = new URL(baseUrl);')) {
  audit = audit.replace(
    "await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });\nawait page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });",
    "await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });\nconst auditUrl = new URL(baseUrl);\nauditUrl.searchParams.set('audit', '1');\nawait page.goto(auditUrl.toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });",
  );
}
const qualityBlock = `await page.keyboard.press('t');\nawait page.waitForSelector('.tools-panel.is-open', { visible: true });\nawait page.$$eval('.tools-panel button', (buttons) => {\n  const reduced = buttons.find((button) => button.textContent?.includes('Reduced quality'));\n  if (reduced?.getAttribute('aria-pressed') !== 'true') reduced?.click();\n});\nawait page.keyboard.press('Escape');\nawait delay(120);\n\n`;
audit = audit.replace(qualityBlock, '');
fs.writeFileSync(auditPath, audit);
console.log('Applied on-demand audit render mode without changing normal runtime behavior.');
