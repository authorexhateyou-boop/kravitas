const {chromium}=require('playwright');
const ok=(n,c,d='')=>console.log((c?'PASS ':'FAIL ')+n+(d?' — '+d:''));
(async()=>{const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1366,height:850}})).newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|favicon/.test(m.text()))errs.push(m.text())});
await p.goto('http://localhost:3365/studio');await p.waitForTimeout(1500);
// make an image job and open it
await p.locator('.ws-rail [data-mode="image"]').first().evaluate(e=>e.click());await p.waitForTimeout(400);await p.fill('#prompt','red hoodie flat lay');await p.waitForTimeout(500);await p.click('#go');
for(let i=0;i<12&&!(await p.evaluate(()=>S.jobs.some(j=>j.tool==='image'&&j.status==='done'&&j.title&&/hoodie/.test(j.title))));i++)await p.waitForTimeout(1200);
const id=await p.evaluate(()=>S.jobs.find(j=>j.tool==='image'&&j.status==='done'&&j.outputs[0]?.type==='image')?.id);ok('have a finished image job',!!id,id);
const open=async(id)=>{await p.evaluate(i=>jobModal(i),id);await p.waitForTimeout(700)};
const btns=async()=>p.$$eval('.modal .acts button, .modal .acts a, #modal .acts button, #modal .acts a',e=>e.map(x=>x.textContent.trim().replace(/\s+/g,' ')));
await open(id);const list=await btns();console.log('image modal buttons:',list.length,JSON.stringify(list));
// edit this image
await p.click('#imgedit');await p.waitForTimeout(500);ok('Edit this image shows the edit box',await p.locator('#ebt').isVisible());
await p.fill('#ebt','make it dark green');await p.waitForTimeout(600);ok('edit cost shown',/\d/.test(await p.textContent('#ebc1')),await p.textContent('#ebc1'));
await p.keyboard.press('Escape');await p.waitForTimeout(300);
// animate
await open(id);await p.click('#anim');await p.waitForTimeout(900);ok('Animate -> Video mode with start frame',await p.evaluate(()=>S.mode==='video'&&!!F().startImage),await p.evaluate(()=>S.mode+' start='+!!F().startImage));
// edit & add sound
await open(id);await p.click('#toedit');await p.waitForTimeout(900);ok('Edit & add sound -> Edit mode with clip',await p.evaluate(()=>S.mode==='edit'&&EDIT.clips.length>=1));
// favourite / reuse / copy
await open(id);await p.click('.mm summary');await p.click('#favm');await p.waitForTimeout(300);ok('Favourite toggles',/Saved/.test(await p.textContent('#favm')));
await p.click('#reuse');await p.waitForTimeout(700);ok('Reuse settings goes to tool',await p.evaluate(()=>S.mode==='image'),await p.evaluate(()=>S.mode));
// video job: make one via video mode
await p.locator('.ws-rail [data-mode="video"]').first().evaluate(e=>e.click());await p.waitForTimeout(400);await p.fill('#prompt','slow orbit around a hoodie');await p.waitForTimeout(500);await p.click('#go');
for(let i=0;i<25&&!(await p.evaluate(()=>S.jobs.some(j=>j.tool==='shot'&&j.status==='done')));i++)await p.waitForTimeout(1500);
const vid=await p.evaluate(()=>S.jobs.find(j=>j.tool==='shot'&&j.status==='done')?.id);ok('finished video job',!!vid);
if(vid){await open(vid);console.log('video modal buttons:',JSON.stringify(await btns()));
 await p.click('#post');await p.waitForTimeout(700);ok('Post/schedule from video',await p.locator('.modal h2, #modal h2').count()>0);await p.keyboard.press('Escape');await p.waitForTimeout(300);
 await open(vid);await p.click('.mm summary');await p.click('#contin');await p.waitForTimeout(900);ok('Continue from last frame -> video mode',await p.evaluate(()=>S.mode==='video'));
}
// Edit mode: add clip, render
await p.locator('.ws-rail [data-mode="edit"]').first().evaluate(e=>e.click());await p.waitForTimeout(600);
console.log('edit mode buttons:',JSON.stringify(await p.$$eval('#main button',e=>e.map(x=>x.textContent.trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,25))));
// schedule mode
await p.locator('.ws-rail [data-mode="schedule"]').first().evaluate(e=>e.click());await p.waitForTimeout(600);
console.log('schedule buttons:',JSON.stringify(await p.$$eval('#main button',e=>e.map(x=>x.textContent.trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,20))));
console.log('page errors:',errs.slice(0,4));await b.close()})()
