/**
 * Renders build/icon.svg to the PNG sizes the web manifest and the Windows
 * packaging need.
 *
 * Run manually after changing the icon:
 *     npx playwright install chromium
 *     node scripts/make-icons.mjs
 */
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const svg = await readFile('assets/icon.svg', 'utf8');
const targets = [
  { file: 'public/icons/icon-192.png', size: 192 },
  { file: 'public/icons/icon-512.png', size: 512 },
  { file: 'apps/windows/build/icon.png', size: 512 },
];

const browser = await chromium.launch();
for (const { file, size } of targets) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<body style="margin:0">${svg.replace(/width="512" height="512"/, `width="${size}" height="${size}"`)}</body>`,
  );
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, await page.screenshot({ omitBackground: true }));
  await page.close();
  console.log(`wrote ${file} (${size}x${size})`);
}
await browser.close();
