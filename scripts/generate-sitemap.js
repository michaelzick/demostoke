import fs from 'fs';
import path from 'path';

const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');

if (fs.existsSync(sitemapPath)) {
  fs.unlinkSync(sitemapPath);
  console.log(`Removed stale static sitemap at ${sitemapPath}.`);
}

console.log('No static sitemap is generated for this app.');
console.log('The canonical sitemap is served dynamically by server/index.js at /sitemap.xml.');
