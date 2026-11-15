// Brainstorm: Kravitas looks at the user's photos (friend + product + any image)
// and their prompt, then concludes what they have and what content will work.
import { run, toRemote, isMock, llmModel } from './fal.js';
import { parseJSON, LANGS } from './prompts.js';
import { MAX_REF_TEXT } from './refs.js';

export const BRAINSTORM_COST = 2;
export const FOLLOWUP_COST = 1;
const MODES = ['ad', 'video', 'image'];

const SETTINGS_HELP = `Allowed "settings" per mode (only use these keys/values):
- ad: format (talking|showcase), angle (review|problem|unboxing|deal|beforeafter|compare), platform (tiktok|shopee|lazada|instagram), seconds (8|10|15|20|30)
- video: camera (static|dolly-in|dolly-out|pan|orbit|crane|handheld|crash|fpv|tilt-up|tilt-down|zoom-out|tracking|low-angle|top-down|whip|rack|dolly-zoom), style (photo|cinematic|ugc|studio|3d|anime|clay|storybook), aspect (9:16|16:9|1:1), duration (5|8|10)
- image: style (same as video), aspect (9:16|1:1|4:5|16:9)`;

/** chat: [{role:'user'|'ai', text}] follow-up conversation; previous: the last conclusion to refine. */
export async function brainstorm({ mode, prompt, friend, product, image, lang, chat = [], previous = null, brand = '', refs = [], model = null, effort = 'balanced' }) {
  const refImages = refs.filter((r) => r.kind === 'image' && r.url).slice(0, 4);
  const refDocs = refs.filter((r) => r.kind === 'doc' && r.text).slice(0, 6);
  const images = [friend?.photos?.[0], product?.image, image, ...refImages.map((r) => r.url)].filter(Boolean);
  chat = (Array.isArray(chat) ? chat : []).slice(-12).map((c) => ({ role: c.role === 'user' ? 'user' : 'ai', text: String(c.text || '').slice(0, 500) }));
  if (isMock()) return mockBrainstorm({ mode, prompt, friend, product, lang, chat });
  const any = !MODES.includes(mode);
  const labels = [];
  if (friend?.photos?.[0]) labels.push(`Image ${labels.length + 1}: the user's "friend" character, ${friend.name}`);
  if (product?.image) labels.push(`Image ${labels.length + 1}: the product, ${product.name}`);
  if (image) labels.push(`Image ${labels.length + 1}: an extra image the user attached`);
  for (const r of refImages) labels.push(`Image ${labels.length + 1}: reference image "${r.name || 'untitled'}" (style, mood or competitor example)`);
  let budget = MAX_REF_TEXT;
  const docs = refDocs.map((r) => { const t = String(r.text).slice(0, Math.max(0, budget)); budget -= t.length; return t ? `--- Reference document "${r.name || 'untitled'}" ---\n${t}` : ''; }).filter(Boolean);
  const context = [
    any ? 'The user is brainstorming freely (not in a specific tool yet).' : `The user is currently in "${mode}" mode.`,
    brand && `About the user's brand / standing guidelines (always respect these): ${String(brand).slice(0, 1500)}`,
    docs.length && `The user attached reference documents. Pull real facts, numbers, claims, wording and audience details from them; prefer them over guesses:\n${docs.join('\n\n')}`,
    labels.length ? labels.join('\n') : 'No images attached.',
    product && `Product details: ${product.name}${product.price ? `, ${product.price}` : ''}${product.benefits ? `. Notes: ${product.benefits}` : ''}`,
    prompt?.trim() ? `THE USER'S REQUEST, follow it literally (may be messy, half-formed, mixed BM/English; make sense of them): """${prompt.trim()}"""` : 'The user has not typed anything yet.',
    `Today is ${new Date().toISOString().slice(0, 10)} (Malaysia). Use the calendar when it helps: payday around the 25th to 1st, double-date sales (11.11, 12.12), Raya, CNY, Deepavali, school holidays. Only mention an event that is actually close.`,
    'Malaysian ad rules: never promise cures, guaranteed results, "100%" or exact weight or skin results; no medical claims for supplements, tea or cosmetics; do not say "halal" unless the user said so; when the user asks for a claim like that, write a safe version (feel, routine, experience) and say so in "summary".',
    `Write hooks and prompts in ${LANGS[lang] || LANGS.en}.`,
    effort === 'quick' ? 'EFFORT: quick. Keep every field short and punchy, no padding, give only the strongest ideas.' : effort === 'deep' ? 'EFFORT: deep. Think it through carefully: weigh the audience, the platform and the offer, pick angles that are not obvious, and make each prompt rich in concrete detail (shot, light, wording).' : '',
  ].filter(Boolean).join('\n');
  const followUp = chat.length && chat[chat.length - 1].role === 'user' ? `

Your previous conclusion (JSON): ${JSON.stringify(previous || {}).slice(0, 3000)}

Conversation so far:
${chat.map((c) => `${c.role === 'user' ? 'User' : 'You'}: ${c.text}`).join('\n')}

The user's last message gives new direction. Update the whole conclusion to follow it (audience, selling points, hooks and ideas), keep what still fits, and set "reply" to one or two friendly sentences telling them what you changed.` : '';

  const imgUrls = await Promise.all(images.map(toRemote));
  const call = (m) => run('openrouter/router/vision', {
    model: m,
    image_urls: imgUrls,
    temperature: 0.7,
    system_prompt: `You are Kravitas, a sharp creative director for Malaysian content creators and affiliate marketers (TikTok Shop, Shopee, Reels). You study the user's photos and prompt, then conclude what they actually have and what content will perform. FOLLOW THE USER'S REQUEST FIRST: do exactly what their notes ask, even if it is not an ad (a poster, a ranking, an infographic, a meme, a story). Treat attached images as the reference to build on (same layout, characters, style) and say what you see in them. Only fall back to product-ad thinking when they gave a product or did not say what they want. Be concrete: refer to what you really see (colours, packaging, setting, expression, style). No generic advice. Never invent product claims that are not visible or given (especially health claims). Reply with ONLY a JSON object.`,
    prompt: `${context}

Return JSON:
{"summary": "2-3 sentences: what you see and your overall conclusion",
 "observations": ["4 short things you noticed in the images/prompt"],
 "audience": "who this content is for, one sentence",
 "sellingPoints": ["3-5 selling points or story angles"],
 "hooks": ["3 scroll-stopping first lines"],
 "ideas": [{"title": "short name", "mode": "${MODES.join('|')}", "why": "one sentence on why it fits", "prompt": "ready-to-use prompt for that mode", "panels": ["4 short storyboard beats, each under 14 words: hook, problem or product, proof, call to action"], "settings": {}}]}
If the user asked for ONE specific thing (one image, one poster, one video, one ad), return exactly 1 main idea that does exactly that, then at most 2 variations of it in the same mode. Only when the request is open or vague give ${any ? 6 : 4} ideas mixing at least 3 different modes. Best first. Each "prompt" must be a complete, ready-to-paste prompt (one or two sentences) that a tool could run as is; never a placeholder.${followUp ? '\nAlso include "reply": "..." in the JSON.' : ''}
${SETTINGS_HELP}${followUp}`,
  });
  let r;
  try { r = await call(model || llmModel()); if (model && !r?.output) throw new Error('empty'); } catch (e) { if (!model) throw e; r = await call(llmModel()); } // the chosen writer is unavailable: fall back to the default one
  try { return clean(parseJSON(r.output)); } catch { // truncated or fenced JSON: one more try before giving up
    r = await call(model || llmModel());
    return clean(parseJSON(r.output));
  }
}

// What the tools actually accept. The AI sometimes invents values (camera "zoom", seconds 12), so anything else is dropped here.
const STYLES = ['photo', 'cinematic', 'ugc', 'studio', '3d', 'anime', 'clay', 'storybook'];
const ALLOWED = {
  format: ['talking', 'showcase'], angle: ['review', 'problem', 'unboxing', 'deal', 'beforeafter', 'compare'], platform: ['tiktok', 'shopee', 'lazada', 'instagram'], seconds: [8, 10, 15, 20, 30],
  camera: ['static', 'dolly-in', 'dolly-out', 'pan', 'orbit', 'crane', 'handheld', 'crash', 'fpv', 'tilt-up', 'tilt-down', 'zoom-out', 'tracking', 'low-angle', 'top-down', 'whip', 'rack', 'dolly-zoom'],
  style: STYLES, aspect: ['9:16', '16:9', '1:1', '4:5'], duration: [5, 8, 10],
};
const PER_MODE = { ad: ['format', 'angle', 'platform', 'seconds'], video: ['camera', 'style', 'aspect', 'duration'], image: ['style', 'aspect'] };
export function cleanSettings(mode, raw) {
  const out = {};
  for (const k of PER_MODE[mode] || []) {
    const v = raw?.[k]; if (v == null) continue;
    const hit = ALLOWED[k].find((a) => String(a) === String(v));
    if (hit !== undefined) out[k] = hit;
  }
  return out;
}

export function clean(b) {
  const arr = (v, n) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, n) : []);
  return {
    reply: String(b.reply || ''),
    summary: String(b.summary || ''),
    observations: arr(b.observations, 6),
    audience: String(b.audience || ''),
    sellingPoints: arr(b.sellingPoints, 6),
    hooks: arr(b.hooks, 5),
    ideas: (Array.isArray(b.ideas) ? b.ideas : []).filter((i) => MODES.includes(i?.mode)).slice(0, 6).map((i) => ({
      title: String(i.title || 'Idea'), mode: i.mode, why: String(i.why || ''), prompt: String(i.prompt || ''),
      settings: cleanSettings(i.mode, i.settings),
      panels: arr(i.panels, 6).map((x) => x.slice(0, 120)),
    })),
  };
}

/** Demo-mode stand-in (no fal key): built from the product details and prompt. */
export function mockBrainstorm({ prompt, friend, product, lang, chat = [] }) {
  const ask = chat.filter((c) => c.role === 'user').map((c) => c.text).join('; ');
  const p = product?.name || 'your product';
  const who = friend?.name || 'your creator';
  const topic = prompt?.trim() || p;
  const bm = lang === 'ms';
  return {
    reply: ask ? `Noted: “${ask.slice(-120)}”. I nudged the ideas to match.` : '',
    summary: `${product ? `${p}${product.price ? ` at ${product.price}` : ''} is the hero here` : `Your idea "${topic}" is the starting point`}${friend ? `, and ${who} gives it a real face people can trust` : ''}.`,
    observations: [product ? `Product: ${p}` : 'No product attached', friend ? `Creator: ${who}` : 'No friend attached', prompt ? `Prompt: “${prompt.trim().slice(0, 60)}”` : 'No prompt yet', 'Vertical 9:16 suits TikTok & Reels'],
    audience: `Malaysian shoppers scrolling TikTok Shop and Shopee who buy on impulse when they see real people use a product.${ask ? ` Focus: ${ask.slice(-120)}` : ''}`,
    sellingPoints: (product?.benefits ? product.benefits.split(/[,.]/).map((s) => s.trim()).filter(Boolean) : ['Affordable', 'Easy to use', 'Looks good on camera']).slice(0, 4),
    hooks: bm ? [`Jangan beli ${p} sebelum tengok ni`, `${p} ni betul-betul berbaloi ke?`, `POV: korang jumpa ${p} separuh harga`] : [`Don't buy ${p} before watching this`, `Is ${p} actually worth it?`, `POV: you found ${p} at half price`],
    ideas: [
      { title: 'Honest review', mode: 'ad', panels: [`Close-up: “Jangan beli sebelum tengok ni”`, `${who} shows ${p}`, 'Texture and result shown to camera', 'Tap the yellow basket now'], why: 'Talking UGC converts best for a first impression.', prompt: product?.benefits || prompt?.trim().slice(0, 300) || `Honest first impressions of ${p}`, settings: { format: 'talking', angle: 'review' } },
      { title: 'Hero orbit shot', mode: 'video', panels: [`${p} appears in soft light`, 'Slow orbit around the pack', `${who} picks it up and smiles`, 'Logo and price on screen'], why: 'A slow orbit makes the product look premium.', prompt: `${who} holds ${p} up to the camera in soft window light`, settings: { camera: 'orbit', style: 'cinematic' } },
      { title: 'Listing packshot', mode: 'image', panels: [`${p} centred on pastel`, 'Soft shadow, clean edges', 'Detail close-up', 'Square crop for Shopee'], why: 'Clean images lift Shopee click-through.', prompt: `${p} on a seamless pastel background, soft shadows, premium e-commerce packshot`, settings: { style: 'studio', aspect: '1:1' } },
      { title: 'Problem → fix ad', mode: 'ad', panels: ['The annoying problem', `${p} comes in`, 'Before and after', 'Tap to try it today'], why: 'Showing the problem first keeps viewers to the end.', prompt: `3 reasons people are switching to ${p}`, settings: { format: 'showcase', angle: 'problem' } },
    ],
  };
}


// ---------- clarifying questions (asked BEFORE any ideas are written) ----------
const KIND_Q = { id: 'kind', q: 'What do you want Kravitas to make?', options: ['Image', 'Video', 'Ad (video with voice)', 'Not sure, suggest'] };
const SAID_KIND = /\b(image|photo|poster|picture|packshot|thumbnail|video|clip|reel|ad|iklan|ugc|micro ?drama|story|gambar|poster)\b/i;

const BG_Q = { id: 'background', q: 'What should the background be?', options: ['Clean studio', 'Real-life setting', 'Outdoors', 'Colourful or abstract', 'Keep it like my reference'] };
const SAID_BG = /\b(background|backdrop|setting|studio|outdoor|indoor|latar|white|plain)\b/i;

function cleanQuestions(raw, prompt) {
  const list = (Array.isArray(raw?.questions) ? raw.questions : []).slice(0, 5).map((x, n) => ({
    id: String(x.id || `q${n}`).replace(/[^a-z0-9_]/gi, '').slice(0, 20) || `q${n}`,
    q: String(x.q || '').slice(0, 140),
    multi: x.multi === true,
    options: (Array.isArray(x.options) ? x.options : []).map((o) => String(o).slice(0, 48)).filter(Boolean).slice(0, 5),
  })).filter((x) => x.q && x.options.length >= 2);
  if (!list.length && SAID_KIND.test(prompt || '') && (prompt || '').length > 160) return []; // a long, specific brief needs no survey
  // Two questions always matter: what to make (image, video or ad) and what the background is. Add them when the AI or the notes missed them.
  if (!list.some((x) => /background|setting|backdrop|scene/i.test(x.id)) && !SAID_BG.test(prompt || '')) list.splice(Math.min(1, list.length), 0, BG_Q);
  if (!SAID_KIND.test(prompt || '') && !list.some((x) => /kind|format|make|type/i.test(x.id))) list.unshift(KIND_Q);
  return list.slice(0, 5);
}

/** A few short questions that remove guesswork. Returns [] when the brief is already clear. Free for the user. */
export async function clarify({ prompt, friend, product, image, lang, refs = [], brand = '', model = null }) {
  const refImages = refs.filter((r) => r.kind === 'image' && r.url).slice(0, 3);
  const images = [friend?.photos?.[0], product?.image, image, ...refImages.map((r) => r.url)].filter(Boolean);
  if (isMock()) return cleanQuestions({ questions: [] }, prompt);
  const imgUrls = await Promise.all(images.map(toRemote));
  const r = await run('openrouter/router/vision', {
    model: model || llmModel(),
    image_urls: imgUrls,
    temperature: 0.4,
    system_prompt: `You are Kravitas, a creative director for Malaysian creators. Before writing any ideas you ask the user a few SHORT multiple-choice questions so the result fits what they really want. Look at their notes and any attached images first.
Rules:
- Ask 3 to 5 questions, no more. Each question must change the result (for example: image or video or ad; model wearing it or flat product shot; where it will be posted; tone; one item or a set; what is on the front and back).
- NEVER ask something the notes or images already answer. If the notes are already very specific and complete, return {"questions": []}.
- Questions are plain and friendly, under 14 words. Options are short (1 to 4 words), 2 to 5 per question, no "other" option (the app adds it).
- Use ids: "kind" for image/video/ad/other, otherwise a short lowercase word.
- ${lang === 'ms' ? 'Write in Bahasa Melayu.' : lang === 'manglish' ? 'Write in casual Manglish.' : 'Write in English.'}
- Always cover the background or setting unless the notes or images already decide it. Also consider: who it is for, mood or style, what must stay exactly as in the reference images, and how it will be used.
- Set "multi": true only when several answers can be true at once (for example which benefits to show); otherwise leave it false.
Return JSON only: {"questions":[{"id":"kind","q":"...","multi":false,"options":["...","..."]}]}`,
    prompt: `${brand ? `Brand notes: ${String(brand).slice(0, 600)}\n` : ''}${product ? `Product: ${product.name}${product.price ? `, ${product.price}` : ''}\n` : ''}User's notes:\n${String(prompt || '(none, only images)').slice(0, 2500)}`,
  });
  try { return cleanQuestions(parseJSON(r.output), prompt); } catch { return cleanQuestions({ questions: [] }, prompt); }
}
