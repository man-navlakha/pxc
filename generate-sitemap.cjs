// generate-sitemap.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const axios = require('axios');

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

const sitemapStream = new SitemapStream({ hostname: BASE_URL });
const writeStream = createWriteStream('./public/sitemap.xml');

(async () => {
  try {
    // Add static routes to the sitemap
    for (const route of staticRoutes) {
      sitemapStream.write({ url: route, changefreq: 'weekly', priority: 0.8 });
    }

    // Fetch dynamic subject routes from your API
    const response = await axios.post('https://pixel-classes.onrender.com/api/home/QuePdf/Get_Subjact', {
      sem: 'all', // Or loop through semesters 3, 4, 5, 6 if your API supports it
      course_name: 'B.C.A',
    });

    const subjects = response.data;

    if (Array.isArray(subjects)) {
      for (const subject of subjects) {
        // Assuming your API returns semester information for each subject
        const sem = subject.sem || '5'; // Use a default if 'sem' is not in the response
        const subjectName = encodeURIComponent(subject.name);
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