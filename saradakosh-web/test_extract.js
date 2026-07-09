const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlPath = '../../viv live website/vivekananda_live_website/vivekananda.live/complete-works-of-swami-vivekananda-vol-2-page-87-43/index.html';

// Read as utf8
let html = fs.readFileSync(htmlPath, 'utf8');

// Load into cheerio
const $ = cheerio.load(html);

// Extract paragraphs
$('.post-content p').each((_, el) => {
  const txt = $(el).text().trim();
  if (txt.length > 20) {
    console.log(txt.substring(0, 150));
  }
});
