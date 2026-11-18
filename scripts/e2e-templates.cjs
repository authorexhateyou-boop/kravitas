const {chromium}=require('playwright');const ok=(n,c,d='')=>console.log((c?'PASS ':'FAIL ')+n+(d?' — '+d:''));
const D=require('os').tmpdir()+'/';require('fs').writeFileSync(D+'prod.png',Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64'));
const wait=async(p,fn,arg,ms=60000)=>{const t=Date.now();while(Date.now()-t<ms){if(await p.evaluate(fn,arg))return true;await p.waitForTimeout(800)}return false};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1366,height:850}})).newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
let last=null;p.on('request',r=>{if(r.url().endsWith('/api/jobs')&&r.method()==='POST')last=JSON.parse(r.postData())});
for(const id of ['review','flash','motion','affil','unbox','ba']){
 await p.goto('http://localhost:3365/studio?tpl='+id);await p.waitForTimeout(1600);
 const t0=await p.evaluate(()=>S.jobs[0]?.id);await p.click('#go');
 const made=await wait(p,(t0)=>S.jobs[0]?.id!==t0&&S.jobs[0].status!=='running',t0,30000);
 const r=await p.evaluate(()=>[S.jobs[0].status,S.jobs[0].stage,S.jobs[0].error||''].join(' '));
 ok(id+': no product, generates',made&&!/error|failed/.test(r),r+' brief sent='+!!(last&&last.input.notes&&last.input.notes.length>100));
}
// with a picture added by +
await p.goto('http://localhost:3365/studio?tpl=review');await p.waitForTimeout(1600);
await p.click('#composer .plus');await p.waitForTimeout(300);
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('#pop [data-v="ref"]')]);await fc.setFiles([D+'prod.png']);await p.waitForTimeout(1500);
await p.click('#go');await p.waitForTimeout(1500);
ok('picture from + is sent as the product photo',!!(last&&last.input.refImages&&last.input.refImages.length===1));
// saved product still works
await p.goto('http://localhost:3365/studio?tpl=review');await p.waitForTimeout(1600);
await p.click('#composer .plus');await p.waitForTimeout(300);await p.locator('#pop [data-v^="p:"]').first().click();await p.waitForTimeout(500);
await p.click('#go');await p.waitForTimeout(1500);ok('saved product is used',!!(last&&last.input.productId));
// image + video templates without a picture
for(const id of ['pack','thumb','orbit','property']){await p.goto('http://localhost:3365/studio?tpl='+id);await p.waitForTimeout(1600);const t0=await p.evaluate(()=>S.jobs[0]?.id);await p.click('#go');ok(id+': generates with no picture',await wait(p,(t0)=>S.jobs[0]?.id!==t0,t0,15000));}
console.log('errors',errs);await b.close()})()
