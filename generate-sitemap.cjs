// generate-sitemap.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

const BASE_URL = 'https://pixelclass.netlify.app/'; // Replace with your real domain

const routes = [
  '/',
  '/auth/signup/close',
  '/auth/login',
  '/sem',
  '/profile',
  '/logout',
  '/team',
  '/career',
  '/search',
  '/ns',
  '/nss',
  '/select'
];

const sitemapStream = new SitemapStream({ hostname: BASE_URL });
const writeStream = createWriteStream('./public/sitemap.xml');

(async () => {
  for (const route of routes) {
    sitemapStream.write({ url: route, changefreq: 'weekly', priority: 0.8 });
  }

  sitemapStream.end();

  try {
    const data = await streamToPromise(sitemapStream);
    writeStream.write(data.toString());
    console.log('✅ Sitemap generated at public/sitemap.xml');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
})();
