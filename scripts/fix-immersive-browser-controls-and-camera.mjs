import fs from 'node:fs';

const chamberPath = 'src/components/ExaminationChamber.tsx';
let chamber = fs.readFileSync(chamberPath, 'utf8');
chamber = chamber.replace(
  `  resetToken,\n}: {\n  mode: CameraMode;\n  preset: CameraPreset;\n  commandToken: number;\n  resetToken: number;\n}) {`,
  `}: {\n  mode: CameraMode;\n  preset: CameraPreset;\n  commandToken: number;\n}) {`,
);
chamber = chamber.replace(
  `  }, [mode, preset, commandToken, resetToken]);`,
  `  }, [mode, commandToken, preset]);`,
);
chamber = chamber.replace(
  `          commandToken={props.cameraCommandToken}\n          resetToken={props.resetCameraToken}\n        />`,
  `          commandToken={props.cameraCommandToken}\n        />`,
);
chamber = chamber.replace('margin={1.14}', 'margin={1.38}');
fs.writeFileSync(chamberPath, chamber);

const auditPath = 'scripts/immersive-browser-audit.mjs';
let audit = fs.readFileSync(auditPath, 'utf8');
audit = audit.replace(
  `await click('button[aria-label="Open specimen registry"]');`,
  `await page.keyboard.press('g');`,
);
audit = audit.replaceAll(
  `  await click('button[aria-label="Open specimen registry"]');`,
  `  await page.keyboard.press('g');`,
);
audit = audit.replaceAll(
  `  await click('button[aria-label="Open examination tools"]');`,
  `  await page.keyboard.press('t');`,
);
fs.writeFileSync(auditPath, audit);

console.log('Camera reset remains bounds-owned; browser audit uses G/T deliberate shortcuts.');
