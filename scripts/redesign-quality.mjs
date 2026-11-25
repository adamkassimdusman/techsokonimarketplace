import {chromium,devices} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const b=await chromium.launch();const results=[];
for(const device of ['desktop','android']){
 const context=await b.newContext(device==='android'?devices['Pixel 7']:{viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>{window.__quality={lcp:0,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__quality.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__quality.cls+=e.value}).observe({type:'layout-shift',buffered:true})});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['/','/marketplace','/finder','/insights']){
 await page.goto('http://127.0.0.1:3000'+route,{waitUntil:'networkidle'});
 const result=await page.evaluate(()=>({...window.__quality,overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length}));
 results.push({device,route,...result,errors:[...errors]});
 if(route==='/')await page.screenshot({path:'../redesign/after/home-viewport-'+device+'.png'});
 }
 if(device==='android'){
 await page.goto('http://127.0.0.1:3000/marketplace');await page.getByRole('button',{name:/^Filters/}).click();
 await page.screenshot({path:'../redesign/after/mobile-filter-panel.png'});
 await page.keyboard.press('Escape');
 results.push({device,check:'filter Escape closes dialog',passed:!(await page.getByRole('dialog').isVisible())});
 }
 await context.close();
}
await mkdir('../redesign/after',{recursive:true});
await writeFile('../redesign/after/quality.json',JSON.stringify({note:'Single local empty-catalogue samples, not field Core Web Vitals. INP not measured.',results},null,2));await b.close();console.log(JSON.stringify(results));
