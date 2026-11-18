const {chromium}=require('playwright');const ok=(n,c,d='')=>console.log((c?'PASS ':'FAIL ')+n+(d?' — '+d:''));
const wait=async(p,fn,arg,ms=60000)=>{const t=Date.now();while(Date.now()-t<ms){if(await p.evaluate(fn,arg))return true;await p.waitForTimeout(800)}return false};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1366,height:850}})).newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
const dialogs=[];p.on('dialog',d=>{dialogs.push(d.message().split('\n')[0]);d.accept()});
await p.goto('http://localhost:3365/studio');await p.waitForTimeout(1400);
// ---------- A. Ideas -> questions -> ideas with preview ----------
await p.evaluate(()=>setMode('ideas'));await p.waitForTimeout(300);
await p.fill('#id-dump','turn my cat photo into a cute 3D cartoon character for my sticker shop');await p.click('#id-go');
await wait(p,()=>!!document.querySelector('.id-ask, [data-sb]'));const ask=p.locator('#ask-go, [data-askgo], .id-ask .pri').first();if(await ask.count()){await ask.click()}
ok('ideas appear',await wait(p,()=>document.querySelectorAll('.id-idea').length>0));
ok('first idea auto-previews',await wait(p,()=>!!document.querySelector('#idp-0 img'),null,40000),await p.evaluate(()=>document.querySelector('#idp-0')?.innerText.slice(0,40)));
ok('other ideas offer a preview button',await p.locator('#idp-1 [data-prev]').count()===1);
await p.click('#idp-1 [data-prev]');ok('preview button works',await wait(p,()=>!!document.querySelector('#idp-1 img'),null,40000));
await p.screenshot({path:'/tmp/f-ideas.png'});
// continue -> Image with preview open
const m0=await p.evaluate(()=>IDEAS.result.ideas[0].mode);
await p.locator('.id-idea').first().locator('[data-use]').click();await p.waitForTimeout(900);
ok('Continue goes to the tool',await p.evaluate(()=>S.mode)===(m0==='image'?'image':m0),m0+' -> '+await p.evaluate(()=>S.mode));
if(m0==='image')ok('preview opens to touch up',await p.locator('#modal .info').count()===1);
await p.evaluate(()=>closeModal&&closeModal());
// ---------- B. Next buttons: image -> video -> voice -> edit ----------
const imgJob=await p.evaluate(()=>S.jobs.find(j=>j.status==='done'&&j.tool==='image'&&j.outputs[0]?.type==='image').id);
await p.evaluate(i=>jobModal(i),imgJob);await p.waitForTimeout(600);
ok('image window: Next: make it move',/make it move/.test(await p.textContent('#nextstep')));
await p.click('#nextstep');await p.waitForTimeout(600);ok('-> Video with the picture as first frame',await p.evaluate(()=>S.mode==='video'&&!!F().startImage));
await p.fill('#prompt','slow push in, hair moves in the wind');await p.waitForTimeout(600);await p.click('#go');
ok('video made',await wait(p,()=>S.jobs[0]?.tool==='shot'&&S.jobs[0].status==='done',null,60000));
const vj=await p.evaluate(()=>S.jobs[0].id);await p.evaluate(i=>jobModal(i),vj);await p.waitForTimeout(600);
ok('video window: Next: add a voice',/add a voice/.test(await p.textContent('#nextstep')));
await p.click('#nextstep');await p.waitForTimeout(600);ok('-> Voice, showing which video',await p.evaluate(()=>S.mode==='voice')&&await p.locator('.projnote').count()===1);
await p.fill('#prompt','Hai semua! Sticker comel ni baru masuk kedai.');await p.waitForTimeout(600);await p.click('#go');
ok('voice made',await wait(p,()=>S.jobs[0]?.outputs?.some(o=>o.type==='audio')&&S.jobs[0].status==='done',null,40000));
const aj=await p.evaluate(()=>S.jobs[0].id);await p.evaluate(i=>jobModal(i),aj);await p.waitForTimeout(600);
ok('voice window: Next: put it together',/put it together/.test(await p.textContent('#nextstep')));
await p.click('#nextstep');await p.waitForTimeout(800);
ok('-> Edit with video + voice loaded',await p.evaluate(()=>S.mode==='edit'&&EDIT.clips.length===1&&EDIT.voiceMode==='library'&&!!EDIT.voiceUrl),await p.evaluate(()=>S.mode+' clips='+EDIT.clips.length+' voice='+EDIT.voiceMode));
await p.screenshot({path:'/tmp/f-edit.png'});
// render in edit
const rb=p.locator('#ed-go, #main .go').first();if(await rb.count()){await rb.click();ok('edit render made',await wait(p,()=>S.jobs[0]?.tool==='edit'&&S.jobs[0].status!=='running',null,60000),await p.evaluate(()=>S.jobs[0].tool+' '+S.jobs[0].status+' '+(S.jobs[0].error||'')));
 const ej=await p.evaluate(()=>S.jobs[0].id);await p.evaluate(i=>jobModal(i),ej);await p.waitForTimeout(600);
 const nl=await p.textContent('#nextstep').catch(()=>'');ok('edit window: Next: post it',/post it/.test(nl),nl);
 if(/post it/.test(nl)){await p.click('#nextstep');await p.waitForTimeout(700);ok('-> post / schedule window',await p.locator('#modal h2').count()>0,await p.textContent('#modal h2').catch(()=>''));await p.evaluate(()=>closeModal());}}
// ---------- C. Make it for me ----------
await p.evaluate(()=>{IDEAS.sb=null;S.mode='ideas';renderAll()});await p.waitForTimeout(800);
const vi=await p.evaluate(()=>IDEAS.result.ideas.findIndex(x=>x.mode!=='ad'));
await p.locator('.id-idea').nth(vi).locator('[data-auto]').click();
ok('storyboard planned + real images',await wait(p,()=>IDEAS.sb&&IDEAS.sb.panels.length>0&&IDEAS.sb.panels.every(x=>x.kind==='keyframe'),null,90000));
ok('asks before video, then makes it',await wait(p,()=>IDEAS.sb&&IDEAS.sb.step===4,null,30000),JSON.stringify(dialogs));
ok('finished video in step 4',await wait(p,()=>!!document.querySelector('.sb2-vid'),null,90000));
console.log('errors',errs);await b.close()})()
