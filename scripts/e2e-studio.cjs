const {chromium}=require('playwright');
const R=[];const ok=(n,c,d='')=>{R.push((c?'PASS ':'FAIL ')+n+(d?' — '+d:''));};
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1366,height:850}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|favicon/.test(m.text()))errs.push(m.text())});
p.on('dialog',d=>d.dismiss());
await p.goto('http://localhost:3365/studio');await p.waitForTimeout(1500);
// every rail mode renders
for(const m of ['ideas','templates','image','video','voice','edit','schedule','media','chars','products','series']){
 const btn=p.locator('.ws-rail [data-mode="'+m+'"]').first();
 if(!(await btn.count())){ok('rail '+m,false,'no button');continue}
 await btn.evaluate(e=>e.click());await p.waitForTimeout(450);
 const mode=await p.evaluate(()=>S.mode);const empty=await p.evaluate(()=>(document.querySelector('#main')||document.querySelector('main')).innerText.trim().length);
 ok('rail '+m,mode===m&&empty>20,mode+' text='+empty);
}
// token button + topup
await p.click('.tok');await p.waitForTimeout(700);ok('token button opens a modal',await p.locator('.modal h2, #modal h2, .mbox h2').count()>0,(await p.locator('.modal h2, #modal h2, .mbox h2').first().textContent().catch(()=>'')));
await p.keyboard.press('Escape');await p.waitForTimeout(300);
ok('Esc closes modal',await p.locator('.modal:visible, #modal:visible').count()===0);
// profile menu
await p.click('#me-av');await p.waitForTimeout(400);ok('avatar opens menu',await p.locator('#pop:not([hidden])').count()===1);await p.keyboard.press('Escape');await p.mouse.click(5,300);
// composer flows per mode: type, estimate shows cost, button enabled
for(const [m,txt] of [['image','red hoodie product photo'],['video','slow orbit around a hoodie'],['voice','Hai semua, jom beli sekarang']]){
 await p.locator('.ws-rail [data-mode="'+m+'"]').first().evaluate(e=>e.click());await p.waitForTimeout(500);
 await p.fill('#prompt',txt);await p.waitForTimeout(700);
 const cost=await p.evaluate(()=>document.querySelector('#est')?.textContent||'');const dis=await p.evaluate(()=>document.querySelector('#go')?.disabled);
 ok('composer '+m+' shows cost & enabled',/\d/.test(cost)&&!dis,cost);
 // pills open a menu
 const pill=p.locator('#composer [data-pill]').first();if(await pill.count()){await pill.click();await p.waitForTimeout(250);ok('pill menu opens ('+m+')',await p.locator('#pop:not([hidden])').count()===1);await p.keyboard.press('Escape');await p.mouse.click(5,300);await p.waitForTimeout(150)}
 const tune=p.locator('#composer [data-more]');if(await tune.count()){const before=await p.locator('#composer [data-pill]').count();await tune.click();await p.waitForTimeout(400);const after=await p.locator('#composer [data-pill]').count();ok('More options toggles ('+m+')',after!==before,before+'->'+after);await p.locator('#composer [data-more]').click();await p.waitForTimeout(300)}
 // + menu
 const plus=p.locator('#composer .plus');if(await plus.count()){await plus.click();await p.waitForTimeout(300);ok('+ menu opens ('+m+')',await p.locator('#pop:not([hidden])').count()===1);await p.keyboard.press('Escape');await p.mouse.click(5,300);await p.waitForTimeout(150)}
}
// image generate -> job appears
await p.locator('.ws-rail [data-mode="image"]').first().evaluate(e=>e.click());await p.waitForTimeout(500);await p.fill('#prompt','red hoodie product photo');await p.waitForTimeout(600);
const n0=await p.evaluate(()=>S.jobs[0]?.id);await p.click('#go');await p.waitForTimeout(3500);
ok('image Generate creates a job',await p.evaluate(()=>S.jobs[0]?.id)!==n0);
// ad without product => validation, not crash
await p.evaluate(()=>setMode('ad'));await p.waitForTimeout(500);await p.click('#go');await p.waitForTimeout(500);
ok('ad without product shows hint/menu',await p.locator('#pop:not([hidden]), .toast:visible, #toast:visible').count()>=1);
ok('page errors',!errs.length,errs.slice(0,4).join(' | '));
console.log(R.join('\n'));await b.close()})()
