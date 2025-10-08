// generate-sitemap.cjs
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

const BASE_URL = 'https://pixelclass.netlify.app/';

// URLs that are not dynamic
const staticRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/sem',
  '/profile',
  '/search',
];

// Hardcoded list of subjects for each semester
const subjectsBySem = {
  '4': [
    'Environmental Science',
    'Numerical Methods',
    'Statistical Skills',
    'Unified Modelling Language',
    'Introduction to Python',
    'Introduction to Operating System',
    'Introduction to Core Java',
  ],
  '5': [
    'Data Communication & Computer Network',
    'HyperText Preprocessor',
    'Network Security',
    'Advanced Java',
    'Linux',
  ],
  // Add other semesters and subjects here if needed
};

const sitemapStream = new SitemapStream({ hostname: BASE_URL });
const writeStream = createWriteStream('./public/sitemap.xml');

(async () => {
  try {
    // Add static routes to the sitemap
    for (const route of staticRoutes) {
      sitemapStream.write({ url: route, changefreq: 'weekly', priority: 0.8 });
    }

    // Add dynamic subject routes from the hardcoded list
    for (const sem in subjectsBySem) {
      for (const subject of subjectsBySem[sem]) {
        const subjectName = encodeURIComponent(subject);
        sitemapStream.write({ url: `/${sem}/${subjectName}`, changefreq: 'weekly', priority: 0.9 });
      }
    }

    sitemapStream.end();

    const data = await streamToPromise(sitemapStream);
    writeStream.write(data.toString());
    console.log('✅ Sitemap generated at public/sitemap.xml');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
})();