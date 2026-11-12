/* Kravitas: home bento, avatars, voice cloning, storyboard editor, auto-posting and plans.
   Loaded after app.js and uses its helpers ($, esc, api, toast, modal, S, F, …). */

const RM = (n) => `${CFG.currency === 'MYR' || !CFG.currency ? 'RM' : CFG.currency + ' '}${n}`;
const PLATFORM_META = {
  tiktok: { name: 'TikTok', icon: '♪' }, instagram: { name: 'Instagram', icon: '◎' }, facebook: { name: 'Facebook', icon: 'f' },
  youtube: { name: 'YouTube', icon: '▶' }, threads: { name: 'Threads', icon: '@' },
};
const ACTIONS = {
  avatars: () => avatarLibraryModal(),
  createAvatar: () => avatarBuilderModal(),
  clone: () => voiceCloneModal(),
  brainstorm: () => { setMode('ad'); renderAll(); runBrainstorm(); },
  batch: () => { setMode('ad'); S.forms.ad = { ...(S.forms.ad || DEFAULTS.ad()), variants: 5 }; renderAll(); toast('5 variations set. Add a product and hit Generate'); },
  plans: () => accountModal(),
  clone: () => voiceCloneModal(),
  newFriend: () => friendModal(),
  newProduct: () => productModal(),
};

// ---------- illustrated portraits (preview thumbnails for avatar presets / builder) ----------
const SKIN = { fair: '#f3d2bd', 'light tan': '#e7b897', 'warm tan': '#d9a07a', 'medium brown': '#b97c55', 'deep brown': '#7f5136' };
const HUE = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
function drawPortrait(look = {}, size = 400) {
  const c = document.createElement('canvas'); c.width = size; c.height = Math.round(size * 1.25);
  const x = c.getContext('2d'); const W = c.width, H = c.height, u = W / 100;
  const h = HUE(look.bg || look.outfit || 'x');
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `hsl(${h},28%,82%)`); g.addColorStop(1, `hsl(${(h + 40) % 360},22%,58%)`);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const skin = SKIN[look.skin] || SKIN['warm tan'];
  const hair = String(look.hair || '').toLowerCase();
  const hijab = hair.includes('hijab') || hair.includes('tudung');
  const hijabCol = hair.includes('pastel') ? `hsl(${(h + 180) % 360},45%,80%)` : hair.includes('navy') ? '#22304d' : hair.includes('black') ? '#1b1b1f' : `hsl(${(h + 200) % 360},30%,55%)`;
  const outfit = `hsl(${(HUE(look.outfit || 'o') + 20) % 360},${look.outfit?.includes('black') ? 0 : 35}%,${look.outfit?.includes('black') ? 14 : 45}%)`;
  const cx = W / 2, fy = H * 0.42;
  // shoulders
  x.fillStyle = outfit; x.beginPath(); x.ellipse(cx, H * 1.02, 46 * u, 34 * u, 0, Math.PI, 0); x.fill();
  // neck
  x.fillStyle = skin; x.fillRect(cx - 8 * u, fy + 18 * u, 16 * u, 18 * u);
  if (hijab) { // hijab drape behind face and over shoulders
    x.fillStyle = hijabCol; x.beginPath(); x.ellipse(cx, fy + 2 * u, 27 * u, 31 * u, 0, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.moveTo(cx - 27 * u, fy + 6 * u); x.quadraticCurveTo(cx, fy + 60 * u, cx + 27 * u, fy + 6 * u); x.lineTo(cx + 34 * u, H * 0.85); x.lineTo(cx - 34 * u, H * 0.85); x.fill();
  } else if (hair.includes('long') || hair.includes('wavy')) {
    x.fillStyle = '#1d1512'; x.beginPath(); x.ellipse(cx, fy + 10 * u, 25 * u, 38 * u, 0, 0, Math.PI * 2); x.fill();
  }
  // face
  x.fillStyle = skin; x.beginPath(); x.ellipse(cx, fy, 19 * u, 23 * u, 0, 0, Math.PI * 2); x.fill();
  if (!hijab) { // hair cap
    x.fillStyle = '#1d1512'; x.beginPath();
    if (hair.includes('bob')) { x.ellipse(cx, fy - 8 * u, 22 * u, 20 * u, 0, Math.PI, 0); x.fill(); x.fillRect(cx - 22 * u, fy - 8 * u, 6 * u, 22 * u); x.fillRect(cx + 16 * u, fy - 8 * u, 6 * u, 22 * u); }
    else { x.ellipse(cx, fy - 12 * u, 20 * u, 14 * u, 0, Math.PI, 0); x.fill(); }
  }
  // eyes, brows, smile
  x.fillStyle = '#1b1b1f'; [-7, 7].forEach((d) => { x.beginPath(); x.ellipse(cx + d * u, fy - 1 * u, 1.7 * u, 2.2 * u, 0, 0, Math.PI * 2); x.fill(); });
  x.strokeStyle = '#3a2a22'; x.lineWidth = 1.2 * u; x.lineCap = 'round';
  [-7, 7].forEach((d) => { x.beginPath(); x.moveTo(cx + d * u - 3 * u, fy - 6 * u); x.lineTo(cx + d * u + 3 * u, fy - 6.5 * u); x.stroke(); });
  x.strokeStyle = '#a24a3a'; x.lineWidth = 1.6 * u; x.beginPath(); x.arc(cx, fy + 7 * u, 6 * u, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
  if (hair.includes('beard')) { x.fillStyle = 'rgba(29,21,18,.55)'; x.beginPath(); x.ellipse(cx, fy + 14 * u, 15 * u, 9 * u, 0, 0, Math.PI); x.fill(); }
  return c.toDataURL('image/jpeg', 0.86);
}
const portraitCache = new Map();
const portrait = (look, key) => { const k = key || JSON.stringify(look); if (!portraitCache.has(k)) portraitCache.set(k, drawPortrait(look)); return portraitCache.get(k); };

// ---------- home (bento) ----------
// ---------- home: studio bento (direct the shot · templates · character · storyboard · style) ----------
const HOME_STYLES = [['photo', 'Realistic', 'True to ref'], ['cinematic', 'Cinematic', 'Live-action'], ['3d', '3D animated', 'Family film'], ['anime', 'Anime', 'Bold colour'], ['clay', 'Claymation', 'Handmade'], ['storybook', 'Storybook', 'Watercolour']];
const HOME_TPLS = [
  ['🌙', 'Raya greeting', 'greets family at a warmly lit kampung house at dusk, pelita lights glowing', 'dolly-in', 'cinematic'],
  ['☕', 'Café promo', 'sips an iced kopi in a sunny café, condensation on the glass', 'orbit', 'photo'],
  ['📦', 'Product reveal', 'unveils a new product on a clean white pedestal, soft studio light', 'crash', 'cinematic'],
  ['🍜', 'Street food ad', 'serves sizzling char kuey teow at a busy night market', 'pan', 'cinematic'],
  ['🦸', 'Hero walk', 'walks through a misty mountain valley at golden hour', 'crane', '3d'],
  ['🧳', 'Travel vlog', 'explores the colourful streets of Melaka with a backpack', 'pan', 'anime'],
];
const MODEL_NAME = { 'h3-turbo': 'Quick (good value)', 'seedance-fast': 'With sound', 'kling-std': 'Smooth motion', 'kling-pro': 'Best quality' };
const HOME_ASPECT = { '9:16': 'Portrait (TikTok, Reels)', '16:9': 'Landscape (YouTube)', '1:1': 'Square' };
const SHOT = { prompt: 'walks through a misty mountain valley at golden hour', camera: 'dolly-in', model: 'h3-turbo', style: 'photo', aspect: '9:16', friendId: undefined, job: null };
const hueOf = (t) => { let h = 0; for (const c of String(t)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const STYLE_FX = { photo: '', cinematic: 'contrast(1.15) saturate(.9)', '3d': 'saturate(1.5) brightness(1.1)', anime: 'saturate(1.9) contrast(1.1) hue-rotate(-10deg)', clay: 'sepia(.35) saturate(1.2) blur(.4px)', storybook: 'saturate(.8) brightness(1.15) blur(.8px)' };
function shotFriend() {
  if (SHOT.friendId === undefined) SHOT.friendId = S.friends[0]?.id || null;
  return S.friends.find((f) => f.id === SHOT.friendId) || null;
}
function stageHTML(label) {
  const f = shotFriend();
  const who = f?.photos?.[0] ? `background-image:url('${f.photos[0]}')` : '';
  return `<div class="sc cam-${SHOT.camera}" style="--h:${hueOf(SHOT.prompt)};filter:${STYLE_FX[SHOT.style] || 'none'}"><div class="sun"></div><div class="mt"></div><div class="who ${who ? 'ph' : ''}" style="${who}">${who ? '' : esc((f?.name || 'K')[0].toUpperCase())}</div></div><div class="vig"></div><div class="hud">${esc(label)}</div>`;
}
// ---------- studio: one page for Ad, Video, Image, Voice and Schedule ----------
const TOOLS = [['ideas', 'Ideas'], ['ad', 'Ad'], ['video', 'Video'], ['image', 'Image'], ['voice', 'Voice'], ['edit', 'Edit'], ['schedule', 'Schedule']];
const TOOL_JOBS = { ad: ['ugc'], video: ['shot', 'story'], image: ['image', 'avatarGen'], voice: ['voice'], edit: ['edit'], ideas: [], schedule: ['ugc', 'shot', 'story', 'avatar'] };
function recentJobs() {
  const want = TOOL_JOBS[S.mode] || [];
  const mine = S.jobs.filter((j) => want.includes(j.tool));
  return (mine.length ? mine : S.jobs).slice(0, 12);
}
function stripHTML() {
  const list = recentJobs();
  if (!list.length) return '<p class="hs-empty">What you make shows up here.</p>';
  return list.map((j) => {
    const t = thumbOf(j);
    const step = j.steps?.find((x) => x.status === 'running');
    const audio = j.outputs.some((o) => o.type === 'audio');
    return `<button class="hs-card" data-job="${j.id}"><div class="hs-th">${j.status === 'running' ? `<div class="hs-run"><i></i><small>${esc(step?.label || 'Starting')}…</small></div>` : t ? (t.type === 'video' ? `<video src="${t.url}#t=0.3" muted preload="metadata"></video>` : `<img src="${t.url}" alt="">`) : `<div class="hs-run"><small>${j.status === 'error' ? 'Failed' : j.stage === 'review' ? 'Review & approve' : audio ? '♪ Audio' : 'Script'}</small></div>`}</div><p>${esc(j.title)}</p></button>`;
  }).join('');
}
async function shotEstimate() {
  const el = $('#hs-est'); if (!el) return;
  try { const c = (await api('/api/estimate', { tool: 'shot', input: shotInput() })).credits; el.textContent = `✦ ${c}`; const n = c ? Math.floor((S.app.credits || 0) / c) : 0; let cap = $('#hs-cap'); if (!cap) { cap = document.createElement('p'); cap.id = 'hs-cap'; cap.className = 'muted'; cap.style.cssText = 'text-align:center;margin:8px 0 0;font-size:13px'; el.closest('button').after(cap); } cap.textContent = `Your ✦ ${(S.app.credits || 0).toLocaleString()} tokens cover about ${n.toLocaleString()} shot${n === 1 ? '' : 's'} like this.`; } catch { el.textContent = ''; }
}
const shotInput = () => ({ ...DEFAULTS.video(), prompt: SHOT.prompt.trim(), camera: SHOT.camera, model: SHOT.model, style: SHOT.style, aspect: SHOT.aspect, friendId: shotFriend()?.id || null });
async function shotGo(btn) {
  if (!SHOT.prompt.trim()) { toast('Describe the scene first', true); return $('#hs-p')?.focus(); }
  btn.disabled = true;
  try {
    const job = await api('/api/jobs', { tool: 'shot', input: shotInput() });
    S.jobs.unshift(job); SHOT.job = job.id; poll(); renderFeed(); studioTick();
    toast('Rendering your shot…');
  } catch (e) { toast(e.message, true); if (e.code === 'credits' || e.code === 'plan') accountModal(); }
  btn.disabled = false;
}
// called by the job poller
function studioTick() {
  const gal = $('#fl-gal'); if (gal) gal.innerHTML = galleryHTML();
  const strip = $('#hs-strip'); if (!strip) return;
  strip.innerHTML = stripHTML();
  if (S.mode === 'edit') return editTick();
  if (S.mode !== 'video') return;
  const j = SHOT.job && S.jobs.find((x) => x.id === SHOT.job);
  const stage = $('#hs-stage'); if (!j || !stage) return;
  if (j.status === 'running') {
    const done = j.steps.filter((x) => x.status === 'done').length;
    stage.innerHTML = `<div class="sc" style="--h:${hueOf(SHOT.prompt)};filter:blur(14px) brightness(.6)"><div class="sun"></div><div class="mt"></div></div><div class="hud">${esc(j.steps.find((x) => x.status === 'running')?.label || 'Starting')}…</div><div class="prog"><i style="width:${Math.round(((done + 0.5) / (j.steps.length + 1)) * 100)}%"></i></div>`;
  } else if (j.status === 'done') {
    const t = thumbOf(j);
    stage.innerHTML = t?.type === 'video' ? `<video src="${t.url}" autoplay loop muted playsinline controls></video>` : t ? `<img src="${t.url}" alt="">` : stageHTML('Done');
    SHOT.job = null;
  } else { stage.innerHTML = stageHTML('Failed: ' + (j.error || '')); SHOT.job = null; }
}

// ----- editor: clips + voice + music + captions, then post -----
const EDIT = { clips: [], voiceMode: 'none', voiceUrl: '', voiceText: '', newText: '', voice: 'mm:Lively_Girl', lang: 'ms', musicMode: 'none', musicUrl: '', musicPrompt: 'Upbeat lo-fi beat for a product video', musicVol: 20, captions: true, keepSound: true, aspect: '9:16', job: null };
const EDIT_LANGS = { ms: 'Bahasa Melayu', en: 'English', manglish: 'Manglish' };
function editAdd(o, j) {
  if (!o?.url || o.type === 'audio') return;
  if (EDIT.clips.length >= 6) return toast('Up to 6 clips per edit', true);
  EDIT.clips.push({ url: o.url, type: o.type === 'image' ? 'image' : 'video', label: (o.label || j?.title || '').slice(0, 40) });
  if (j?.text && !EDIT.newText) EDIT.newText = j.text.split('\n\n')[0].slice(0, 400);
}
function mediaLibrary() {
  const out = [];
  for (const j of S.jobs) {
    if (j.status !== 'done') continue;
    for (const o of j.outputs) if ((o.type === 'image' || o.type === 'video') && o.url) out.push({ ...o, job: j });
    if (out.length >= 24) break;
  }
  return out;
}
function audioLibrary(kind) {
  return S.jobs.filter((j) => j.status === 'done' && j.tool === 'voice' && (kind === 'voice' ? (j.input?.kind || 'tts') === 'tts' : j.input?.kind === 'music' || j.input?.kind === 'sfx'))
    .map((j) => ({ url: j.outputs.find((o) => o.type === 'audio')?.url, text: j.text || j.input?.text || '', title: j.title, id: j.id })).filter((x) => x.url);
}
function editInput() {
  const i = { clips: EDIT.clips.map((c) => ({ url: c.url, type: c.type })), captions: EDIT.captions, keepSound: EDIT.keepSound, aspect: EDIT.aspect };
  if (EDIT.voiceMode === 'new' && EDIT.newText.trim()) i.newVoice = { text: EDIT.newText.trim(), voice: EDIT.voice, lang: EDIT.lang };
  if (EDIT.voiceMode === 'library' && EDIT.voiceUrl) { i.voiceUrl = EDIT.voiceUrl; i.voiceText = EDIT.voiceText; }
  if (EDIT.musicMode === 'library' && EDIT.musicUrl) { i.musicUrl = EDIT.musicUrl; i.musicVol = EDIT.musicVol; }
  if (EDIT.musicMode === 'new' && EDIT.musicPrompt.trim()) { i.musicPrompt = EDIT.musicPrompt.trim(); i.musicVol = EDIT.musicVol; }
  return i;
}
async function editEstimate() {
  const el = $('#ed-est'); if (!el) return;
  if (!EDIT.clips.length) { el.textContent = ''; return; }
  try { el.textContent = `✦ ${(await api('/api/estimate', { tool: 'edit', input: editInput() })).credits}`; } catch { el.textContent = ''; }
}
function seg(name, cur, opts) { return `<div class="ed-seg">${opts.map(([k, l]) => `<button data-${name}="${k}" class="${k === cur ? 'on' : ''}">${l}</button>`).join('')}</div>`; }
function editStage() {
  const j = EDIT.job && S.jobs.find((x) => x.id === EDIT.job);
  if (j?.status === 'running') {
    const done = j.steps.filter((x) => x.status === 'done').length;
    return `<div class="hs-run"><i></i><small>${esc(j.steps.find((x) => x.status === 'running')?.label || 'Starting')}…</small></div><div class="prog"><i style="width:${Math.round(((done + 0.5) / (j.steps.length + 2)) * 100)}%"></i></div>`;
  }
  if (j?.status === 'done') { const v = j.outputs.find((o) => o.type === 'video'); if (v) return `<video src="${v.url}#t=0.2" controls playsinline preload="metadata"></video><div class="hud">DONE · READY TO POST</div>`; }
  const c = EDIT.clips[0];
  if (!c) return '<div class="ed-empty"><b>Add clips from your library</b><small>Pick images or videos on the right, then add a voice-over and music.</small></div>';
  return `${c.type === 'video' ? `<video src="${c.url}#t=0.3" muted playsinline preload="metadata"></video>` : `<img src="${c.url}" alt="">`}<div class="hud">PREVIEW · ${EDIT.clips.length} CLIP${EDIT.clips.length > 1 ? 'S' : ''}</div>`;
}
function renderEditor(box) {
  const voices = audioLibrary('voice'), music = audioLibrary('music');
  const vopts = voiceOptions();
  const j = EDIT.job && S.jobs.find((x) => x.id === EDIT.job);
  box.innerHTML = `
    <div class="ed-grid">
      <div class="zz-stagewrap"><div class="zz-stage ed-stage" id="ed-stage" style="aspect-ratio:${EDIT.aspect.replace(':', '/')}">${editStage()}</div></div>
      <div class="ed-tracks">
        <div class="ed-track"><span class="ed-lab">🎞 Clips</span>
          <div class="ed-clips">${EDIT.clips.map((c, k) => `<div class="ed-clip"><span class="ed-n">${k + 1}</span>${c.type === 'video' ? `<video src="${c.url}#t=0.3" muted preload="metadata"></video>` : `<img src="${c.url}" alt="">`}<div class="ed-ctl"><button data-mv="${k}:-1" aria-label="Move left" ${k ? '' : 'disabled'}>‹</button><button data-rm="${k}" aria-label="Remove">✕</button><button data-mv="${k}:1" aria-label="Move right" ${k < EDIT.clips.length - 1 ? '' : 'disabled'}>›</button></div></div>`).join('')}
            ${EDIT.clips.length < 6 ? '<button class="ed-add" data-edlib>＋<small>Add</small></button>' : ''}</div></div>
        <div class="ed-track"><span class="ed-lab">🎙 Voice</span>
          ${seg('vm', EDIT.voiceMode, [['none', 'None'], ['library', 'My voice-overs'], ['new', 'Write new']])}
          ${EDIT.voiceMode === 'library' ? (voices.length ? `<select class="in" id="ed-vlib">${voices.map((v) => `<option value="${v.url}" ${v.url === EDIT.voiceUrl ? 'selected' : ''}>${esc(v.text.slice(0, 70) || v.title)}</option>`).join('')}</select>` : '<p class="hs-empty">No voice-overs yet. Make one in Voice, or write a new one here.</p>') : ''}
          ${EDIT.voiceMode === 'new' ? `<textarea class="in" id="ed-text" rows="3" maxlength="3000" placeholder="What should the voice say? e.g. Serum ni memang best, kulit glowing dalam seminggu!">${esc(EDIT.newText)}</textarea>
            <div class="zz-row two"><select class="in" id="ed-voice">${Object.entries(vopts).map(([k, l]) => `<option value="${k}" ${k === EDIT.voice ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><select class="in" id="ed-lang">${Object.entries(EDIT_LANGS).map(([k, l]) => `<option value="${k}" ${k === EDIT.lang ? 'selected' : ''}>${l}</option>`).join('')}</select></div>` : ''}
        </div>
        <div class="ed-track"><span class="ed-lab">🎵 Music</span>
          ${seg('mm', EDIT.musicMode, [['none', 'None'], ['library', 'My music'], ['new', 'Generate']])}
          ${EDIT.musicMode === 'library' ? (music.length ? `<select class="in" id="ed-mlib">${music.map((v) => `<option value="${v.url}" ${v.url === EDIT.musicUrl ? 'selected' : ''}>${esc(v.text.slice(0, 70) || v.title)}</option>`).join('')}</select>` : '<p class="hs-empty">No music yet. Generate one here, or make it in Voice → Music.</p>') : ''}
          ${EDIT.musicMode === 'new' ? `<input class="in" id="ed-mp" maxlength="300" value="${esc(EDIT.musicPrompt)}" placeholder="Describe the music, e.g. upbeat lo-fi, chill acoustic"><small class="ed-hint">New music costs about 57 credits for 30 seconds. Music you already made is free to reuse.</small>` : ''}
          ${EDIT.musicMode !== 'none' ? `<label class="ed-vol">Music volume <input type="range" id="ed-vol" min="5" max="60" value="${EDIT.musicVol}"><span>${EDIT.musicVol}%</span></label>` : ''}
        </div>
        <div class="ed-opts">
          <label class="ed-chk"><input type="checkbox" id="ed-cap" ${EDIT.captions ? 'checked' : ''}> Captions</label>
          <label class="ed-chk"><input type="checkbox" id="ed-keep" ${EDIT.keepSound ? 'checked' : ''}> Keep original sound</label>
          <select class="in" id="ed-ar" aria-label="Format">${Object.entries(HOME_ASPECT).map(([k, l]) => `<option value="${k}" ${k === EDIT.aspect ? 'selected' : ''}>${l}</option>`).join('')}</select>
        </div>
        <div class="ed-go-row">
          <button class="go zz-go" id="ed-go" ${EDIT.clips.length ? '' : 'disabled'}>Render video <span class="c" id="ed-est"></span></button>
          ${j?.status === 'done' ? '<button class="btn pri" id="ed-post">📤 Post / schedule</button>' : ''}
        </div>
      </div>
    </div>`;
  const rerender = () => renderEditor(box);
  box.querySelectorAll('[data-vm]').forEach((b) => (b.onclick = () => { EDIT.voiceMode = b.dataset.vm; if (EDIT.voiceMode === 'library' && !EDIT.voiceUrl && voices[0]) { EDIT.voiceUrl = voices[0].url; EDIT.voiceText = voices[0].text; } rerender(); }));
  box.querySelectorAll('[data-mm]').forEach((b) => (b.onclick = () => { EDIT.musicMode = b.dataset.mm; if (EDIT.musicMode === 'library' && !EDIT.musicUrl && music[0]) EDIT.musicUrl = music[0].url; rerender(); }));
  box.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => { EDIT.clips.splice(+b.dataset.rm, 1); rerender(); fillSides(); }));
  box.querySelectorAll('[data-mv]').forEach((b) => (b.onclick = () => { const [k, d] = b.dataset.mv.split(':').map(Number); const c = EDIT.clips.splice(k, 1)[0]; EDIT.clips.splice(k + d, 0, c); rerender(); }));
  box.querySelector('[data-edlib]') && (box.querySelector('[data-edlib]').onclick = () => { const l = $('#zz-s1'); l.scrollIntoView({ behavior: 'smooth', block: 'center' }); l.classList.add('flash'); setTimeout(() => l.classList.remove('flash'), 900); });
  const on = (id, ev, fn) => { const el = $(id); if (el) el[ev] = fn; };
  const later = () => { clearTimeout(later.t); later.t = setTimeout(editEstimate, 350); };
  on('#ed-vlib', 'onchange', (e) => { EDIT.voiceUrl = e.target.value; EDIT.voiceText = voices.find((v) => v.url === e.target.value)?.text || ''; editEstimate(); });
  on('#ed-text', 'oninput', (e) => { EDIT.newText = e.target.value; later(); });
  on('#ed-voice', 'onchange', (e) => { EDIT.voice = e.target.value; });
  on('#ed-lang', 'onchange', (e) => { EDIT.lang = e.target.value; });
  on('#ed-mlib', 'onchange', (e) => { EDIT.musicUrl = e.target.value; });
  on('#ed-mp', 'oninput', (e) => { EDIT.musicPrompt = e.target.value; later(); });
  on('#ed-vol', 'oninput', (e) => { EDIT.musicVol = +e.target.value; e.target.nextElementSibling.textContent = EDIT.musicVol + '%'; });
  on('#ed-cap', 'onchange', (e) => { EDIT.captions = e.target.checked; });
  on('#ed-keep', 'onchange', (e) => { EDIT.keepSound = e.target.checked; });
  on('#ed-ar', 'onchange', (e) => { EDIT.aspect = e.target.value; $('#ed-stage').style.aspectRatio = EDIT.aspect.replace(':', '/'); });
  on('#ed-go', 'onclick', async (e) => {
    const btn = e.currentTarget;
    if (EDIT.voiceMode === 'new' && !EDIT.newText.trim()) { toast('Write what the voice should say, or pick None', true); return $('#ed-text')?.focus(); }
    btn.disabled = true;
    try {
      const job = await api('/api/jobs', { tool: 'edit', input: editInput() });
      S.jobs.unshift(job); EDIT.job = job.id; poll(); renderFeed(); rerender();
      toast('Rendering your edit…');
    } catch (err) { toast(err.message, true); btn.disabled = false; if (err.code === 'credits' || err.code === 'plan') accountModal(); }
  });
  on('#ed-post', 'onclick', () => { const jj = S.jobs.find((x) => x.id === EDIT.job); postModal(jj, jj.outputs.find((o) => o.type === 'video')); });
  editEstimate();
}
function editTick() {
  const j = EDIT.job && S.jobs.find((x) => x.id === EDIT.job);
  if (!j) return;
  const stage = $('#ed-stage'); if (!stage) return;
  if (j.status === 'running') { stage.innerHTML = editStage(); return; }
  if (!editTick.done?.has(j.id)) { (editTick.done ||= new Set()).add(j.id); renderMain(); if (j.status === 'error') toast(j.error || 'The edit failed', true); }
}
function libraryCard() {
  const items = mediaLibrary();
  return `<h2>Your library</h2><p class="sub">Tap to add to the timeline. Up to 6 clips.</p>
    <div class="ed-lib">${items.length ? items.map((o, k) => `<button class="ed-li" data-addclip="${k}" title="${esc(o.label || o.job.title)}">${o.type === 'video' ? `<video src="${o.url}#t=0.3" muted preload="metadata"></video><span class="ed-ty">▶</span>` : `<img src="${o.url}" alt="">`}</button>`).join('') : '<p class="hs-empty">Nothing yet. Make an image or video first.</p>'}</div>`;
}
function soundsCard() {
  const list = [...audioLibrary('voice').map((x) => ({ ...x, k: 'voice' })), ...audioLibrary('music').map((x) => ({ ...x, k: 'music' }))].slice(0, 6);
  return `<h2>Voice-overs & music</h2><p class="sub">Your audio. Tap to use it in this edit.</p>
    <div class="zz-chl">${list.length ? list.map((x) => `<button class="zz-ch" data-useaudio="${x.k}|${x.url}"><span class="av">${x.k === 'voice' ? '🎙' : '🎵'}</span><span><b>${esc((x.text || x.title).slice(0, 36))}</b><small>Use as ${x.k === 'voice' ? 'voice-over' : 'music'}</small></span></button>`).join('') : '<p class="hs-empty">No audio yet. Write a voice-over in the editor, or make one in Voice.</p>'}</div>`;
}
function finishCard() {
  return `<h2>Make → edit → post</h2><ol class="zz-steps"><li><b>Add clips</b> from your library, in the order you want.</li><li><b>Add sound:</b> a voice-over, music and captions.</li><li><b>Render</b>, then post or schedule it straight from here.</li></ol>`;
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('#presets [data-addclip]');
  if (a) { const o = mediaLibrary()[+a.dataset.addclip]; editAdd(o, o.job); return renderMain(); }
  const u = e.target.closest('#presets [data-useaudio]');
  if (u) {
    const [k, url] = u.dataset.useaudio.split(/\|(.*)/);
    if (k === 'voice') { EDIT.voiceMode = 'library'; EDIT.voiceUrl = url; EDIT.voiceText = audioLibrary('voice').find((x) => x.url === url)?.text || ''; }
    else { EDIT.musicMode = 'library'; EDIT.musicUrl = url; }
    renderMain(); toast(k === 'voice' ? 'Voice-over added' : 'Music added');
  }
});

// ----- ideas: dump messy notes → ready prompts, saved to the library -----
const IDEAS = { writer: 'flash', dump: '', productId: null, friendId: null, lang: 'ms', result: null, chat: [], busy: false, savedIds: new Set(), refs: [], uploading: 0 };
const REF_ACCEPT = '.png,.jpg,.jpeg,.webp,.pdf,.docx,.txt,.md,.csv,image/png,image/jpeg,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';
const IDEA_MODE = { ad: 'Ad', video: 'Video', image: 'Image' };
const IDEA_EX = ['serum vit c rm29, flash sale weekend, target mak-mak 30-45, kawan cakap kulit cerah dlm seminggu, vibe santai, free shipping', 'new kopi brand, kopitiam vibes but modern, students + office workers, launch next month, nak content yg relatable', 'tudung bawal satin 15 colours, raya collection, price RM35, ready stock, before/after styling'];
function ideasInput(extra = {}) {
  return { mode: 'any', writer: IDEAS.writer || 'flash', prompt: IDEAS.dump, productId: IDEAS.productId, friendId: IDEAS.friendId, lang: IDEAS.lang, refs: IDEAS.refs.map(({ kind, url, name, text }) => ({ kind, url, name, text })), ...extra };
}
function ideaKey(x) { return `${x.mode}|${x.title}|${x.prompt}`; }
async function ideasRun(box) {
  if (!IDEAS.dump.trim() && !IDEAS.productId && !IDEAS.friendId && !IDEAS.refs.length) { toast('Dump some ideas first, or add a product or a reference', true); return $('#id-dump')?.focus(); }
  if (IDEAS.uploading) return toast('Still reading your files, one moment', true);
  IDEAS.busy = true; IDEAS.chat = []; renderIdeas(box);
  try {
    const r = await api('/api/brainstorm', ideasInput());
    IDEAS.result = r; IDEAS.busy = false; renderIdeas(box);
    load().then(() => { $('#credits').textContent = `✦ ${S.app.credits.toLocaleString()}`; });
  } catch (e) { IDEAS.busy = false; renderIdeas(box); toast(e.message, true); if (e.code === 'credits' || e.code === 'plan') accountModal(); }
}
async function ideasRefine(box, text) {
  const b = IDEAS.result; if (!b) return;
  IDEAS.chat.push({ role: 'user', text }); IDEAS.busy = true; renderIdeas(box);
  try {
    const r = await api('/api/brainstorm', ideasInput({ chat: IDEAS.chat, previous: { summary: b.summary, audience: b.audience, sellingPoints: b.sellingPoints, hooks: b.hooks, ideas: b.ideas.map(({ title, mode, prompt }) => ({ title, mode, prompt })) } }));
    IDEAS.result = r; IDEAS.chat.push({ role: 'ai', text: r.reply || 'Updated the ideas.' });
    load().then(() => { $('#credits').textContent = `✦ ${S.app.credits.toLocaleString()}`; });
  } catch (e) { IDEAS.chat.pop(); toast(e.message, true); }
  IDEAS.busy = false; renderIdeas(box);
}
function useIdea(x) {
  const mode = IDEA_MODE[x.mode] ? x.mode : 'ad';
  const f = { ...DEFAULTS[mode](), ...(x.settings || {}), prompt: x.prompt || '' };
  if (x.productId || IDEAS.productId) f.productId = x.productId || IDEAS.productId;
  if (x.friendId || IDEAS.friendId) f.friendId = x.friendId || IDEAS.friendId;
  if (mode === 'ad') { f.lang = x.lang || IDEAS.lang; f.approve = true; }
  const refImg = (IDEAS.refs.find((r) => r.kind === 'image') || {}).url;
  if (refImg && (mode === 'image' || mode === 'video')) f.startImage = refImg; // the reference picture goes with the idea
  if (f.productId && !productById(f.productId)) f.productId = null;
  if (f.friendId && !friendById(f.friendId)) f.friendId = null;
  S.forms[mode] = f; setMode(mode); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' });
  toast(`Idea loaded into ${IDEA_MODE[mode]}. ${mode === 'ad' && !f.productId ? 'Add your product, then Generate.' : 'Hit Generate when ready.'}`);
}
async function saveIdea(x, hook) {
  try {
    const row = await api('/api/ideas', { mode: x.mode, title: x.title, prompt: x.prompt, why: x.why, hook: hook || '', settings: x.settings || {}, productId: IDEAS.productId, friendId: IDEAS.friendId, lang: IDEAS.lang, source: IDEAS.dump.slice(0, 400) });
    S.ideas = [row, ...(S.ideas || [])]; IDEAS.savedIds.add(ideaKey(x)); fillSides(); toast('Saved to your ideas');
  } catch (e) { toast(e.message, true); }
}
function refChips() {
  return (IDEAS.refs.length || IDEAS.uploading) ? `<div class="id-refs">${IDEAS.refs.map((r, i) => `<span class="id-ref ${r.kind}">${r.kind === 'image' ? `<img src="${r.url}" alt="">` : '<i>📄</i>'}<span><b>${esc(r.name || (r.kind === 'image' ? 'Image' : 'Document'))}</b><small>${r.kind === 'image' ? 'Shown to Kravitas' : `${(r.chars || r.text?.length || 0).toLocaleString()} characters read`}</small></span><button type="button" data-unref="${i}" aria-label="Remove">✕</button></span>`).join('')}${IDEAS.uploading ? `<span class="id-ref busy"><i class="spin"></i><span><b>Reading ${IDEAS.uploading} file${IDEAS.uploading > 1 ? 's' : ''}…</b><small>PDF and Word are read as text</small></span></span>` : ''}</div>` : '';
}
// Shared by the Ideas chatbox and the studio composer: upload each file, keep the result in IDEAS.refs.
async function attachRefs(files, done) {
  files = files.slice(0, 8 - IDEAS.refs.length);
  if (!files.length) return;
  IDEAS.uploading += files.length; done();
  for (const f of files) {
    try {
      if (f.size > 10 * 1024 * 1024) throw new Error(`${f.name} is too large (max 10 MB)`);
      const dataUrl = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => no(new Error(`Could not read ${f.name}`)); r.readAsDataURL(f); });
      const ref = await api('/api/refs', { file: dataUrl, name: f.name || 'pasted-image.png' });
      IDEAS.refs.push({ ...ref, name: ref.name || f.name });
    } catch (err) { toast(err.message, true); }
    IDEAS.uploading -= 1; done();
  }
}
function renderIdeas(box) {
  if (IDEAS.sb) return renderSb(box);
  const r = IDEAS.result;
  const pr = productById(IDEAS.productId), fr = friendById(IDEAS.friendId);
  box.innerHTML = `
    <div class="id-wrap">
      ${r ? `<div class="id-out ${IDEAS.busy ? 'dim' : ''}">${(S.app.mock || !S.app.keySet) ? '<div class="id-demo-banner">Demo mode: these ideas are placeholders. The AI is not reading your image or following your text yet. Add your fal.ai key (Settings ⚙) or start Kravitas with start.bat to get real results.</div>' : ''}
        <p class="b-sum">${esc(r.summary)}</p>
        <div class="id-cols">
          <div><h3>Who it's for</h3><p>${esc(r.audience)}</p></div>
          <div><h3>Selling points</h3><ul>${r.sellingPoints.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div><h3>Hooks</h3><ul class="hooks">${r.hooks.map((x, i) => `<li><span>${esc(x)}</span><button class="link" data-hook="${i}">Copy</button></li>`).join('')}</ul></div>
        </div>
        <h3>Ready-to-use prompts</h3>
        <div class="id-ideas">${r.ideas.map((x, i) => `<div class="id-idea"><div class="id-top"><span class="mtag">${IDEA_MODE[x.mode] || x.mode}</span><b>${esc(x.title)}</b></div><p class="why">${esc(x.why)}</p><p class="pr">${esc(x.prompt)}</p>${Object.keys(x.settings || {}).length ? `<div class="chips">${Object.entries(x.settings).map(([k, v]) => `<span class="chip">${esc(k)}: ${esc(v)}</span>`).join('')}</div>` : ''}<div class="id-acts"><button class="btn pri" data-sb="${i}">🎞 Storyboard <small>✦ ${sbPlanCost()}</small></button><button class="btn" data-use="${i}">Use it →</button><button class="btn" data-save="${i}" ${IDEAS.savedIds.has(ideaKey(x)) ? 'disabled' : ''}>${IDEAS.savedIds.has(ideaKey(x)) ? '✓ Saved' : 'Save'}</button></div></div>`).join('')}</div>
        <div class="id-acts" style="margin-top:8px"><button class="btn" id="id-saveall">Save all ${r.ideas.length}</button></div>
        <div class="b-chat">
          <h3>Tell Kravitas more</h3>
          <div class="b-thread">${IDEAS.chat.map((c) => `<div class="msg ${c.role}">${esc(c.text)}</div>`).join('')}${IDEAS.busy ? '<div class="msg ai typing"><i></i><i></i><i></i></div>' : ''}</div>
          <div class="b-sugg">${BRAIN_SUGGEST.map((x) => `<button class="chip" data-sugg="${esc(x)}">${esc(x)}</button>`).join('')}</div>
          <form class="b-input" id="id-form"><label class="id-clip sm ${IDEAS.refs.length >= 8 ? 'off' : ''}" title="Attach more files">📎<input type="file" id="id-file2" accept="${REF_ACCEPT}" multiple hidden></label><input id="id-msg" class="in" maxlength="500" autocomplete="off" placeholder="e.g. buyers are mums 30–45, 20% off this week, keep it in BM"><button class="btn pri" type="submit" ${IDEAS.busy ? 'disabled' : ''}>Send ✦ 1</button></form>
        </div>
      </div>` : IDEAS.busy ? '<div class="id-think"><i></i><b>Kravitas is reading your notes…</b><small>Making sense of them, then writing prompts you can run right away.</small></div>' : `<div class="fl-empty id-empty"><span>✿</span><b>What do you want to make?</b><small>Tell Kravitas about your product or idea. It writes the prompts and a storyboard, so you can check everything before you spend on video.</small></div>`}
      <div class="id-in id-dock">
        <div class="id-chat" id="id-chat">
          ${refChips()}
          <textarea id="id-dump" rows="2" maxlength="4000" placeholder="Create your prompts here… e.g. serum vit C RM29, flash sale this weekend, buyers are women 20 to 35">${esc(IDEAS.dump)}</textarea>
          <div class="id-bar">
            <label class="ib plus ${IDEAS.refs.length >= 8 ? 'off' : ''}" title="Attach images, PDF, Word or text" aria-label="Attach files"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg><input type="file" id="id-file" accept="${REF_ACCEPT}" multiple hidden></label>
            <label class="ib ${IDEAS.productId ? 'on' : ''}" title="Product" aria-label="Product"><svg viewBox="0 0 24 24"><path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"/></svg>${IDEAS.productId ? `<span class="v">${esc((S.products.find((p) => p.id === IDEAS.productId) || {}).name || '')}</span>` : ''}<select id="id-prod" aria-label="Product"><option value="">Product: none</option>${S.products.map((p) => `<option value="${p.id}" ${p.id === IDEAS.productId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}<option value="__new">＋ Add product…</option></select></label>
            <label class="ib ${IDEAS.friendId ? 'on' : ''}" title="Character" aria-label="Character"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/></svg>${IDEAS.friendId ? `<span class="v">${esc((S.friends.find((f) => f.id === IDEAS.friendId) || {}).name || '')}</span>` : ''}<select id="id-face" aria-label="Character"><option value="">Character: none</option>${S.friends.map((f) => `<option value="${f.id}" ${f.id === IDEAS.friendId ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}<option value="__new">＋ Add character…</option></select></label>
            <label class="ib lg" title="Language" aria-label="Language"><span class="v">${LANG_SHORT[IDEAS.lang] || 'BM'}</span><select id="id-lang" aria-label="Language">${Object.entries(LANG).map(([k, l]) => `<option value="${k}" ${k === IDEAS.lang ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
            <span class="sp"></span>
            ${(S.app.mock || !S.app.keySet) ? '<span class="demo-dot" title="Demo mode: the AI cannot read your images or really follow your text until a fal.ai key is added in Settings.">Demo</span>' : ''}
            <label class="mdl" title="The AI that writes your ideas. Better ones unlock with your plan."><span class="v">${esc(llmName())} ▾</span><select id="id-writer" aria-label="AI writer">${Object.entries(S.app.catalog?.writers || { flash: { name: llmName(), plan: 'free' } }).map(([k, w]) => `<option value="${k}" ${k === IDEAS.writer ? 'selected' : ''}>${esc(w.name)}${w.note ? ' · ' + esc(w.note) : ''}${(w.plan !== 'free' && !canUse(w.plan)) ? ' 🔒 ' + (PLAN_LABEL[w.plan] || w.plan) : ''}</option>`).join('')}</select></label>
            <button class="send" id="id-go" ${IDEAS.busy ? 'disabled' : ''} title="${r ? 'Think again' : 'Turn into prompts'} (✦ 2)" aria-label="${r ? 'Think again' : 'Turn into prompts'}">${IDEAS.busy && !r ? '<i class="spin"></i>' : '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'}</button>
          </div>
        </div>
      </div>
    </div>`;
  const on = (id, ev, fn) => { const el = $(id); if (el) el[ev] = fn; };
  const grow = (t) => { t.style.height = 'auto'; t.style.height = Math.min(220, t.scrollHeight) + 'px'; };
  on('#id-dump', 'oninput', (e) => { IDEAS.dump = e.target.value; grow(e.target); });
  on('#id-dump', 'onkeydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!IDEAS.busy) ideasRun(box); } });
  if ($('#id-dump')) grow($('#id-dump'));
  on('#id-prod', 'onchange', (e) => { if (e.target.value === '__new') { e.target.value = IDEAS.productId || ''; return productModal(); } IDEAS.productId = e.target.value || null; });
  on('#id-face', 'onchange', (e) => { if (e.target.value === '__new') { e.target.value = IDEAS.friendId || ''; return friendModal(); } IDEAS.friendId = e.target.value || null; });
  on('#id-writer', 'onchange', (e) => {
    const w = (S.app.catalog?.writers || {})[e.target.value];
    if (w && w.plan !== 'free' && !canUse(w.plan)) { toast(`${w.name} needs the ${PLAN_LABEL[w.plan] || w.plan} plan`, true); e.target.value = IDEAS.writer; return; }
    IDEAS.writer = e.target.value; const v = e.target.parentElement.querySelector('.v'); if (v) v.textContent = llmName() + ' ▾';
  });
  on('#id-lang', 'onchange', (e) => { IDEAS.lang = e.target.value; const v = e.target.parentElement.querySelector('.v'); if (v) v.textContent = LANG_SHORT[IDEAS.lang] || 'BM'; });
  on('#id-go', 'onclick', () => ideasRun(box));
  if (IDEAS.autorun) { IDEAS.autorun = false; setTimeout(() => ideasRun(box), 0); }
  const again = () => renderIdeas(box);
  on('#id-file', 'onchange', (e) => attachRefs([...e.target.files], again));
  on('#id-file2', 'onchange', (e) => attachRefs([...e.target.files], again));
  const chat = $('#id-chat');
  if (chat) {
    chat.ondragover = (e) => { e.preventDefault(); chat.classList.add('drop'); };
    chat.ondragleave = () => chat.classList.remove('drop');
    chat.ondrop = (e) => { e.preventDefault(); chat.classList.remove('drop'); attachRefs([...(e.dataTransfer?.files || [])], again); };
    chat.onpaste = (e) => { const fl = [...(e.clipboardData?.files || [])]; if (fl.length) { e.preventDefault(); attachRefs(fl, again); } };
  }
  box.querySelector('[data-newprod]')?.addEventListener('click', () => productModal());
  box.querySelector('[data-newface]')?.addEventListener('click', () => friendModal());
  //on('[data-newprod]', 'onclick', () => productModal());
  box.querySelectorAll('[data-unref]').forEach((b) => (b.onclick = () => { IDEAS.refs.splice(+b.dataset.unref, 1); renderIdeas(box); }));
  box.querySelectorAll('[data-idex]').forEach((b) => (b.onclick = () => { IDEAS.dump = IDEA_EX[+b.dataset.idex]; $('#id-dump').value = IDEAS.dump; $('#id-dump').focus(); }));
  box.querySelectorAll('[data-sb]').forEach((b) => (b.onclick = () => sbStart(box, r.ideas[+b.dataset.sb])));
  box.querySelectorAll('[data-use]').forEach((b) => (b.onclick = () => useIdea(r.ideas[+b.dataset.use])));
  box.querySelectorAll('[data-save]').forEach((b) => (b.onclick = () => { saveIdea(r.ideas[+b.dataset.save], r.hooks?.[0]); b.disabled = true; b.textContent = '✓ Saved'; }));
  box.querySelectorAll('[data-hook]').forEach((b) => (b.onclick = () => { navigator.clipboard?.writeText(r.hooks[+b.dataset.hook]).then(() => toast('Hook copied')).catch(() => {}); }));
  on('#id-saveall', 'onclick', async (e) => { e.target.disabled = true; for (const x of r.ideas) if (!IDEAS.savedIds.has(ideaKey(x))) await saveIdea(x, r.hooks?.[0]); renderIdeas(box); });
  box.querySelectorAll('[data-sugg]').forEach((b) => (b.onclick = () => ideasRefine(box, b.dataset.sugg)));
  on('#id-form', 'onsubmit', (e) => { e.preventDefault(); const v = $('#id-msg').value.trim(); if (v) ideasRefine(box, v); });
}

// ---------- idea → storyboard (sketch panels → real keyframes → video) ----------
const SB_TIER_MODEL = { motion: 'h3-turbo', lite: 'h3-turbo', fast: 'h3-turbo', studio: 'kling-std', premium: 'kling-pro' };
const SB_N = 4;
const px = () => S.app.catalog.price || {};
const sbPlanCost = () => (px().llm || 1) + SB_N * (px().imageSchnell || 1);
const sbKeyCost = () => (canUse('creator') ? px().image : px().imageLite) || 6;
const sbRefresh = () => load().then(() => { const c = $('#credits'); if (c) c.textContent = `✦ ${S.app.credits.toLocaleString()}`; });
async function sbStart(box, idea) {
  const aspect = ['9:16', '16:9', '1:1', '4:5'].includes(idea.settings?.aspect) ? idea.settings.aspect : '9:16';
  IDEAS.sb = { idea, title: idea.title, look: '', caption: '', hashtags: [], aspect, panels: [], busy: 'plan', tier: 'motion', est: null };
  renderSb(box);
  try {
    const notes = IDEAS.refs.filter((x) => x.kind === 'doc').map((x) => x.text).join('\n\n').slice(0, 3000);
    const r = await api('/api/panels/plan', { prompt: idea.prompt, productId: IDEAS.productId, friendId: IDEAS.friendId, lang: IDEAS.lang, panels: SB_N, aspect, notes });
    Object.assign(IDEAS.sb, { title: r.title || idea.title, look: r.look, caption: r.caption, hashtags: r.hashtags, panels: r.panels.map((x) => ({ ...x, busy: null })), busy: null });
    sbRefresh();
  } catch (e) { IDEAS.sb = null; toast(e.message, true); if (e.code === 'credits' || e.code === 'plan') accountModal(); }
  renderIdeas(box);
}
async function sbDraw(box, k, kind) {
  const b = IDEAS.sb, pn = b.panels[k];
  if (pn.busy) return;
  pn.busy = kind; renderSb(box);
  try {
    const r = await api('/api/panels/draw', { kind, visual: pn.visual, look: b.look, aspect: b.aspect, productId: IDEAS.productId, friendId: IDEAS.friendId, style: 'cinematic' });
    pn.image = r.image; pn.kind = r.kind;
  } catch (e) { toast(e.message, true); if (e.code === 'credits' || e.code === 'plan') accountModal(); }
  pn.busy = null; if (IDEAS.sb === b) renderSb(box);
  sbRefresh();
}
function sbBoard() {
  const b = IDEAS.sb;
  return { title: b.title, caption: b.caption, hashtags: b.hashtags, scenes: b.panels.map((x) => ({ narration: x.narration, visual: x.visual, motion: x.motion, ...(x.kind === 'keyframe' && x.image ? { frame: x.image } : {}) })) };
}
function sbJobInput() {
  const b = IDEAS.sb;
  return { prompt: b.title, friendId: IDEAS.friendId, productId: IDEAS.productId, look: b.look, board: sbBoard(), tier: b.tier, model: SB_TIER_MODEL[b.tier], aspect: b.aspect, style: 'cinematic', lang: IDEAS.lang, voice: IDEAS.lang === 'ms' ? 'mm:Lively_Girl' : 'el:Aria', captions: true };
}
let sbEstT;
function sbEstimate() {
  clearTimeout(sbEstT);
  sbEstT = setTimeout(async () => {
    if (!IDEAS.sb || IDEAS.sb.busy) return;
    try { const r = await api('/api/estimate', { tool: 'story', input: sbJobInput() }); IDEAS.sb.est = r.credits; const el = $('#sb-est'); if (el) el.textContent = `✦ ${r.credits}`; } catch {}
  }, 250);
}
async function sbMake(box) {
  const b = IDEAS.sb;
  if (b.panels.some((x) => x.busy)) return toast('Wait for the panels to finish drawing', true);
  if (b.panels.some((x) => !x.narration.trim())) return toast('Every panel needs a line to say', true);
  try {
    const job = await api('/api/jobs', { tool: 'story', input: sbJobInput() });
    S.jobs.unshift(job); renderFeed(); poll();
    toast('Making your video. Watch it under Recent.');
    sbRefresh();
  } catch (e) { toast(e.message, true); if (e.code === 'credits' || e.code === 'plan') accountModal(); }
}
function renderSb(box) {
  const b = IDEAS.sb;
  const tiers = S.app.catalog.tiers || {};
  const keyed = b.panels.filter((x) => x.kind === 'keyframe').length;
  const loading = b.busy === 'plan';
  const [aw, ah] = b.aspect.split(':').map(Number);
  box.innerHTML = `<div class="sb2">
    <div class="sb2-top"><button class="link" id="sb-back">← Back to ideas</button><span class="mtag">Storyboard</span></div>
    <input class="in sb2-title" id="sb-title" maxlength="120" value="${esc(b.title)}" ${loading ? 'disabled' : ''}>
    <p class="sb2-help">Check the story and the character here before you spend on video. Sketches are cheap. Turn the panels you like into real keyframes with your character and product, and the video is made from those.</p>
    ${loading ? `<div class="id-think"><i></i><b>Planning your shots and sketching them…</b><small>This takes about 20 seconds.</small></div>` : `
    <label class="l" for="sb-look">Same in every panel <small class="muted">· character, product, setting · edit it, then redraw</small></label>
    <textarea class="in" id="sb-look" rows="3" maxlength="800">${esc(b.look)}</textarea>
    <div class="sb2-strip">${b.panels.map((x, k) => `<div class="sb2-p ${x.busy ? 'busy' : ''}">
        <div class="sb2-img" style="aspect-ratio:${aw}/${ah}"><img src="${x.image}" alt="Panel ${k + 1}"><span class="sb2-n">${k + 1}</span><span class="sb2-badge ${x.kind}">${x.kind === 'keyframe' ? 'Keyframe ✓' : 'Sketch'}</span>${x.busy ? `<div class="sb2-wait"><i class="spin"></i><small>${x.busy === 'keyframe' ? 'Drawing keyframe…' : 'Sketching…'}</small></div>` : ''}</div>
        <textarea class="in" data-vis="${k}" rows="3" maxlength="600" aria-label="What happens in panel ${k + 1}">${esc(x.visual)}</textarea>
        <input class="in" data-nar="${k}" maxlength="400" value="${esc(x.narration)}" aria-label="Line spoken in panel ${k + 1}" placeholder="What is said">
        <div class="sb2-pa">
          ${x.kind === 'keyframe' ? `<button class="btn" data-redraw="${k}">Redraw <small>✦ ${sbKeyCost()}</small></button>` : `<button class="btn" data-redraw="${k}">Redraw <small>✦ ${px().imageSchnell || 1}</small></button><button class="btn pri" data-key="${k}">Real keyframe <small>✦ ${sbKeyCost()}</small></button>`}
          ${b.panels.length > 2 ? `<button class="btn" data-pdel="${k}" aria-label="Remove panel">✕</button>` : ''}
        </div></div>`).join('')}</div>
    <div class="sb2-bar">
      <div><label class="l" for="sb-tier">Video quality</label>
        <select class="in" id="sb-tier">${Object.keys(tiers).map((k) => { const need = tiers[k].plan, lock = need && !canUse(need); return `<option value="${k}" ${k === b.tier ? 'selected' : ''}>${esc(TIER_NAME[k] || tiers[k].label)} · ${esc(TIER_DESC[k] || '')}${lock ? ` · 🔒 ${PLAN_LABEL[need]}` : ''}</option>`; }).join('')}</select></div>
      <div class="sb2-go">
        ${keyed < b.panels.length ? `<button class="btn" id="sb-all">Real keyframes for all <small>✦ ${(b.panels.length - keyed) * sbKeyCost()}</small></button>` : ''}
        <button class="go" id="sb-make">Make the video <span class="c" id="sb-est">${b.est != null ? `✦ ${b.est}` : '✦ …'}</span></button>
      </div>
    </div>
    <p class="sb2-note">${keyed ? `${keyed} of ${b.panels.length} panels are real keyframes.` : 'All panels are still sketches.'} Panels left as sketches are painted as real images when you make the video, so you only pay for them once.</p>`}
  </div>`;
  if (loading) return;
  const on = (sel, fn) => box.querySelectorAll(sel).forEach((el) => fn(el));
  $('#sb-back').onclick = () => { IDEAS.sb = null; renderIdeas(box); };
  $('#sb-title').oninput = (e) => { b.title = e.target.value; };
  $('#sb-look').oninput = (e) => { b.look = e.target.value; };
  on('[data-vis]', (el) => (el.oninput = () => { b.panels[+el.dataset.vis].visual = el.value; }));
  on('[data-nar]', (el) => (el.oninput = () => { b.panels[+el.dataset.nar].narration = el.value; sbEstimate(); }));
  on('[data-redraw]', (el) => (el.onclick = () => sbDraw(box, +el.dataset.redraw, b.panels[+el.dataset.redraw].kind)));
  on('[data-key]', (el) => (el.onclick = () => sbDraw(box, +el.dataset.key, 'keyframe')));
  on('[data-pdel]', (el) => (el.onclick = () => { b.panels.splice(+el.dataset.pdel, 1); b.est = null; renderSb(box); sbEstimate(); }));
  $('#sb-all') && ($('#sb-all').onclick = () => b.panels.forEach((x, k) => x.kind !== 'keyframe' && sbDraw(box, k, 'keyframe')));
  $('#sb-tier').onchange = (e) => {
    const need = tiers[e.target.value]?.plan;
    if (need && !canUse(need)) { toast(`${TIER_NAME[e.target.value]} is on the ${PLAN_LABEL[need]} plan`); e.target.value = b.tier; return accountModal(); }
    b.tier = e.target.value; b.est = null; sbEstimate(); $('#sb-est').textContent = '✦ …';
  };
  $('#sb-make').onclick = () => sbMake(box);
  sbEstimate();
}
function savedIdeasCard() {
  const list = (S.ideas || []).slice(0, 30);
  return `<h2>Saved ideas</h2><p class="sub">Your prompt library. Tap one to load it into a tool.</p>
    <div class="zz-chl id-saved">${list.length ? list.map((x) => `<div class="zz-ch static id-row"><button class="id-use" data-useidea="${x.id}"><span class="mtag">${IDEA_MODE[x.mode] || x.mode}</span><span><b>${esc(x.title)}</b><small>${esc((x.prompt || '').slice(0, 70))}</small></span></button><button class="id-del" data-delidea="${x.id}" aria-label="Delete">✕</button></div>`).join('') : '<p class="hs-empty">Nothing saved yet. Turn your notes into prompts, then Save the ones you like.</p>'}</div>`;
}
function brandCard() {
  return `<h2>Brand notes</h2><p class="sub">Standing guidelines Kravitas follows in every idea and script: tone, must-say, never-say.</p>
    <textarea class="in" id="brand-notes" rows="5" maxlength="1500" placeholder="e.g. Brand: GlowLab. Tone: santai, mesra, no hard sell. Always mention halal-certified. Never compare to other brands by name.">${esc(S.app.brand || '')}</textarea>
    <div class="zz-two one" style="margin-top:8px"><button class="btn pri" data-savebrand>Save notes</button></div>`;
}
function ideasHelpCard() {
  return `<h2>How Ideas works</h2><ol class="zz-steps"><li><b>Dump</b> everything you know: product, price, promo, buyers, vibe. Messy is fine. Add files too: a product sheet, brand deck, competitor screenshots, reviews.</li><li><b>Kravitas writes</b> the audience, hooks and ready-to-run prompts for Ad, Video and Image.</li><li><b>Save</b> the ones you like. They live in your library, and <b>Use it</b> loads one straight into the right tool.</li></ol>`;
}
document.addEventListener('click', async (e) => {
  const u = e.target.closest('#presets [data-useidea]');
  if (u) { const x = (S.ideas || []).find((i) => i.id === u.dataset.useidea); if (x) useIdea(x); return; }
  const d = e.target.closest('#presets [data-delidea]');
  if (d) { try { await api(`/api/ideas/${d.dataset.delidea}`, null, 'DELETE'); S.ideas = (S.ideas || []).filter((i) => i.id !== d.dataset.delidea); fillSides(); toast('Deleted'); } catch (err) { toast(err.message, true); } return; }
  const sb = e.target.closest('#presets [data-savebrand]');
  if (sb) { sb.disabled = true; try { const r = await api('/api/brand', { brand: $('#brand-notes').value }, 'PUT'); S.app.brand = r.brand; toast('Brand notes saved'); } catch (err) { toast(err.message, true); } sb.disabled = false; }
});

// ----- side cards -----
function characterCard() {
  const cur = S.mode === 'video' ? shotFriend()?.id : F().friendId;
  return `<h2>Character</h2><p class="sub">${S.mode === 'ad' ? 'Who presents your product. Optional.' : 'Your photo is the reference. Kravitas keeps this face.'}</p>
    <div class="zz-chl">${S.friends.length ? S.friends.map((f) => `<button class="zz-ch ${f.id === cur ? 'on' : ''}" data-fr="${f.id}"><span class="av" style="${f.photos?.[0] ? `background-image:url('${f.photos[0]}')` : ''}">${f.photos?.[0] ? '' : esc(f.name[0])}</span><span><b>${esc(f.name)}</b><small>${f.id === cur ? 'Selected' : 'Tap to use'}</small></span></button>`).join('') : '<p class="hs-empty">No characters yet.</p>'}</div>
    <div class="zz-two"><button class="btn pri" data-new="friend">＋ Add character</button><button class="btn" data-act="avatars">AI avatars</button></div>`;
}
function productCard() {
  const cur = F().productId;
  return `<h2>Product</h2><p class="sub">What you are selling. One clear photo is enough.</p>
    <div class="zz-chl">${S.products.length ? S.products.map((p) => `<button class="zz-ch ${p.id === cur ? 'on' : ''}" data-pd="${p.id}"><span class="av" style="background-image:url('${p.image}')"></span><span><b>${esc(p.name)}</b><small>${p.price ? esc(p.price) : p.id === cur ? 'Selected' : 'Tap to use'}</small></span></button>`).join('') : '<p class="hs-empty">No products yet.</p>'}</div>
    <div class="zz-two one"><button class="btn pri" data-new="product">＋ Add product</button></div>`;
}
function voiceCard() {
  const v = S.voices || [];
  return `<h2>Your voice</h2><p class="sub">Clone your own voice once, then use it on every voice-over.</p>
    <div class="zz-chl">${v.length ? v.map((x) => `<div class="zz-ch static"><span class="av">★</span><span><b>${esc(x.name)}</b><small>Cloned voice</small></span></div>`).join('') : '<p class="hs-empty">No cloned voice yet.</p>'}</div>
    <div class="zz-two one"><button class="btn pri" data-act="clone">🧬 Clone my voice</button></div>`;
}
function readyCard() {
  const vids = S.jobs.filter((j) => j.status === 'done' && j.outputs.some((o) => o.type === 'video')).slice(0, 4);
  return `<h2>Ready to post</h2><p class="sub">Your latest videos. Tap one to post or schedule it.</p>
    <div class="zz-chl">${vids.length ? vids.map((j) => `<button class="zz-ch" data-postjob="${j.id}"><span class="av" style="${thumbOf(j)?.type === 'image' ? `background-image:url('${thumbOf(j).url}')` : ''}">▶</span><span><b>${esc(j.title.slice(0, 40))}</b><small>Post / schedule</small></span></button>`).join('') : '<p class="hs-empty">Make a video first.</p>'}</div>`;
}
function creditsCard() {
  const a = S.app, plan = (CFG.plans || []).find((p) => p.id === a.plan);
  const cheapest = [...(CFG.plans || [])].sort((x, y) => x.price - y.price)[0];
  return `<h2>Credits</h2><p class="zz-big">✦ ${a.credits.toLocaleString()}</p><p class="sub" style="margin:0 0 12px">${plan ? `${esc(plan.name)} plan · ${plan.credits.toLocaleString()} every month` : cheapest ? `Plans from ${RM(cheapest.price)}/month` : ''}</p><button class="btn" data-act="plans">${plan ? 'Manage plan' : 'See plans'}</button>`;
}
function presetCard() {
  if (S.mode === 'video') return `<h2>Start from a template</h2><p class="sub">Fills the prompt, camera and style for you.</p><div class="zz-tpls">${HOME_TPLS.map((t, i) => `<button class="zz-opt" data-tpl="${i}"><b>${t[0]} ${t[1]}</b></button>`).join('')}</div>`;
  if (S.mode === 'schedule') return `<h2>How it works</h2><ol class="zz-steps"><li><b>Connect</b> your TikTok, Instagram, Facebook, YouTube or Threads.</li><li><b>Make</b> a video in Ad or Video.</li><li><b>Post or schedule</b> it from its card. Captions are filled in for you.</li></ol>`;
  const f = F();
  const list = (PRESETS[S.mode] || []).filter((x) => x.action !== 'clone');
  return `<h2>${S.mode === 'ad' ? 'Ad style' : 'Templates'}</h2><p class="sub">${S.mode === 'ad' ? 'Pick an angle. You can change it any time.' : 'One tap sets everything up.'}</p>
    <div class="zz-tpls">${list.map((x) => { const on = !!x.set && S.preset[S.mode] === x.id && Object.entries(x.set).every(([k, v]) => k === 'prompt' || f[k] === v); return `<button class="zz-opt ${on ? 'on' : ''}" data-preset="${x.id}"><b>${x.e} ${esc(x.t)}</b></button>`; }).join('')}</div>`;
}
function styleCard() {
  const cur = S.mode === 'video' ? SHOT.style : F().style;
  return `<h2>Visual style</h2><div class="zz-styles">${HOME_STYLES.map((x) => `<button class="zz-sty ${x[0] === cur ? 'on' : ''}" data-st="${x[0]}" title="${esc(x[2])}">${x[1]}</button>`).join('')}</div>`;
}
const SIDES = {
  ad: [productCard, presetCard, characterCard],
  video: [characterCard, presetCard, styleCard],
  image: [characterCard, presetCard, styleCard],
  voice: [voiceCard, presetCard, creditsCard],
  schedule: [readyCard, presetCard, creditsCard],
  edit: [libraryCard, soundsCard, finishCard],
  ideas: [savedIdeasCard, brandCard, ideasHelpCard],
};
function fillSides() {
  const [a, b, c] = SIDES[S.mode] || SIDES.ad;
  const set = (id, fn) => { const el = $(id); if (el) el.innerHTML = fn(); };
  set('#zz-s1', a); set('#zz-s2', b); set('#zz-s3', c); set('#zz-model', modelCard);
}
// app.js calls renderPresets() after composer changes: keep the side cards in sync
function refreshSides() { if ($('#zz-s1')) fillSides(); }

// ----- main card -----
function lastOf(tools) { return S.jobs.find((j) => tools.includes(j.tool) && j.status === 'done'); }
function mainStage() {
  if (S.mode === 'ad') {
    const j = lastOf(['ugc']); const t = j && thumbOf(j);
    const pr = productById(F().productId), fr = friendById(F().friendId);
    if (t) return `<div class="zz-stage tall" data-job="${j.id}">${t.type === 'video' ? `<video src="${t.url}" autoplay loop muted playsinline></video>` : `<img src="${t.url}" alt="">`}<div class="hud">LAST AD · TAP TO OPEN</div></div>`;
    return `<div class="zz-stage tall zz-ph"><div class="zz-pair">${pr ? `<img src="${pr.image}" alt="">` : '<span>📦</span>'}<em>+</em>${fr?.photos?.[0] ? `<img src="${fr.photos[0]}" alt="">` : '<span>🙂</span>'}</div><small>${pr ? esc(pr.name) : 'Add a product'} ${fr ? '· ' + esc(fr.name) : ''}</small><div class="hud">YOUR AD APPEARS HERE</div></div>`;
  }
  if (S.mode === 'image') {
    const j = lastOf(['image']); const t = j && thumbOf(j);
    if (t) return `<div class="zz-stage tall" data-job="${j.id}"><img src="${t.url}" alt=""><div class="hud">LAST IMAGE · TAP TO OPEN</div></div>`;
    return `<div class="zz-stage tall"><div class="sc cam-static" style="--h:${hueOf(F().prompt || 'image')};filter:${STYLE_FX[F().style] || 'none'}"><div class="sun"></div><div class="mt"></div></div><div class="vig"></div><div class="hud">PREVIEW · ${esc(STYLE[F().style] || '')}</div></div>`;
  }
  if (S.mode === 'voice') {
    const j = lastOf(['voice']); const a = j?.outputs.find((o) => o.type === 'audio');
    return `<div class="zz-stage short zz-ph"><div class="wave">${'<i></i>'.repeat(40)}</div>${a ? `<audio src="${a.url}" controls></audio><small>${esc(j.title.slice(0, 70))}</small>` : '<small>Your voice-over plays here</small>'}</div>`;
  }
  return '';
}
function renderMain() {
  const box = $('#zz-main'); if (!box) return;
  if (S.mode === 'video') {
    const c = S.app.catalog, models = c.videoModels || {}, mp = c.modelPlan || {};
    box.innerHTML = `
      <div class="zz-stagewrap"><div class="zz-stage" id="hs-stage" style="aspect-ratio:${SHOT.aspect.replace(':', '/')}">${stageHTML('PREVIEW · ' + (HOME_STYLES.find((x) => x[0] === SHOT.style)?.[1] || ''))}</div></div>
      <label class="l" for="hs-p">Scene prompt</label>
      <textarea class="in" id="hs-p" rows="2" maxlength="1500">${esc(SHOT.prompt)}</textarea>
      <div class="zz-row">
        <div><label class="l" for="hs-cam">Camera</label><select class="in" id="hs-cam">${Object.entries(CAM).map(([k, l]) => `<option value="${k}" ${k === SHOT.camera ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div><label class="l" for="hs-md">Model</label><select class="in" id="hs-md">${Object.entries(models).map(([k, m]) => { const lock = mp[k] && !canUse(mp[k]); return `<option value="${k}" ${k === SHOT.model ? 'selected' : ''}>${esc(MODEL_NAME[k] || m.label)}${lock ? ` · 🔒 ${PLAN_LABEL[mp[k]]} plan` : ''}</option>`; }).join('')}</select></div>
        <div><label class="l" for="hs-ar">Format</label><select class="in" id="hs-ar">${Object.entries(HOME_ASPECT).map(([k, l]) => `<option value="${k}" ${k === SHOT.aspect ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      </div>
      <button class="go zz-go" id="hs-go">Generate shot <span class="c" id="hs-est"></span></button>`;
    const preview = () => { if (!SHOT.job) $('#hs-stage').innerHTML = stageHTML('PREVIEW · ' + (HOME_STYLES.find((x) => x[0] === SHOT.style)?.[1] || '')); shotEstimate(); };
    studioPreview = preview;
    $('#hs-p').oninput = (e) => { SHOT.prompt = e.target.value; clearTimeout(preview.t); preview.t = setTimeout(preview, 300); };
    $('#hs-cam').onchange = (e) => { SHOT.camera = e.target.value; preview(); };
    $('#hs-md').onchange = (e) => {
      const v = e.target.value, need = mp[v];
      if (need && !canUse(need)) { e.target.value = SHOT.model; toast(`${models[v]?.label || 'That model'} is on the ${PLAN_LABEL[need]} plan`); return accountModal(); }
      SHOT.model = v; shotEstimate(); $('#zz-model').innerHTML = modelCard();
    };
    $('#hs-ar').onchange = (e) => { SHOT.aspect = e.target.value; $('#hs-stage').style.aspectRatio = SHOT.aspect.replace(':', '/'); preview(); };
    $('#hs-go').onclick = (e) => shotGo(e.currentTarget);
    if (SHOT.job) studioTick();
    shotEstimate();
    return;
  }
  if (S.mode === 'schedule') { box.innerHTML = '<div id="sched"></div>'; renderSchedule(); return; }
  if (S.mode === 'edit') return renderEditor(box);
  if (S.mode === 'ideas') return renderIdeas(box);
  box.innerHTML = `<div class="fl-head"><h1>${FL_TITLE[S.mode] || ''}</h1><p>${HERO[S.mode]?.[1] || ''}</p></div>
    <div class="fl-gal" id="fl-gal">${galleryHTML()}</div>
    <div class="composer inline" id="composer"></div>
    <div class="id-ex fl-ex"><small>Try:</small>${(FL_EX[S.mode] || []).map((x, i) => `<button data-flex="${i}">${esc(x)}</button>`).join('')}</div>`;
  if (REFS_OK.has(S.mode)) { box.ondragover = (e) => { e.preventDefault(); box.classList.add('drop'); }; box.ondragleave = () => box.classList.remove('drop'); box.ondrop = (e) => { e.preventDefault(); box.classList.remove('drop'); attachRefs([...(e.dataTransfer?.files || [])], () => renderComposer()); }; } else box.ondragover = box.ondrop = null;
  box.querySelectorAll('[data-flex]').forEach((b) => (b.onclick = () => { F().prompt = FL_EX[S.mode][+b.dataset.flex]; renderComposer(true); }));
  renderComposer();
}
let studioPreview = () => {};
// ---------- workspace shell: tool rail · work area · settings panel ----------
const RAIL = [
  ['Create', [['ideas', '✨', 'Ideas'], ['ad', '🛍', 'Ad'], ['image', '🖼', 'Image'], ['video', '🎬', 'Video'], ['voice', '🎙', 'Voice'], ['edit', '✂', 'Edit'], ['schedule', '📅', 'Schedule'], ['soon3d', '🧊', '3D', 'Coming soon']]],
  ['Library', [['media', '▦', 'All media'], ['chars', '☺', 'Characters'], ['products', '▣', 'Products']]],
];
const LIB_MODES = new Set(['media', 'chars', 'products']);
const COMPOSER_MODES = new Set(['ad', 'image', 'voice']);
const FL_TITLE = { ad: 'Make an ad', image: 'Make an image', voice: 'Make a voice-over' };
const FL_NOUN = { ad: 'ads', image: 'images', voice: 'voice-overs' };
const FL_EX = {
  ad: ['50% off today only, free shipping', 'Halal and safe for sensitive skin', 'New arrival, limited stock'],
  image: ['Product on a marble table, soft morning light', 'Flat lay with flowers, top view', 'A young woman holding the product in a cafe'],
  voice: ['Hai semua! Hari ni saya nak kongsi satu produk yang memang best.', 'Limited time offer. Tap the yellow basket now!', 'Jom cuba sekarang, stok terhad!'],
};
const TIER_MODEL = { motion: ['Motion (photo + voice)', 'ffmpeg, no AI video'], lite: ['MiniMax H3 Turbo', 'minimax/h3-max-turbo/image-to-video'], fast: ['MiniMax H3 Turbo HD', 'minimax/h3-max-turbo/image-to-video'], studio: ['VEED Fabric lip-sync', 'veed/fabric-1.0'], premium: ['OmniHuman 1.5', 'fal-ai/bytedance/omnihuman/v1.5'] };
const VIDEO_FAL = { 'h3-turbo': 'minimax/h3-max-turbo/image-to-video', 'seedance-fast': 'bytedance/seedance-2.0/fast/image-to-video', 'kling-std': 'fal-ai/kling-video/v3/standard/image-to-video', 'kling-pro': 'fal-ai/kling-video/v3/pro/image-to-video' };
// Which AI model the current tool will use (all run on fal.ai).
const LANG_SHORT = { ms: 'BM', en: 'EN', manglish: 'BM+EN' };
function llmName() {
  const W = S.app.catalog?.writers; if (W && W[IDEAS.writer]) return W[IDEAS.writer].name;
  const m = String(S.app.llmModel || '').toLowerCase();
  if (/gemini-2\.5-flash/.test(m)) return 'Gemini 2.5 Flash';
  if (/gemini-2\.5-pro/.test(m)) return 'Gemini 2.5 Pro';
  if (/gpt-?5/.test(m)) return 'GPT-5'; if (/gpt-?4o/.test(m)) return 'GPT-4o';
  if (/claude/.test(m)) return 'Claude';
  return m.split('/').pop() || 'AI writer';
}
function modelInfo() {
  const c = S.app.catalog, m = S.mode;
  if (m === 'ad') { const k = F().tier || 'lite'; return { name: TIER_MODEL[k]?.[0] || k, fal: TIER_MODEL[k]?.[1], note: `${TIER_NAME[k] || k} quality. ${TIER_DESC[k] || ''}`, extra: 'Script: AI writer · Picture: ' + (c.tiers?.[k] && ['fast', 'studio', 'premium'].includes(k) ? 'Nano Banana 2' : 'Seedream 4') + ' · Voice: ElevenLabs or MiniMax' }; }
  if (m === 'video') { const k = SHOT.model; return { name: c.videoModels?.[k]?.label || k, fal: VIDEO_FAL[k], note: c.videoModels?.[k]?.tag || '', extra: 'Start picture: Nano Banana 2' }; }
  if (m === 'image') return F().quality === 'lite' ? { name: 'Seedream 4', fal: 'fal-ai/bytedance/seedream/v4', note: 'Good quality and cheaper. Upgrade to Creator for the sharpest model.' } : { name: 'Nano Banana 2', fal: 'fal-ai/nano-banana-2', note: 'Sharpest images. Keeps your character and product when you add them.' };
  if (m === 'voice') {
    const f = F();
    if (f.kind === 'sfx') return { name: 'ElevenLabs Sound Effects', fal: 'fal-ai/elevenlabs/sound-effects/v2', note: 'Short sounds from a description.' };
    if (f.kind === 'music') return { name: 'ElevenLabs Music', fal: 'fal-ai/elevenlabs/music', note: 'Background tracks from a description.' };
    return String(f.voice).startsWith('el:') ? { name: 'ElevenLabs voices', fal: 'fal-ai/elevenlabs/tts', note: 'Natural English voices.' } : { name: 'MiniMax Speech', fal: 'fal-ai/minimax/speech-02-hd', note: 'Best for Bahasa Melayu, and your cloned voice.' };
  }
  if (m === 'ideas') return { name: llmName(), writer: true, fal: S.app.llmModel || 'openrouter/router', note: 'Writes ideas, prompts and storyboards.', extra: 'Sketches: FLUX Schnell · Keyframes: ' + (canUse('creator') ? 'Nano Banana 2' : 'Seedream 4 Edit') };
  if (LIB_MODES.has(m)) return { name: 'Your library', fal: '', note: 'Characters and products are used as references by the image and video models.' };
  if (m === 'edit') return { name: 'No AI needed to join clips', fal: '', note: 'New voice-overs use ElevenLabs or MiniMax. New music uses ElevenLabs Music.' };
  return { name: 'No AI model', fal: '', note: 'Scheduling and posting do not use credits.' };
}
function modelCard() {
  const i = modelInfo();
  return `<div class="zz-top"><h2>Model</h2><button class="link" data-open="models">All models</button></div>
    <div class="mdl"><b>${esc(i.name)}</b>${i.fal ? `<code>${esc(i.fal)}</code>` : ''}<small>${esc(i.note)}</small>${i.extra ? `<small>${esc(i.extra)}</small>` : ''}</div>
    <p class="mdl-foot">Runs on fal.ai · ${S.app.mode === 'local' ? 'everything unlocked on your PC' : `your plan: ${access() === 'free' ? 'Free trial' : PLAN_LABEL[access()]}`}</p>`;
}
function galleryHTML() {
  const want = TOOL_JOBS[S.mode] || [];
  const list = S.jobs.filter((j) => want.includes(j.tool)).slice(0, 8);
  if (!list.length) return `<div class="fl-empty"><span>${'✿'}</span><b>Start creating or drop media</b><small>Your ${FL_NOUN[S.mode] || 'work'} will appear here. Type below, or tap an example.</small></div>`;
  return list.map((j) => {
    const t = thumbOf(j), step = j.steps?.find((x) => x.status === 'running'), audio = j.outputs.some((o) => o.type === 'audio');
    return `<button class="hs-card" data-job="${j.id}"><div class="hs-th">${j.status === 'running' ? `<div class="hs-run"><i></i><small>${esc(step?.label || 'Starting')}…</small></div>` : t ? (t.type === 'video' ? `<video src="${t.url}#t=0.3" muted preload="metadata"></video>` : `<img src="${t.url}" alt="">`) : `<div class="hs-run"><small>${j.status === 'error' ? 'Failed' : audio ? '🎙 Audio' : j.status === 'review' ? 'Check the script' : '…'}</small></div>`}</div><p>${esc(j.title || '')}</p></button>`;
  }).join('');
}
function libraryPage() {
  if (S.mode === 'media') return `<div class="fl-head"><h1>All media</h1><p>Everything you have made. Tap one to open, post or edit it.</p></div>`;
  const chars = S.mode === 'chars';
  const list = chars ? S.friends : S.products;
  return `<div class="fl-head"><h1>${chars ? 'Characters' : 'Products'}</h1><p>${chars ? 'The faces Kravitas keeps the same in every image and video.' : 'What you sell. Add each product once, then pick it in any tool.'}</p></div>
    <div class="lib-grid">${list.map((x) => `<div class="lib-it"><span class="lib-ph" style="background-image:url('${chars ? x.photos?.[0] || '' : x.image}')"></span><b>${esc(x.name)}</b><small>${esc(chars ? x.note || '' : x.price || '')}</small></div>`).join('')}
      <button class="lib-it new" data-new="${chars ? 'friend' : 'product'}"><span class="lib-ph">＋</span><b>${chars ? 'Add character' : 'Add product'}</b><small>${chars ? '1–3 clear photos' : 'One clear photo'}</small></button>
      ${chars ? '<button class="lib-it new" data-act="avatars"><span class="lib-ph">🎭</span><b>AI avatars</b><small>Ready-made creators</small></button>' : ''}</div>`;
}
function renderStudio() {
  const comp = COMPOSER_MODES.has(S.mode), lib = LIB_MODES.has(S.mode);
  document.body.dataset.tool = S.mode;
  document.body.classList.toggle('is-lib', lib);
  $('#presets').innerHTML = `
    <nav class="ws-rail" aria-label="Tools">
      ${RAIL.map(([g, items], gi) => `${gi ? '<hr>' : ''}<small>${g}</small>${items.map(([k, ic, l, soon]) => soon ? `<button class="soon" data-soon="${l}" title="${l} is coming soon"><i>${ic}</i><span>${l}</span><em>Soon</em></button>` : `<button data-mode="${k}" class="${k === S.mode ? 'on' : ''}" aria-current="${k === S.mode}" title="${l}"><i>${ic}</i><span>${l}</span></button>`).join('')}`).join('')}
      <div class="ws-rail-foot"><button data-open="models" title="Models"><i>◆</i><span>Models</span></button><button data-collapse title="Collapse"><i>◧</i><span>Collapse</span></button></div>
    </nav>
    <section class="bento zz ws">
      <div class="ws-center">
        <div class="bx zz-shot"><div id="zz-main"></div></div>
        ${comp || lib || S.mode === 'ideas' ? '' : `<div class="bx zz-strip"><div class="zz-top"><h2>Recent</h2><span>Tap to open</span></div><div class="zz-row2" id="hs-strip">${stripHTML()}</div></div>`}
      </div>
      <aside class="ws-side">
        <div class="bx ws-model" id="zz-model"></div>
        <div class="bx" id="zz-s1"></div>
        <div class="bx" id="zz-s2"></div>
        <div class="bx" id="zz-s3"></div>
      </aside>
    </section>`;
  if (lib) { $('#zz-main').innerHTML = libraryPage(); $('#zz-model').innerHTML = modelCard(); ['#zz-s1', '#zz-s2', '#zz-s3'].forEach((id) => { $(id).hidden = true; }); return; }
  fillSides();
  renderMain();
}
// side-card clicks (delegated once)
document.addEventListener('click', (e) => {
  const t = e.target;
  const fr = t.closest('#presets [data-fr]');
  if (fr) {
    if (S.mode === 'video') { SHOT.friendId = fr.dataset.fr; fillSides(); return studioPreview(); }
    F().friendId = F().friendId === fr.dataset.fr ? null : fr.dataset.fr; fillSides(); renderComposer(); if (S.mode === 'ad') $('#zz-main') && renderMain(); return;
  }
  const pd = t.closest('#presets [data-pd]');
  if (pd) { F().productId = pd.dataset.pd; fillSides(); return renderMain(); }
  const tp = t.closest('#presets [data-tpl]');
  if (tp) { const x = HOME_TPLS[+tp.dataset.tpl]; Object.assign(SHOT, { prompt: x[2], camera: x[3], style: x[4] }); fillSides(); return renderMain(); }
  const st = t.closest('#presets [data-st]');
  if (st) {
    if (S.mode === 'video') { SHOT.style = st.dataset.st; fillSides(); return studioPreview(); }
    F().style = st.dataset.st; fillSides(); return renderMain();
  }
  const pj = t.closest('#presets [data-postjob]');
  if (pj) { const j = S.jobs.find((x) => x.id === pj.dataset.postjob); return postModal(j, [...j.outputs].reverse().find((o) => o.type === 'video')); }
});

// ---------- avatars ----------
function avatarLibraryModal() {
  const list = S.app.catalog.avatars || [];
  const m = modal(`<h2>Avatar library</h2>
    <p class="muted" style="margin:0">Ready-made AI creators (not real people). Pick one and they're added to your friends with a consistent face.${S.app.mode === 'preview' ? '' : ` Uses ${S.app.catalog.price.image} credits to render their photo.`}</p>
    <div class="avgrid">${list.map((p) => `<button class="avc" data-av="${p.id}"><img src="${portrait(p.look, p.id)}" alt=""><b>${esc(p.name)}</b><small>${esc(p.tagline)}</small></button>`).join('')}
      <button class="avc new" data-act="createAvatar"><span>＋</span><b>Create your own</b><small>Design a look</small></button></div>`, 'wide');
  m.querySelectorAll('[data-av]').forEach((b) => (b.onclick = async () => {
    b.disabled = true;
    try {
      const job = await api('/api/jobs', { tool: 'avatarGen', input: { preset: b.dataset.av } });
      S.jobs.unshift(job); poll(); closeModal(); renderAll();
      toast(`Creating ${list.find((x) => x.id === b.dataset.av)?.name}… they'll appear in your friends`);
    } catch (e) { toast(e.message, true); b.disabled = false; if (e.code === 'credits' || e.code === 'plan') accountModal(); }
  }));
}

const LOOK_FIELDS = {
  gender: ['woman', 'man'],
  age: ['early 20s', '20s', '30s', '40s', '50s'],
  skin: Object.keys(SKIN),
  hair: ['pastel hijab', 'black hijab', 'navy hijab', 'long wavy black hair', 'shoulder-length black bob', 'short black hair', 'short fade', 'short black hair, light beard'],
  style: ['friendly smile', 'energetic, excited', 'calm, trustworthy', 'stylish, confident', 'playful, Gen Z energy'],
};
function avatarBuilderModal() {
  const look = { gender: 'woman', age: '20s', skin: 'warm tan', hair: 'pastel hijab', style: 'friendly smile', outfit: 'cream blouse', bg: 'bright bedroom' };
  const sel = (k) => `<label class="l">${k === 'skin' ? 'Skin tone' : k[0].toUpperCase() + k.slice(1)}</label><select class="in" data-look="${k}">${LOOK_FIELDS[k].map((v) => `<option ${v === look[k] ? 'selected' : ''}>${v}</option>`).join('')}</select>`;
  const n = S.app.mode === 'preview' ? 4 : 4;
  const m = modal(`<h2>Create your AI avatar</h2>
    <p class="muted" style="margin:0">Design a fictional creator. You get ${n} options to pick from; the one you save keeps the same face in every video.</p>
    <div class="builder">
      <div class="bprev"><img id="avprev" alt=""><small>Rough preview</small></div>
      <div class="bform">
        <label class="l">Name</label><input class="in" id="avname" value="Zara" maxlength="40">
        <div class="row2">${sel('gender')}${sel('age')}</div>
        <div class="row2">${sel('skin')}${sel('hair')}</div>
        ${sel('style')}
        <label class="l">Outfit</label><input class="in" data-look="outfit" value="${esc(look.outfit)}">
        <label class="l">Background</label><input class="in" data-look="bg" value="${esc(look.bg)}">
      </div>
    </div>
    <div class="acts" style="margin-top:16px"><button class="btn pri" id="avgo">Generate ${n} options · ✦ ${S.app.catalog.price.image * n}</button></div>`, 'wide');
  const upd = () => { $('#avprev', m).src = drawPortrait(look); };
  m.querySelectorAll('[data-look]').forEach((el) => (el.oninput = el.onchange = () => { look[el.dataset.look] = el.value; upd(); }));
  upd();
  $('#avgo', m).onclick = async (e) => {
    e.target.disabled = true;
    try {
      const job = await api('/api/jobs', { tool: 'avatarGen', input: { look, count: n, name: $('#avname', m).value.trim() || 'My avatar' } });
      S.jobs.unshift(job); poll(); closeModal(); renderAll();
      toast('Creating your avatar options. Open the card when it’s done and save your favourite');
    } catch (err) { toast(err.message, true); e.target.disabled = false; if (err.code === 'credits' || err.code === 'plan') accountModal(); }
  };
}

async function saveAvatarFromJob(j, cur) {
  const img = cur?.type === 'image' ? cur.url : j.outputs.find((o) => o.type === 'image')?.url;
  if (!img) return;
  try {
    const f = await api('/api/friends', { name: j.input?.name || 'My avatar', photos: [img], consent: true, note: 'AI avatar' });
    await load(); closeModal(); renderAll();
    toast(`${f.name} saved to your friends`);
  } catch (e) { toast(e.message, true); }
}

// ---------- voice cloning ----------
function voiceCloneModal() {
  let audio = null, rec = null, chunks = [];
  const m = modal(`<h2>Clone your voice</h2>
    <p class="muted" style="margin:0">Record or upload 30–60 seconds of clear speech. Your voice then reads every script, in BM or English.</p>
    <label class="l">Name</label><input class="in" id="vcname" value="My voice" maxlength="40">
    <label class="l">Sample</label>
    <div class="acts"><button class="btn" id="vcrec">● Record</button><label class="btn" style="cursor:pointer">⬆ Upload audio<input type="file" id="vcfile" accept="audio/*" hidden></label></div>
    <div id="vcstate" class="hint">Tip: read a product description out loud, naturally, in a quiet room.</div>
    <label class="check" style="display:flex;gap:8px;align-items:flex-start;margin-top:12px;font-size:13px"><input type="checkbox" id="vcok" style="margin-top:3px"> <span>This is my own voice, or I have the speaker’s permission to clone it.</span></label>
    <div class="acts" style="margin-top:14px"><button class="btn pri" id="vcgo">Clone voice · ✦ ${S.app.catalog.price.voiceClone || 125}</button></div>
    ${(S.voices || []).length ? `<label class="l" style="margin-top:22px">Your voices</label><div class="vlist">${S.voices.map((v) => `<div class="vrow"><b>★ ${esc(v.name)}</b>${v.preview_url ? `<audio src="${v.preview_url}" controls preload="none"></audio>` : ''}<button class="link" data-delv="${v.id}">Delete</button></div>`).join('')}</div>` : ''}`);
  const setAudio = (dataUrl, label) => { audio = dataUrl; $('#vcstate', m).innerHTML = `✓ ${esc(label)} <audio src="${dataUrl}" controls></audio>`; };
  const toData = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
  $('#vcfile', m).onchange = async (e) => { const f = e.target.files[0]; if (f) setAudio(await toData(f), f.name); };
  $('#vcrec', m).onclick = async (e) => {
    if (rec) { rec.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      rec = new MediaRecorder(stream); chunks = [];
      rec.ondataavailable = (ev) => chunks.push(ev.data);
      rec.onstop = async () => { stream.getTracks().forEach((t) => t.stop()); e.target.textContent = '● Record again'; rec = null; setAudio(await toData(new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' })), 'Recording'); };
      rec.start(); e.target.textContent = '■ Stop'; $('#vcstate', m).textContent = 'Recording… read naturally for 30–60 seconds.';
    } catch { toast('Microphone is blocked here. Upload a recording instead', true); }
  };
  m.querySelectorAll('[data-delv]').forEach((b) => (b.onclick = async () => { await api('/api/voices/' + b.dataset.delv, null, 'DELETE'); await load(); voiceCloneModal(); }));
  $('#vcgo', m).onclick = async (e) => {
    if (!audio) return toast('Record or upload a sample first', true);
    if (!$('#vcok', m).checked) return toast('Please confirm you have permission to clone this voice', true);
    e.target.disabled = true; e.target.textContent = 'Cloning…';
    try {
      const v = await api('/api/voices', { name: $('#vcname', m).value, audio, consent: true });
      await load();
      S.forms.voice = { ...(S.forms.voice || DEFAULTS.voice()), voice: `clone:${v.id}`, kind: 'tts' };
      closeModal(); setMode('voice'); renderAll();
      toast(`★ ${v.name} is ready. It's now in every voice picker`);
    } catch (err) { toast(err.message, true); e.target.disabled = false; e.target.textContent = 'Clone voice'; if (err.code === 'credits' || err.code === 'plan') accountModal(); }
  };
}

// ---------- storyboard ----------
const MOTIONS = ['slow cinematic push-in', 'slow pull back revealing the scene', 'smooth pan left to right', 'orbit around the subject', 'crane up', 'handheld, natural shake', 'static, subtle movement'];
async function storyboardModal({ board, reuseFrom, input }) {
  const base = { ...DEFAULTS.story(), ...(input || {}) };
  let b = board ? JSON.parse(JSON.stringify(board)) : null;
  const m = modal(`<div class="sb"><div class="sb-h"><div><span class="eyebrow">${reuseFrom ? 'Edit & re-render' : 'Storyboard'}</span><h2>${reuseFrom ? 'Change what you want' : 'Plan your video'}</h2></div></div>
    <div id="sbbody"></div></div>`, 'wide');
  const body = $('#sbbody', m);
  const draw = () => {
    if (!b) {
      body.innerHTML = `<p class="muted">Describe the video and Kravitas writes a scene-by-scene plan you can edit before anything is generated (✦ ${S.app.catalog.price.llm}).</p>
        <textarea class="in" id="sbp" rows="3" placeholder="e.g. 5 surprising facts about Malaysia most people don't know">${esc(base.prompt || '')}</textarea>
        <div class="acts" style="margin-top:10px"><select class="in" id="sbn" style="width:auto">${[3, 4, 5, 6].map((n) => `<option ${n === (base.scenes || 4) ? 'selected' : ''} value="${n}">${n} scenes</option>`).join('')}</select>
        <button class="btn pri" id="sbplan">Plan scenes</button><button class="btn" id="sbblank">Start blank</button></div>`;
      $('#sbplan', m).onclick = async (e) => {
        const prompt = $('#sbp', m).value.trim();
        if (!prompt) return toast('Describe the video first', true);
        e.target.disabled = true; e.target.textContent = 'Planning…';
        try {
          b = await api('/api/storyboard/plan', { prompt, scenes: +$('#sbn', m).value, lang: base.lang, tone: base.tone });
          base.prompt = prompt; draw(); load().then(() => { $('#credits').textContent = `✦ ${S.app.credits.toLocaleString()}`; });
        } catch (err) { toast(err.message, true); e.target.disabled = false; e.target.textContent = 'Plan scenes'; }
      };
      $('#sbblank', m).onclick = () => { b = { title: '', caption: '', hashtags: [], scenes: [{ narration: '', visual: '', motion: MOTIONS[0] }] }; draw(); };
      return;
    }
    const orig = board?.scenes || [];
    body.innerHTML = `<label class="l">Title</label><input class="in" id="sbt" value="${esc(b.title || '')}">
      <div class="scenes">${b.scenes.map((s, k) => {
        const changed = reuseFrom && JSON.stringify(orig[k]) !== JSON.stringify(s);
        return `<div class="scene ${changed ? 'chg' : ''}" data-k="${k}">
          <div class="sc-h"><b>Scene ${k + 1}</b>${reuseFrom ? `<span class="tagx">${changed ? 'will re-render' : 'kept'}</span>` : ''}<span class="sp"></span>
            <button class="link" data-mv="-1" ${k ? '' : 'disabled'}>↑</button><button class="link" data-mv="1" ${k < b.scenes.length - 1 ? '' : 'disabled'}>↓</button><button class="link" data-rm ${b.scenes.length > 1 ? '' : 'disabled'}>Remove</button></div>
          <label class="l">Narration (what the voice says)</label><textarea class="in" data-f="narration" rows="2">${esc(s.narration)}</textarea>
          <label class="l">Visual (what we see)</label><textarea class="in" data-f="visual" rows="2">${esc(s.visual)}</textarea>
          <label class="l">Camera</label><select class="in" data-f="motion">${[...new Set([s.motion, ...MOTIONS])].filter(Boolean).map((x) => `<option ${x === s.motion ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>
        </div>`;
      }).join('')}</div>
      <div class="acts"><button class="btn" id="sbadd" ${b.scenes.length >= 8 ? 'disabled' : ''}>＋ Add scene</button></div>
      <label class="l">Caption & hashtags</label><textarea class="in" id="sbc" rows="2">${esc([b.caption, (b.hashtags || []).join(' ')].filter(Boolean).join('\n'))}</textarea>
      <div class="sb-f"><span class="muted" id="sbest">✦ …</span><button class="btn pri" id="sbgo">${reuseFrom ? 'Re-render changes' : 'Generate video'}</button></div>`;
    const est = async () => { try { const r = await api('/api/estimate', { tool: 'story', input: { ...base, board: b } }); $('#sbest', m).textContent = reuseFrom ? `✦ up to ${r.credits} · unchanged scenes are reused free` : `✦ ${r.credits} credits`; } catch {} };
    body.oninput = (e) => {
      const card = e.target.closest('.scene');
      if (card && e.target.dataset.f) b.scenes[+card.dataset.k][e.target.dataset.f] = e.target.value;
      if (e.target.id === 'sbt') b.title = e.target.value;
      if (e.target.id === 'sbc') { const lines = e.target.value.split('\n'); const tags = lines.join(' ').match(/#[\wÀ-ɏ]+/g) || []; b.hashtags = tags; b.caption = lines.filter((l) => !/^\s*#/.test(l)).join(' ').replace(/#[\wÀ-ɏ]+/g, '').trim(); }
      if (card && reuseFrom) { const k = +card.dataset.k; const ch = JSON.stringify(orig[k]) !== JSON.stringify(b.scenes[k]); card.classList.toggle('chg', ch); const t = card.querySelector('.tagx'); if (t) t.textContent = ch ? 'will re-render' : 'kept'; }
      clearTimeout(body._t); body._t = setTimeout(est, 300);
    };
    body.onchange = body.oninput;
    body.onclick = (e) => {
      const card = e.target.closest('.scene'); const k = card ? +card.dataset.k : -1;
      if (e.target.closest('[data-mv]')) { const d = +e.target.closest('[data-mv]').dataset.mv; [b.scenes[k], b.scenes[k + d]] = [b.scenes[k + d], b.scenes[k]]; draw(); }
      if (e.target.closest('[data-rm]')) { b.scenes.splice(k, 1); draw(); }
    };
    $('#sbadd', m).onclick = () => { b.scenes.push({ narration: '', visual: '', motion: MOTIONS[0] }); draw(); };
    $('#sbgo', m).onclick = async (e) => {
      if (!b.scenes.some((s) => s.narration.trim())) return toast('Write the narration for at least one scene', true);
      e.target.disabled = true;
      try {
        const job = await api('/api/jobs', { tool: 'story', input: { ...base, prompt: base.prompt || b.title, board: b, reuseFrom: reuseFrom || undefined } });
        S.jobs.unshift(job); setMode('story'); closeModal(); renderAll(); poll();
        $('#feed').scrollIntoView({ behavior: 'smooth' });
      } catch (err) { toast(err.message, true); e.target.disabled = false; if (err.code === 'credits' || err.code === 'plan') accountModal(); }
    };
    est();
  };
  draw();
}

// ---------- auto-posting ----------
async function loadPosts() {
  try { [S.posts, S.accounts] = await Promise.all([api('/api/social/posts'), S.app.social ? api('/api/social/accounts') : Promise.resolve([])]); }
  catch { S.posts = S.posts || []; S.accounts = S.accounts || []; }
}

async function renderSchedule() {
  const el = $('#sched') || $('#presets');
  el.innerHTML = '<div class="empty" style="margin-top:30px">Loading…</div>';
  await loadPosts();
  const on = S.app.social;
  const posts = S.posts || [];
  const upcoming = posts.filter((p) => p.status === 'scheduled' || p.status === 'processing' || p.status === 'draft');
  const done = posts.filter((p) => !upcoming.includes(p));
  const days = Array.from({ length: 7 }, (_, k) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + k); return d; });
  const dayPosts = (d) => upcoming.filter((p) => p.scheduledAt && new Date(p.scheduledAt).toDateString() === d.toDateString());
  const row = (p) => {
    const job = S.jobs.find((j) => j.id === p.jobId);
    const thumb = job?.outputs.find((o) => o.type === 'image')?.url;
    const st = p.status === 'processed' ? (p.results?.some((r) => r.success === false) ? 'partly failed' : 'posted') : p.status;
    return `<div class="prow">${thumb ? `<img src="${thumb}" alt="">` : '<span class="pt">▶</span>'}<div class="pi"><b>${esc((p.caption || job?.title || 'Post').slice(0, 80))}</b>
      <small>${p.platforms.map((x) => PLATFORM_META[x]?.name || x).join(' · ')} · ${p.scheduledAt ? new Date(p.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Posted now'}${p.aiLabel ? ' · AI label on' : ''}</small>
      ${(p.results || []).filter((r) => r.url || r.error).map((r) => (r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">View post ↗</a>` : `<span class="perr">${esc(r.error)}</span>`)).join(' ')}</div>
      <span class="pst ${st.replace(' ', '-')}">${st}</span></div>`;
  };
  el.innerHTML = `
    <div class="zz-sch-h"><p class="zz-lead" style="margin-top:0">Connect your accounts once, then post or schedule any video. TikTok and YouTube posts are labelled as AI-generated.</p>
      ${on ? '' : S.app.mode === 'preview' ? '' : '<div class="banner">Auto-posting switches on when POSTFORME_API_KEY is added on the server.</div>'}</div>
    <div class="accts">${Object.entries(PLATFORM_META).map(([k, p]) => {
      const acc = (S.accounts || []).find((a) => a.platform === k);
      return `<div class="acct ${acc ? 'on' : ''}"><span class="pic">${p.icon}</span><b>${p.name}</b><small>${acc ? esc(acc.username || 'Connected') : 'Not connected'}</small>
        ${acc ? `<button class="link" data-disc="${acc.id}">Disconnect</button>` : `<button class="btn ${on ? 'pri' : ''}" data-conn="${k}" ${on ? '' : 'disabled'}>Connect</button>`}</div>`;
    }).join('')}</div>
    <div class="strip-h"><h2>Next 7 days</h2><button class="btn pri" data-newpost>＋ Schedule a post</button></div>
    <div class="week">${days.map((d) => `<div class="day ${dayPosts(d).length ? 'has' : ''}"><small>${d.toLocaleDateString([], { weekday: 'short' })}</small><b>${d.getDate()}</b><span>${dayPosts(d).length ? `${dayPosts(d).length} post${dayPosts(d).length > 1 ? 's' : ''}` : '—'}</span></div>`).join('')}</div>
    <div class="strip-h"><h2>Queue</h2></div>
    <div class="plist">${upcoming.map(row).join('') || '<div class="empty">Nothing scheduled. Open any video in your creations and tap “Post / schedule”.</div>'}</div>
    ${done.length ? `<div class="strip-h"><h2>Posted</h2></div><div class="plist">${done.map(row).join('')}</div>` : ''}`;
  el.querySelectorAll('[data-conn]').forEach((b) => (b.onclick = async () => {
    try {
      const r = await api('/api/social/connect', { platform: b.dataset.conn });
      if (r.url) { window.open(r.url, '_blank', 'noopener'); toast('Finish connecting in the new tab, then come back'); setTimeout(renderSchedule, 4000); } else renderSchedule();
    } catch (e) { toast(e.message, true); }
  }));
  el.querySelectorAll('[data-disc]').forEach((b) => (b.onclick = async () => { if (!(await confirmBox('Disconnect this account?', 'Disconnect'))) return; await api('/api/social/accounts/' + b.dataset.disc, null, 'DELETE'); renderSchedule(); }));
  el.querySelector('[data-newpost]').onclick = () => pickVideoForPost();
}

function pickVideoForPost() {
  const vids = S.jobs.filter((j) => j.status === 'done' && j.outputs.some((o) => o.type === 'video'));
  if (!vids.length) return toast('Make a video first, then schedule it here', true);
  const m = modal(`<h2>Pick a video</h2><div class="pick">${vids.slice(0, 24).map((j) => { const t = j.outputs.find((o) => o.type === 'image')?.url; return `<button data-pj="${j.id}">${t ? `<img src="${t}" alt="">` : '<span>▶</span>'}<small>${esc(j.title.slice(0, 40))}</small></button>`; }).join('')}</div>`, 'wide');
  m.querySelectorAll('[data-pj]').forEach((b) => (b.onclick = () => { const j = S.jobs.find((x) => x.id === b.dataset.pj); postModal(j, [...j.outputs].reverse().find((o) => o.type === 'video')); }));
}

function captionFrom(j) {
  const t = j.text || '';
  const cap = /CAPTION:\s*(.+)/.exec(t)?.[1] || j.board?.caption || j.title || '';
  const tags = [...new Set(t.match(/#[\wÀ-ɏ]+/g) || j.board?.hashtags || [])].slice(0, 10).join(' ');
  return [cap, tags].filter(Boolean).join('\n\n');
}

async function postModal(j, video) {
  if (!video) return toast('This creation has no video to post', true);
  await loadPosts();
  const accts = S.accounts || [];
  const inHour = new Date(Date.now() + 3600e3); inHour.setMinutes(0, 0, 0);
  const local = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const m = modal(`<h2>Post or schedule</h2>
    <div class="pm"><video src="${video.url}" muted loop autoplay playsinline></video><div>
      <label class="l">Caption</label><textarea class="in" id="pmc" rows="5" maxlength="2200">${esc(captionFrom(j))}</textarea>
      <label class="l">Post to</label>
      ${accts.length ? `<div class="pacc">${accts.map((a) => `<label><input type="checkbox" value="${a.id}" checked> ${PLATFORM_META[a.platform]?.icon || ''} ${esc(PLATFORM_META[a.platform]?.name || a.platform)} <small>${esc(a.username || '')}</small></label>`).join('')}</div>`
        : `<p class="hint">No accounts connected yet. <a href="#" data-go="schedule">Connect them on the Schedule page</a>.</p>`}
      <label class="l">When</label>
      <div class="acts"><label class="radio"><input type="radio" name="when" value="now"> Now</label><label class="radio"><input type="radio" name="when" value="later" checked> Schedule</label>
        <input class="in" type="datetime-local" id="pmt" value="${local(inHour)}" style="width:auto"></div>
      <label class="check" style="display:flex;gap:8px;margin-top:12px;font-size:13px"><input type="checkbox" id="pmai" checked> Label as AI-generated (recommended; TikTok requires it)</label>
      <div class="acts" style="margin-top:16px"><button class="btn pri" id="pmgo" ${accts.length ? '' : 'disabled'}>Schedule</button></div>
    </div></div>`, 'wide');
  m.querySelectorAll('[name=when]').forEach((r) => (r.onchange = () => { const later = m.querySelector('[name=when]:checked').value === 'later'; $('#pmt', m).disabled = !later; $('#pmgo', m).textContent = later ? 'Schedule' : 'Post now'; }));
  $('#pmgo', m).onclick = async (e) => {
    const later = m.querySelector('[name=when]:checked').value === 'later';
    const ids = [...m.querySelectorAll('.pacc input:checked')].map((x) => x.value);
    if (!ids.length) return toast('Pick at least one account', true);
    e.target.disabled = true;
    try {
      await api('/api/social/posts', { jobId: j.id, mediaUrl: video.url, caption: $('#pmc', m).value, accountIds: ids, scheduledAt: later ? new Date($('#pmt', m).value).toISOString() : null, aiLabel: $('#pmai', m).checked, title: j.title });
      closeModal(); toast(later ? '✓ Scheduled' : '✓ Posting now'); S.posts = null;
      if (S.mode === 'schedule') renderAll();
    } catch (err) { toast(err.message, true); e.target.disabled = false; }
  };
}

// ---------- plans & credits ----------
function creditsModal(a, ledger) {
  const plans = CFG.plans || [], packs = CFG.packs || [];
  const perAd = 32; // Lite talking ad
  const m = modal(`<h2>Plans & credits</h2>
    <p style="font-size:38px;font-weight:800;letter-spacing:-.04em;margin:6px 0 2px">✦ ${a.credits.toLocaleString()}</p>
    <p class="muted" style="margin:0">Motion ad ≈ 9 credits · Lite talking ad ≈ ${perAd} · Fast ≈ 49 · an image 6–16 · a voice-over 1–3.</p>
    ${CFG.payments ? `<label class="l" style="margin-top:20px">Monthly plans</label>
    <div class="plans">${plans.map((p) => `<div class="plan ${a.plan === p.id ? 'cur' : ''}">${p.tag ? `<span class="ptag">${esc(p.tag)}</span>` : ''}<b>${esc(p.name)}</b>
      <div class="pp">${RM(p.price)}<small>/month</small></div><div class="pc">${p.credits.toLocaleString()} credits / month</div>
      <small class="muted">≈ ${Math.floor(p.credits / perAd)} Lite ads or ${Math.floor(p.credits / 9)} Motion ads</small>
      ${p.features?.length ? `<ul class="pf">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      ${a.plan === p.id ? '<span class="btn">Current plan</span>' : `<button class="btn pri" data-plan="${esc(p.id)}">Subscribe</button>`}</div>`).join('')}</div>
    ${a.plan ? '<p class="hint"><a href="#" id="portal">Manage or cancel your plan</a></p>' : '<p class="hint">Cancel anytime. Unused credits stay on your account.</p>'}
    <label class="l" style="margin-top:18px">One-off top-ups</label>
    <div class="packs">${packs.map((p) => `<button class="pack" data-pack="${esc(p.id)}">${p.tag ? `<span class="ptag">${esc(p.tag)}</span>` : ''}<b>${p.credits.toLocaleString()}</b><small>credits</small><span class="price">${RM(p.price)}</span></button>`).join('')}</div>
    <p class="hint">Secure checkout by Stripe: card, FPX online banking, GrabPay.</p>` : '<p class="hint" style="margin-top:14px">Plans are coming soon.</p>'}
    ${a.mode === 'preview' ? '<p class="hint">Preview: Subscribe simulates the plan (no payment) so you can try its features. Top-ups are off. <a href="#" id="reset">Reset preview data</a></p>' : ''}
    <p class="hint">Guest account on this browser. Account ID: <code style="user-select:all">${esc(a.userId)}</code></p>
    <label class="l" style="margin-top:18px">Activity</label>${ledgerTable(ledger)}
    <p class="hint" style="margin-top:14px"><a href="terms" target="_blank">Terms</a> · <a href="privacy" target="_blank">Privacy</a></p>`, 'wide');
  $('#reset', m) && ($('#reset', m).onclick = (e) => { e.preventDefault(); confirmBox('Clear all preview friends, products and creations?', 'Clear').then((ok) => ok && window.PreviewAPI.reset()); });
  $('#portal', m) && ($('#portal', m).onclick = async (e) => { e.preventDefault(); try { location.href = (await api('/api/billing/portal', {})).url; } catch (err) { toast(err.message, true); } });
  const go = (body) => async (e) => { e.target.disabled = true; try { location.href = (await api('/api/checkout', body)).url; } catch (err) { toast(err.message, true); e.target.disabled = false; } };
  m.querySelectorAll('[data-plan]').forEach((b) => (b.onclick = go({ plan: b.dataset.plan })));
  m.querySelectorAll('[data-pack]').forEach((b) => (b.onclick = go({ pack: b.dataset.pack })));
}

// header search: filter visible media cards by title
document.addEventListener('input', (e) => {
  if (e.target.id !== 'fl-q') return;
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll('#fl-gal .hs-card, #hs-strip .hs-card, #feed .grid > *').forEach((el) => { el.style.display = !q || el.textContent.toLowerCase().includes(q) ? '' : 'none'; });
});

document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-soon]'); if (b) toast(b.dataset.soon + ' is coming soon: turn a product photo into a spinning 3D shot.'); });
