const {chromium}=require('playwright');const ok=(n,c,d='')=>console.log((c?'PASS ':'FAIL ')+n+(d?' — '+d:''));
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1366,height:850}})).newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
await p.goto('http://localhost:3365/studio?mode=video');await p.waitForTimeout(1600);
// pretend to be a free cloud user so locks would show if any remained
await p.evaluate(()=>{S.app.mode='cloud';S.app.access='free';S.app.plan=null;});
await p.locator('#composer [data-pill="model"], #composer .mchip').first().click();await p.waitForTimeout(1500);
const rows=await p.$$eval('#pop .mp-row',a=>a.map(x=>x.innerText.replace(/\s+/g,' ').trim()));console.log(rows.join('\n'));
ok('no locked rows',await p.locator('#pop .locked').count()===0);
ok('every row shows a token price',rows.every(r=>/✦ \d+/.test(r)));
ok('Seedance 2.5 listed',rows.some(r=>/Seedance 2\.5/.test(r)));
await p.screenshot({path:'/tmp/mp-video.png'});
await p.locator('#pop .mp-row',{hasText:'Seedance 2.5 · 720p'}).click();await p.waitForTimeout(800);
ok('picked Seedance 2.5',await p.evaluate(()=>F().model)==='seedance-25');
await p.fill('#prompt','slow orbit');await p.waitForTimeout(800);console.log('composer cost',await p.textContent('#cap'));
const t0=await p.evaluate(()=>S.jobs[0]?.id);await p.click('#go');await p.waitForTimeout(2000);
ok('free user can generate with Seedance 2.5',await p.evaluate(t=>S.jobs[0]?.id!==t,t0),await p.evaluate(()=>document.querySelector('.toast,#toast')?.textContent||''));
for(const m of ['image','ideas']){await p.evaluate(m=>setMode(m),m);await p.waitForTimeout(600);if(m==='ideas'){await p.evaluate(()=>{IDEAS.sb=null;IDEAS.result=null;renderAll()});await p.waitForTimeout(400);await p.evaluate(()=>window.openModelPicker(document.querySelector('#id-model'),'ideas'));}else{await p.evaluate(()=>window.openModelPicker(document.querySelector('#composer [data-pill="quality"]')||document.querySelector('#composer .pill'),'image'));}await p.waitForTimeout(1200);
 const r=await p.$$eval('#pop .mp-row',a=>a.map(x=>x.innerText.replace(/\s+/g,' ').trim()));console.log(m,':',r.join(' | '));ok(m+': priced, unlocked',r.length>0&&r.every(x=>/✦ \d+/.test(x))&&await p.locator('#pop .locked').count()===0);await p.keyboard.press('Escape');await p.mouse.click(4,400);}
console.log('errors',errs);await b.close()})()
