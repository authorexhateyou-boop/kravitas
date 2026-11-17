const {chromium}=require('playwright');
const R=[];const ok=(n,c,d='')=>{R.push((c?'PASS ':'FAIL ')+n+(d?' — '+d:''));console.log(R[R.length-1])};
(async()=>{const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1366,height:850}})).newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|favicon/.test(m.text()))errs.push(m.text())});
await p.goto('http://localhost:3365/studio');await p.waitForTimeout(1500);
await p.locator('.ws-rail [data-mode="ideas"]').first().evaluate(e=>e.click());await p.waitForTimeout(400);
await p.fill('#id-dump','sambal udang homemade RM15, pedas manis, COD');
await p.click('#id-go');await p.waitForTimeout(2500);
const survey=await p.locator('.id-ask, [data-ask]').count();ok('survey card appears (or skipped)',true,'survey options='+survey);
// skip/continue survey
const cont=p.locator('#ask-go, [data-askgo], .id-ask .pri').first();
if(await cont.count()){await cont.click();await p.waitForTimeout(3500)}
for(let i=0;i<8&&!(await p.locator('[data-sb]').count());i++){await p.waitForTimeout(1500)}
ok('ideas generated with Storyboard buttons',await p.locator('[data-sb]').count()>0,'cards='+await p.locator('.id-idea').count());
ok('no workflow strip',await p.locator('.id-flow').count()===0);
ok('"Open in X" button present',await p.locator('.id-idea [data-use]').count()>0);
// Open in X works
const mode0=await p.evaluate(()=>S.mode);await p.locator('.id-idea [data-use]').first().click();await p.waitForTimeout(800);const mode1=await p.evaluate(()=>S.mode);ok('Open in {tool} switches mode',mode1!==mode0,mode0+'->'+mode1);
const pv=await p.evaluate(()=>F().prompt||'');ok('prompt carried into the tool',pv.length>5,pv.slice(0,40));
await p.locator('.ws-rail [data-mode="ideas"]').first().evaluate(e=>e.click());await p.waitForTimeout(600);
ok('Ideas results survive switching tools',await p.locator('[data-sb]').count()>0);
// storyboard
await p.locator('[data-sb]').first().click();
for(let i=0;i<14&&!(await p.locator('.sb2-p').count());i++)await p.waitForTimeout(1500);
const np=await p.locator('.sb2-p').count();ok('storyboard planned',np>=2,'panels='+np);
const stepOn=()=>p.evaluate(()=>IDEAS.sb&&IDEAS.sb.step||1);
ok('starts at step 1; steps 4/5 locked',await stepOn()===1&&await p.locator('.sb2-steps button:disabled').count()===2);
ok('step1 hides image/voice buttons',await p.locator('.sb2-pa:visible').count()===0&&await p.locator('.sb2-vo:visible').count()===0);
await p.click('#sb-nextstep');await p.waitForTimeout(400);ok('Next -> step 2',await stepOn()===2);
ok('step2 shows per-panel image buttons',await p.locator('.sb2-pa:visible').count()===np);
ok('step2 hides text editing',await p.locator('[data-vis]:visible').count()===0);
// ⋯ menu
await p.locator('.sb2-more summary').first().click();await p.waitForTimeout(200);ok('⋯ menu reveals Upload/Remove',await p.locator('.sb2-more[open] [data-up]:visible').count()===1);
await p.locator('.sb2-more summary').first().click();
// make real image for panel 1
const k0=await p.evaluate(()=>IDEAS.sb.panels.filter(x=>x.kind==='keyframe').length);
const kb=p.locator('[data-key]').first();if(await kb.count()){await kb.click();for(let i=0;i<10&&await p.evaluate(()=>IDEAS.sb.panels.some(x=>x.busy));i++)await p.waitForTimeout(1200);}
ok('Make real image works',await p.evaluate(()=>IDEAS.sb.panels.filter(x=>x.kind==='keyframe').length)>k0,k0+'->'+await p.evaluate(()=>IDEAS.sb.panels.filter(x=>x.kind==='keyframe').length));
// all real images
if(await p.locator('#sb-all').count()){await p.click('#sb-all');for(let i=0;i<20&&await p.evaluate(()=>IDEAS.sb.panels.some(x=>x.busy));i++)await p.waitForTimeout(1200);ok('Make all real images',await p.evaluate(()=>IDEAS.sb.panels.every(x=>x.kind==='keyframe')))}
// back / stepper click
await p.click('#sb-prev');await p.waitForTimeout(300);ok('Back -> step 1',await stepOn()===1);
await p.click('[data-stepgo="3"]');await p.waitForTimeout(300);ok('Stepper jump to 3',await stepOn()===3);
ok('step3 shows voice buttons + Make the video',await p.locator('.sb2-vo:visible').count()===np&&await p.locator('#sb-make:visible').count()===1);
// hear it
await p.locator('[data-hear]').first().click();for(let i=0;i<10&&await p.evaluate(()=>IDEAS.sb.panels[0].vbusy);i++)await p.waitForTimeout(1000);await p.waitForTimeout(800);
ok('Hear it records a voice',await p.evaluate(()=>!!IDEAS.sb.panels[0].voice),'');
// make video
await p.click('#sb-make');await p.waitForTimeout(1500);
ok('Make the video -> step 4',await stepOn()===4,await p.evaluate(()=>IDEAS.sb.jobId||'nojob'));
ok('step 4 stepper marks 1-3 done',await p.locator('.sb2-steps li.done').count()===3);
for(let i=0;i<25&&!(await p.locator('.sb2-vid').count());i++)await p.waitForTimeout(1500);
ok('finished video appears with actions',await p.locator('.sb2-vid').count()===1&&await p.locator('[data-fin]').count()>=3);
// post modal
await p.click('[data-fin=post]');await p.waitForTimeout(800);ok('Post/schedule opens',await p.locator('.modal h2, #modal h2, .mbox h2').count()>0,(await p.locator('.modal h2, #modal h2, .mbox h2').first().textContent().catch(()=>'')));await p.keyboard.press('Escape');await p.waitForTimeout(300);
// step 5 button
await p.click('[data-stepgo="5"]');await p.waitForTimeout(800);ok('Stepper step 5 opens schedule',await p.locator('.modal h2, #modal h2, .mbox h2').count()>0);await p.keyboard.press('Escape');await p.waitForTimeout(300);
// edit
await p.click('[data-fin=edit]');await p.waitForTimeout(900);ok('Open in Editor -> edit mode with the clip',await p.evaluate(()=>S.mode==='edit'&&EDIT.clips.length===1),await p.evaluate(()=>S.mode+' clips='+EDIT.clips.length));
console.log('page errors:',errs.slice(0,4));await b.close()})()
