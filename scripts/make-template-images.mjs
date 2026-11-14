// Optional: generate real sample covers with your FAL_KEY (13 images, FLUX schnell, well under $1).
// Run:  node scripts/make-template-images.mjs   -> writes public/tpl/<id>.jpg (the Templates page uses them automatically)
import fs from 'node:fs';
if (fs.existsSync('.env')) for (const l of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, ''); }
const KEY = process.env.FAL_KEY; if (!KEY) { console.error('No FAL_KEY in .env'); process.exit(1); }
const P = {
  flash: 'bright red flash sale promo, skincare bottles with yellow discount burst, bold product ad, studio',
  review: 'young Malaysian woman holding a skincare bottle talking to camera, casual bedroom, natural light, selfie style',
  unbox: 'hands opening a cardboard parcel revealing a product, warm light, top-down',
  ba: 'split before and after skincare comparison, clear skin, clean beauty photo',
  pack: 'three skincare bottles on white seamless background, soft studio light, ecommerce packshot',
  life: 'skincare bottle on wooden shelf in cozy Malaysian home, morning window light',
  raya: 'Hari Raya festive scene, ketupat and pelita lights, warm green and gold, product on table',
  orbit: 'perfume bottle on dark reflective surface, dramatic rim light, cinematic product shot',
  story: 'storyboard frames of a product ad on a desk, pencil sketches, purple tones',
  drama: 'cinematic close-up of a woman crying by a rainy window at night, moody, micro drama still',
  trailer: 'cinematic movie trailer still, lone figure on a mountain at dusk, anamorphic',
  explain: 'friendly presenter explaining with a whiteboard, blue background, social video still',
  bm: 'microphone and sound waves on dark blue background, podcast voice-over cover',
};
fs.mkdirSync('public/tpl', { recursive: true });
for (const [id, prompt] of Object.entries(P)) {
  const r = await fetch('https://fal.run/fal-ai/flux/schnell', { method: 'POST', headers: { Authorization: 'Key ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, image_size: { width: 768, height: 432 }, num_images: 1, output_format: 'jpeg' }) });
  const j = await r.json(); const url = j.images?.[0]?.url; if (!url) { console.log(id, 'FAILED', JSON.stringify(j).slice(0, 120)); continue; }
  fs.writeFileSync(`public/tpl/${id}.jpg`, Buffer.from(await (await fetch(url)).arrayBuffer())); console.log(id, 'ok');
}
