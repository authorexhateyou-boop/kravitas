const {chromium}=require('playwright');const ok=(n,c,d='')=>console.log((c?'PASS ':'FAIL ')+n+(d?' — '+d:''));
const wait=async(p,fn,arg,ms=60000)=>{const t=Date.now();while(Date.now()-t<ms){if(await p.evaluate(fn,arg))return true;await p.waitForTimeout(800)}return false};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1366,height:850}})).newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
let last=null;p.on('request',r=>{if(r.url().endsWith('/api/jobs')&&r.method()==='POST')last=JSON.parse(r.postData())});
await p.goto('http://localhost:3365/studio');await p.waitForTimeout(1400);await p.evaluate(()=>{S.mode='templates';renderAll()});await p.waitForTimeout(700);
const first=await p.$eval('[data-tu]',e=>e.dataset.tu);ok('60-second template is first',first==='reels60',first);
await p.screenshot({path:'/tmp/t60-list.png',clip:{x:280,y:60,width:1086,height:520}});
await p.click('[data-tu="reels60"]');await p.waitForTimeout(1200);
const st=await p.evaluate(()=>({mode:S.mode,scenes:F().scenes,tier:F().tier,len:(F().prompt||'').length}));ok('opens Story with 10 scenes, Quick tier, full prompt',st.mode==='story'&&st.scenes===10&&st.tier==='motion'&&st.len>300,JSON.stringify(st));
await p.waitForTimeout(800);console.log('cost shown:',await p.textContent('#cap').catch(()=>''));
await p.screenshot({path:'/tmp/t60-comp.png'});
const t0=Date.now();const j0=await p.evaluate(()=>S.jobs[0]?.id);await p.click('#go');
ok('job sent with 10 scenes, 60s',!!(last&&last.input.scenes===10&&last.input.seconds===60),JSON.stringify(last&&{s:last.input.scenes,sec:last.input.seconds}));
ok('finishes',await wait(p,j=>S.jobs[0]?.id!==j&&S.jobs[0].status!=='running',j0,120000));
console.log('took',Math.round((Date.now()-t0)/1000),'s (demo)',await p.evaluate(()=>JSON.stringify([S.jobs[0].status,S.jobs[0].error||'',S.jobs[0].cost,(S.jobs[0].outputs||[]).filter(o=>o.type==='image').length+' scenes',(S.jobs[0].outputs||[]).some(o=>o.type==='video')])));
console.log('errors',errs);await b.close()})()
