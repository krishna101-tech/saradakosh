const assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
(async()=>{
const base=process.env.CLASSES_TEST_URL||'http://127.0.0.1:8766';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
const page=await browser.newPage();
for(const width of [320,390,768,1440]){
 await page.setViewportSize({width,height:900});
 let response=await page.goto(base+'/classes');assert.equal(response.status(),200);
 const names=await page.locator('section[aria-label="Subject Library"] h2').allTextContents();
 assert.equal(names.length,26);assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base',numeric:true})));
 response=await page.goto(base+'/classes/Meditation');assert.equal(response.status(),200);
 await page.locator('details').first().evaluate(e=>e.open=true);
 const result=await page.locator('article').first().evaluate(e=>{const img=e.querySelector('img').getBoundingClientRect(),buttons=[...e.querySelectorAll('a,button')].filter(e=>e.getClientRects().length).map(e=>e.getBoundingClientRect());return {imageWidth:img.width,buttons:buttons.map(b=>({x:b.x,y:b.y,width:b.width})),overflow:document.documentElement.scrollWidth>innerWidth};});
 assert(!result.overflow);assert.equal(result.buttons.length,width<=600?3:2);assert(result.buttons.every(b=>Math.abs(b.y-result.buttons[0].y)<1));const last=result.buttons.at(-1);assert(Math.abs(result.imageWidth-(last.x+last.width-result.buttons[0].x))<2);
 const article=page.locator('article').first();
 if(width<=600){
  const expand=article.locator('button[aria-controls]');
  assert.equal(await article.locator('h3').isVisible(),false);
  assert.equal(await expand.getAttribute('aria-expanded'),'false');
  await expand.click();assert(await article.locator('h3').isVisible());
  assert.equal(await expand.getAttribute('aria-expanded'),'true');
  if(await article.locator('ul').count())assert(await article.getByRole('heading',{name:'Video chapters',exact:true}).isVisible());
  await expand.press('Enter');assert.equal(await article.locator('h3').isVisible(),false);
 }else assert(await article.locator('h3').isVisible());
 const small=await page.evaluate(()=>[...document.querySelectorAll('main *')].filter(e=>e.getClientRects().length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&getComputedStyle(e).position!=='absolute'&&parseFloat(getComputedStyle(e).fontSize)<17.32).map(e=>e.tagName));assert.deepEqual(small,[]);
 response=await page.goto(base+'/classes/transcripts/2UutWVzZlW4');assert.equal(response.status(),200);await page.locator('#script').waitFor();
 assert((await page.locator('#script').innerText()).length>10000);
 assert.equal(await page.locator('a[href$=".md"]').count(),0);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 console.log('PASS '+width+'px: A-Z, 13pt minimum, single-row actions, mobile disclosure, reader, no overflow');
}
const bad=await page.goto(base+'/classes/transcripts/abcdefghijk');assert.equal(bad.status(),404);
console.log('PASS unknown transcript 404');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
