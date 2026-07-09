const https = require('https');
https.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://saradakosh.org/&category=seo', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.lighthouseResult && json.lighthouseResult.categories && json.lighthouseResult.categories.seo) {
        console.log("SEO Score: " + (json.lighthouseResult.categories.seo.score * 100));
        const audits = json.lighthouseResult.audits;
        for (let key in audits) {
          if (audits[key].score !== null && audits[key].score < 1) {
            console.log("Failed Audit: " + audits[key].title + " - " + audits[key].description);
          }
        }
      } else {
        console.log("Error parsing lighthouseResult:", Object.keys(json));
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
  });
});
