// Make real covers for the Templates page (and the landing page cards) from the prompts in public/templates.js.
//
//   node scripts/make-template-covers.mjs                 -> a still for every template that has none yet (public/tpl/<id>.jpg)
//   node scripts/make-template-covers.mjs --video         -> also a 5s looping clip from each still (public/tpl/<id>.mp4)
//   node scripts/make-template-covers.mjs drama review    -> only these templates
//   node scripts/make-template-covers.mjs --force ...     -> redo even if the file exists
//   node scripts/make-template-covers.mjs --nine --video  -> just the nine landing-page cards, with clips
//
// Cost (rough): still = Nano Banana 2 ~ $0.04-0.08 each; clip = MiniMax H3 Turbo 5s ~ $0.08 each. All 19 with video ~ $3.
// Edit the cast or cover prompts in public/templates.js (CAST and COVER), then run again with --force for that id.
import fs from 'node:fs';
import vm from 'node:vm';

if (fs.existsSync('.env')) for (const l of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, ''); }
const KEY = process.env.FAL_KEY; if (!KEY) { console.error('No FAL_KEY in .env'); process.exit(1); }

const args = process.argv.slice(2), VIDEO = args.includes('--video'), FORCE = args.includes('--force');
// --nine = the nine cards on the landing page ("Nine things, one studio")
const NINE = ['review', 'motion', 'affil', 'drama', 'orbit', 'story', 'pack', 'thumb', 'bm'];
const only = args.includes('--nine') ? NINE : args.filter((a) => !a.startsWith('--'));

// load the template list exactly as the app sees it
const win = {}; const ctx = { window: win, document: { addEventListener() {} }, console };
vm.runInNewContext(fs.readFileSync('public/templates.js', 'utf8'), ctx);
const { T, COVER, withChar } = win.KV_TEMPLATES;

const H = { Authorization: 'Key ' + KEY, 'Content-Type': 'application/json' };
async function run(id, input) { // fal queue: submit, wait, fetch result
  const sub = await (await fetch(`https://queue.fal.run/${id}`, { method: 'POST', headers: H, body: JSON.stringify(input) })).json();
  if (!sub.status_url) throw new Error(JSON.stringify(sub).slice(0, 200));
  for (let i = 0; i < 180; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const st = await (await fetch(sub.status_url, { headers: H })).json();
    if (st.status === 'COMPLETED') return (await fetch(sub.response_url, { headers: H })).json();
    if (st.status === 'FAILED' || st.error) throw new Error(JSON.stringify(st).slice(0, 200));
  }
  throw new Error('timed out');
}
const save = async (url, file) => fs.writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
const STYLE = 'Photorealistic, natural skin texture, no text, no letters, no logos, no watermark.';

fs.mkdirSync('public/tpl', { recursive: true });
for (const t of T) {
  if (only.length && !only.includes(t.id)) continue;
  const c = COVER[t.id]; if (!c) { console.log(t.id, 'no cover prompt, skipped'); continue; }
  const jpg = `public/tpl/${t.id}.jpg`, mp4 = `public/tpl/${t.id}.mp4`;
  try {
    if (FORCE || !fs.existsSync(jpg)) {
      const r = await run('fal-ai/nano-banana-2', { prompt: `${withChar(c.img, t)}. ${STYLE}`, aspect_ratio: '16:9', num_images: 1, output_format: 'jpeg', resolution: '1K' });
      const url = r.images?.[0]?.url; if (!url) throw new Error('no image: ' + JSON.stringify(r).slice(0, 150));
      await save(url, jpg); console.log(t.id, 'still ok');
    }
    if (VIDEO && (FORCE || !fs.existsSync(mp4))) {
      const still = `data:image/jpeg;base64,${fs.readFileSync(jpg).toString('base64')}`;
      const r = await run('minimax/h3-max-turbo/image-to-video', { prompt: withChar(c.vid, t), image_url: still, duration: 5, resolution: '768P', prompt_expansion_mode: 'balanced' });
      const url = r.video?.url; if (!url) throw new Error('no video: ' + JSON.stringify(r).slice(0, 150));
      await save(url, mp4); console.log(t.id, 'clip ok');
    }
  } catch (e) { console.log(t.id, 'FAILED', e.message); }
}
console.log('Done. Open Templates in the studio to see them. Commit public/tpl/ to put them live.');
