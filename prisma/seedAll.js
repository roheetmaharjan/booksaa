import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const seedDir = path.resolve('./prisma');
const files = fs.readdirSync(seedDir).filter(f => f.startsWith('seed') && f.endsWith('.js') && f !== 'seedAll.js');

(async () => {
  for (const file of files) {
    console.log(`Running ${file}...`);
    const fileUrl = pathToFileURL(path.join(seedDir, file));
    await import(fileUrl.href);
  }
})();