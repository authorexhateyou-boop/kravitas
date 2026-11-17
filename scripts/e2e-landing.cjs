const {chromium}=require('playwright');
const R=[];const ok=(n,c,d='')=>{R.push((c?'PASS ':'FAIL ')+n+(d?' — '+d:''));};
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1366,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|favicon/.test(m.text()))errs.push(m.text())});
// ---------- LANDING ----------
await p.goto('http://localhost:3365/');await p.waitForTimeout(800);
ok('landing loads',await p.title()==='Kravitas');
const links=await p.$$eval('a[href^="#"]',a=>a.map(x=>x.getAttribute('href')).filter(h=>h.length>1));
let bad=[];for(const h of new Set(links)){if(!(await p.$(h)))bad.push(h)}ok('anchor links resolve',!bad.length,bad.join());
for(const [sel,exp] of [['.nav .btn.sm','/studio'],['nav a[href="#pricing"]','#pricing']]){const h=await p.$eval(sel,e=>e.getAttribute('href'));ok('link '+sel,h.includes(exp),h)}
ok('no EN/BM toggle',await p.locator('[data-uilang]').count()===0);
// filter chips
await p.click('#fchips [data-f=image]');ok('filter image -> 2 cards',await p.locator('#lib .lc:visible').count()===2);
await p.click('#fchips [data-f=all]');ok('filter all -> 9',await p.locator('#lib .lc:visible').count()===9);
// card links
const hrefs=await p.$$eval('#lib .lc',a=>a.map(x=>x.getAttribute('href')));ok('9 grid cards link to a mode',hrefs.every(h=>/^\/studio\?tpl=\w+$/.test(h)),hrefs.join(' '));
// example chip + submit
await p.click('#try-ex [data-ex]');ok('example chip fills box',(await p.inputValue('#try-idea')).length>10);
const nav=p.waitForURL(/\/studio/);await p.click('.f-go');await nav;
ok('submit goes to studio with idea',true,p.url().slice(0,60));
await p.waitForTimeout(2500);
ok('studio opened in Ideas with the text',await p.evaluate(()=>S.mode==='ideas'&&IDEAS.dump.length>5),await p.evaluate(()=>S.mode+'|'+IDEAS.dump.slice(0,25)));
// landing deep links
for(const m of ['ad','image','video','voice']){await p.goto('http://localhost:3365/studio?mode='+m);await p.waitForTimeout(1500);ok('?mode='+m,await p.evaluate(()=>S.mode)===m,await p.evaluate(()=>S.mode))}
await p.goto('http://localhost:3365/studio?topup=1');await p.waitForTimeout(2200);ok('?topup=1 opens a modal',await p.locator('.modal, #modal, .mbox').count()>0);
ok('page errors',!errs.length,errs.slice(0,3).join(' | '));
console.log(R.join('\n'));await b.close()})()
