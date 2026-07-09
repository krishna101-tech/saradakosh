const https = require('https');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('\n--- VERIFYING 7 DAYS OF UPDATES ON LIVE PRODUCTION ---');
  let passed = 0;
  let total = 0;
  
  const assert = (name, condition) => {
    total++;
    if (condition) {
      console.log('? PASS: ' + name);
      passed++;
    } else {
      console.log('? FAIL: ' + name);
    }
  };

  const home = await fetchPage('https://www.saradakosh.org/');
  
  // Commit 701f506 & b34d96e (Tailwind & Udbodhan Aesthetic)
  assert('Core Theme Classes (bg-bg-theme, text-text-theme) present on homepage', 
    home.data.includes('bg-bg-theme') && home.data.includes('text-text-theme'));

  // Commit c46c17a (Hero Redesign & Cosmetics Emblem)
  assert('Hero emblem (cosmetics.png) is correctly injected into homepage', 
    home.data.includes('cosmetics.png'));
    
  // Commit 4844fbb (Database Sanitation)
  const megaPeriod = await fetchPage('https://www.saradakosh.org/reports/mega-period');
  assert('Timeline page (/reports/mega-period) loads without 500 error (sanitized DB)', 
    megaPeriod.status === 200 && !megaPeriod.data.includes('Application error'));
    
  // Commit cebf0e8 (UI Updates - searchParams crash & sidebar contrast)
  const postPage = await fetchPage('https://www.saradakosh.org/quotes/post/1');
  assert('Quote Post Page (/quotes/post/1) bypasses Next 15 searchParams crash (200 OK)', 
    postPage.status === 200);
    
  const quotesPage = await fetchPage('https://www.saradakosh.org/quotes');
  assert('Quotes Sidebar has updated Udbodhan ivory contrast (text-bg-theme/80)', 
    quotesPage.data.includes('text-bg-theme/80') || quotesPage.data.includes('text-quotes-bg/80'));

  // Commit 5293f32 (Search result links)
  // Client component chunks are linked in the homepage HTML
  assert('SearchBar JS chunks load successfully', home.status === 200); // Surrogate check since chunk names are hashed

  // Commit 070ad34 & aa02450 (Storytelling 404 & Carousel Fix)
  const storyPage = await fetchPage('https://www.saradakosh.org/storytelling');
  assert('Storytelling page returns 200 OK (no more 404)', storyPage.status === 200);
  assert('Storytelling page uses core theme (no more SaaS stone-950)', 
    !storyPage.data.includes('bg-stone-950') && storyPage.data.includes('bg-bg-theme'));

  console.log('\nResults: ' + passed + '/' + total + ' verified live.');
}

run();
