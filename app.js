// Kravitas — the web app (Express). server.js runs it as a normal server (local/Railway);
// api/index.js exports it as a Vercel serverless function.
// Hosted mode (Supabase configured): every visitor gets an anonymous guest account with its own credits.
// Local mode: one user on this computer, data in ./data.
import express from 'express';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import Stripe from 'stripe';
import { config, MODE, PACKS, PLANS, ROOT } from './lib/config.js';
import { store } from './lib/store/index.js';
import { saveDataUrl, saveAudioDataUrl, uid as newId } from './lib/media.js';
import { isMock, falKey, llmModel, run as falRun, toRemote } from './lib/fal.js';
import { TOOLS, STYLES, CAMERAS, createJob, expireStale, removeBg, live, planStory, planPanels, drawPanel } from './lib/pipelines.js';
import { WRITERS, VIDEO_MODELS, VOICES, PRICE, TIERS, EMOTIONS, MODELS, MARKUP, MODEL_PLAN, MAX_VARIANTS, allowed, imageCost } from './lib/models.js';
import { AVATAR_PRESETS } from './lib/avatars.js';
import * as social from './lib/social.js';
import { PLATFORMS, ANGLES, LANGS } from './lib/prompts.js';
import { hasFF } from './lib/ffmpeg.js';
import { securityHeaders, limit } from './lib/security.js';
import { brainstorm, BRAINSTORM_COST, FOLLOWUP_COST } from './lib/brainstorm.js';
import { readReference } from './lib/refs.js';

const stripe = config.stripeSecret ? new Stripe(config.stripeSecret) : null;
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(securityHeaders);
// Terms & Privacy pages, filled in from COMPANY_NAME / SUPPORT_EMAIL.
const legal = (name, title) => (req, res) => {
  const fs2 = (f) => readFileSync(path.join(ROOT, 'legal', f), 'utf8');
  const email = process.env.SUPPORT_EMAIL;
  const fill = (t) => t.replaceAll('{{COMPANY}}', esc(process.env.COMPANY_NAME || 'Treelion Enterprise'))
    .replaceAll('{{DATE}}', '27 October 2026')
    .replaceAll('{{CONTACT}}', email ? `Email <a href="mailto:${esc(email)}">${esc(email)}</a>` : 'Contact us through the support channel listed on our website.');
  res.type('html').send(fill(fs2('_layout.html').replace('{{TITLE}}', title).replace('{{BODY}}', fs2(name))));
};
const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
app.get('/terms', legal('terms.md.html', 'Terms of Service'));
app.get('/privacy', legal('privacy.md.html', 'Privacy Notice'));
app.get('/api/health', (req, res) => res.json({ ok: true, mode: MODE }));
// On Vercel the disk is read-only, so the platform needs Supabase to store anything.
if (process.env.VERCEL && MODE !== 'supabase') {
  app.use('/api', (req, res, next) => (req.path === '/config' ? next() : res.status(503).json({
    error: 'Setup needed: add SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in Vercel → Settings → Environment Variables, then redeploy.',
  })));
}

const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
  if (e.message === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: 'Not enough credits. Top up to continue.', code: 'credits' });
  if (!e.status || e.status >= 500) console.error(e);
  res.status(e.status || 400).json({ error: e.message || String(e), ...(e.code ? { code: e.code } : {}) });
});
const fail = (msg, status = 400) => Object.assign(new Error(msg), { status });

// ---------- Stripe webhook (needs the raw body, so it goes before express.json) ----------
async function grant(session) {
  if (session.payment_status !== 'paid') return false;
  const userId = session.metadata?.user_id || session.client_reference_id;
  const credits = parseInt(session.metadata?.credits, 10);
  if (!userId || !credits) return false;
  const isNew = await store.recordPayment({
    session_id: session.id, user_id: userId, credits, amount: session.amount_total || 0, currency: session.currency || config.currency,
  });
  if (isNew) {
    const plan = session.metadata?.plan;
    await store.adjust(userId, credits, plan ? `${PLANS.find((p) => p.id === plan)?.name || 'Plan'} plan · first month` : `Purchased ${credits} credits`, null, true);
    if (plan || session.customer) await store.setProfile(userId, { ...(plan ? { plan } : {}), ...(session.customer ? { stripe_customer: String(session.customer) } : {}) });
  }
  return isNew;
}

// Monthly renewals: add the plan's credits once per paid invoice.
async function grantRenewal(invoice) {
  if (invoice.billing_reason !== 'subscription_cycle' || !invoice.paid && invoice.status !== 'paid') return;
  const meta = invoice.parent?.subscription_details?.metadata || invoice.subscription_details?.metadata || {};
  const userId = meta.user_id, credits = parseInt(meta.credits, 10);
  if (!userId || !credits) return;
  const isNew = await store.recordPayment({ session_id: invoice.id, user_id: userId, credits, amount: invoice.amount_paid || 0, currency: invoice.currency || config.currency });
  if (isNew) await store.adjust(userId, credits, `${PLANS.find((p) => p.id === meta.plan)?.name || 'Plan'} plan · monthly credits`, null, true);
}
async function endPlan(sub) {
  const userId = sub.metadata?.user_id;
  if (userId) await store.setProfile(userId, { plan: null });
}

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), wrap(async (req, res) => {
  if (!stripe || !config.stripeWebhookSecret) throw fail('Stripe webhook not configured', 501);
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], config.stripeWebhookSecret);
  } catch (e) { throw fail(`Webhook signature failed: ${e.message}`); }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') await grant(event.data.object);
  if (event.type === 'invoice.paid') await grantRenewal(event.data.object);
  if (event.type === 'customer.subscription.deleted') await endPlan(event.data.object);
  res.json({ received: true });
}));

app.use(express.json({ limit: '25mb' }));
if (MODE === 'local') app.use('/media', express.static(path.join(ROOT, 'data', 'media'), { maxAge: '7d' }));
app.use(express.static(path.join(ROOT, 'public')));
app.get('/vendor/supabase.js', (req, res) => res.sendFile(path.join(ROOT, 'node_modules', '@supabase', 'supabase-js', 'dist', 'umd', 'supabase.js')));

// ---------- public config (no auth) ----------
app.get('/api/config', (req, res) => res.json({
  // On Vercel without Supabase, serve the browser-only clickable preview instead of a setup error.
  mode: process.env.VERCEL && MODE !== 'supabase' ? 'preview' : MODE,
  supabaseUrl: MODE === 'supabase' ? config.supabaseUrl : null,
  supabaseAnonKey: MODE === 'supabase' ? config.supabaseAnonKey : null,
  payments: !!stripe,
  currency: config.currency.toUpperCase(),
  packs: PACKS,
  plans: PLANS,
  social: social.socialEnabled(),
}));

// ---------- auth: guest accounts ----------
const known = new Set();
async function auth(req, res, next) {
  try {
    let uid = 'local';
    if (MODE === 'supabase') {
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      uid = token && (await store.userFromToken(token));
      if (!uid) return res.status(401).json({ error: 'Session expired, please reload the page.' });
    }
    if (!known.has(uid)) { await store.ensureProfile(uid); known.add(uid); }
    req.uid = uid;
    next();
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
}
const adminOnly = (req, res, next) => (config.adminToken && req.headers['x-admin-token'] === config.adminToken ? next() : res.status(403).json({ error: 'Forbidden' }));

// admin routes use their own token, not a guest session
app.get('/api/admin/users', adminOnly, wrap(async (req, res) => res.json(await store.users(200))));
app.post('/api/admin/credits', adminOnly, wrap(async (req, res) => {
  const { userId, credits, note } = req.body;
  const n = parseInt(credits, 10);
  if (!userId || !n) throw fail('userId and credits are required');
  res.json({ credits: await store.adjust(userId, n, note || 'Granted by admin', null, true) });
}));

app.use('/api', auth);

// ---------- plans: what each account may use ----------
async function planOf(uid) {
  if (MODE === 'local') return 'pro'; // your own PC: everything unlocked
  const p = await store.getProfile(uid);
  return p?.plan || 'free';
}
const PLAN_NAME = { basic: 'Basic', starter: 'Starter', creator: 'Creator', pro: 'Pro' };
const planFail = (what, need) => Object.assign(new Error(`${what} needs the ${PLAN_NAME[need]} plan or higher.`), { status: 403, code: 'plan' });
function checkPlan(plan, tool, i) {
  const tier = ['ugc', 'avatar', 'story'].includes(tool) ? TIERS[i.tier] || TIERS[tool === 'story' ? 'motion' : 'lite'] : null;
  if (tier && ['ugc', 'avatar', 'story'].includes(tool) && !allowed(plan, tier.plan)) throw planFail(`${tier.label} quality`, tier.plan);
  if (i.model && ['shot', 'story'].includes(tool) && !(tool === 'story' && (i.tier || 'motion') === 'motion')) {
    const need = MODEL_PLAN[i.model];
    if (need && !allowed(plan, need)) throw planFail(VIDEO_MODELS[i.model]?.label || 'That model', need);
  }
  if (tool === 'image' && i.quality === 'full' && !allowed(plan, 'creator')) throw planFail('Best image quality (Nano Banana 2)', 'creator');
  if (tool === 'ugc' && (i.variants || 1) > MAX_VARIANTS[plan]) throw planFail(`${i.variants} variations`, 'creator');
}
async function needPlan(uid, need, what) { const plan = await planOf(uid); if (!allowed(plan, need)) throw planFail(what, need); }

// ---------- state ----------
app.get('/api/state', wrap(async (req, res) => {
  const profile = await store.getProfile(req.uid);
  res.json({
    userId: req.uid, mode: MODE, mock: isMock(), ffmpeg: hasFF(), credits: profile?.credits ?? 0,
    llmModel: llmModel(), keySet: !!falKey(), payments: !!stripe, plan: profile?.plan || null, brand: String(profile?.prefs?.brand || ''), access: await planOf(req.uid), social: social.socialEnabled(),
    catalog: {
      videoModels: Object.fromEntries(Object.entries(VIDEO_MODELS).map(([k, m]) => [k, { label: m.label, tag: m.tag, perSec: m.perSec, endFrame: !!m.endFrame }])),
      tiers: Object.fromEntries(Object.entries(TIERS).map(([k, t]) => [k, { label: t.label, tag: t.tag, maxSec: t.maxSec, plan: t.plan }])),
      writers: WRITERS, modelPlan: MODEL_PLAN, maxVariants: MAX_VARIANTS, voices: VOICES, emotions: EMOTIONS, markup: MARKUP,
      avatars: AVATAR_PRESETS.map(({ id, name, tagline, look }) => ({ id, name, tagline, look })),
      styles: Object.keys(STYLES), cameras: Object.keys(CAMERAS), price: PRICE,
      platforms: Object.fromEntries(Object.entries(PLATFORMS).map(([k, p]) => [k, p.name])),
      angles: Object.keys(ANGLES), langs: Object.keys(LANGS),
    },
  });
}));

app.get('/api/ledger', wrap(async (req, res) => res.json(await store.ledger(req.uid, 100))));

// Local-mode only: the owner sets their own fal key and adds budget credits.
app.post('/api/settings', wrap(async (req, res) => {
  if (MODE !== 'local') throw fail('Settings are managed by the platform', 403);
  const { settings, saveSettings } = await import('./lib/store/local.js');
  const { falKey: k, llmModel: m, addCredits } = req.body;
  if (typeof k === 'string') settings.falKey = k.trim();
  if (m) settings.llmModel = m.trim();
  saveSettings();
  if (addCredits) await store.adjust(req.uid, Math.round(+addCredits), 'Top-up', null, true);
  res.json({ ok: true });
}));

// ---------- payments ----------
app.post('/api/checkout', limit('checkout', 15, 10), wrap(async (req, res) => {
  if (!stripe) throw fail('Payments are not set up yet', 501);
  const base = config.publicUrl || `${req.protocol}://${req.get('host')}`;
  const plan = PLANS.find((p) => p.id === req.body.plan);
  if (plan) {
    const profile = await store.getProfile(req.uid);
    const meta = { user_id: req.uid, credits: String(plan.credits), plan: plan.id };
    const s = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ quantity: 1, price_data: { currency: config.currency, unit_amount: Math.round(plan.price * 100), recurring: { interval: 'month' }, product_data: { name: `Kravitas ${plan.name} · ${plan.credits.toLocaleString()} credits / month` } } }],
      ...(profile?.stripe_customer ? { customer: profile.stripe_customer } : {}),
      client_reference_id: req.uid, metadata: meta, subscription_data: { metadata: meta },
      success_url: `${base}/studio?paid={CHECKOUT_SESSION_ID}`, cancel_url: `${base}/studio?cancelled=1`,
    });
    return res.json({ url: s.url });
  }
  const pack = PACKS.find((p) => p.id === req.body.pack);
  if (!pack) throw fail('Unknown pack');
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      quantity: 1,
      price_data: {
        currency: config.currency,
        unit_amount: Math.round(pack.price * 100),
        product_data: { name: `Kravitas · ${pack.credits.toLocaleString()} credits`, description: `${pack.name} pack` },
      },
    }],
    client_reference_id: req.uid,
    metadata: { user_id: req.uid, credits: String(pack.credits), pack: pack.id },
    success_url: `${base}/studio?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/studio?cancelled=1`,
  });
  res.json({ url: session.url });
}));

// Called when Stripe redirects back, so credits appear even before (or without) the webhook.
app.post('/api/checkout/verify', wrap(async (req, res) => {
  if (!stripe) throw fail('Payments are not set up', 501);
  const s = await stripe.checkout.sessions.retrieve(String(req.body.sessionId || ''));
  if ((s.metadata?.user_id || s.client_reference_id) !== req.uid) throw fail('This payment belongs to another account', 403);
  const added = await grant(s);
  res.json({ paid: s.payment_status === 'paid', added, credits: s.metadata?.credits });
}));

// Stripe customer portal: change or cancel the monthly plan.
app.post('/api/billing/portal', wrap(async (req, res) => {
  if (!stripe) throw fail('Payments are not set up', 501);
  const profile = await store.getProfile(req.uid);
  if (!profile?.stripe_customer) throw fail('No subscription on this account yet');
  const base = config.publicUrl || `${req.protocol}://${req.get('host')}`;
  const s = await stripe.billingPortal.sessions.create({ customer: profile.stripe_customer, return_url: `${base}/studio` });
  res.json({ url: s.url });
}));

// ---------- uploads ----------
app.post('/api/upload', limit('upload', 40, 60), wrap(async (req, res) => res.json({ url: await saveDataUrl(req.body.dataUrl) })));

// ---------- friends ----------
app.get('/api/friends', wrap(async (req, res) => res.json(await store.list('friends', req.uid))));
app.post('/api/friends', limit('create', 30, 60), wrap(async (req, res) => {
  const { name, photos, note, consent } = req.body;
  if (consent !== true) throw fail('Please confirm you have permission to use these photos');
  if (!name?.trim()) throw fail('Give your friend a name');
  if (!photos?.length) throw fail('Add at least one photo, it is the face reference');
  const urls = [];
  for (const p of photos.slice(0, 3)) urls.push(store.isOwnUrl(p) ? p : await saveDataUrl(p));
  res.json(await store.insert('friends', req.uid, { id: newId(), name: name.trim().slice(0, 40), note: String(note || '').slice(0, 200), photos: urls }));
}));
app.delete('/api/friends/:id', wrap(async (req, res) => {
  const f = await store.get('friends', req.uid, req.params.id);
  if (f) { await store.remove('friends', req.uid, f.id); }
  res.json({ ok: true });
}));

// ---------- products ----------
app.get('/api/products', wrap(async (req, res) => res.json(await store.list('products', req.uid))));
app.post('/api/products', limit('create', 30, 60), wrap(async (req, res) => {
  const { name, image, price, link, benefits, cutout } = req.body;
  if (!name?.trim()) throw fail('Product name is required');
  if (!image) throw fail('Add a product photo');
  let img = await saveDataUrl(image);
  if (cutout) {
    await store.adjust(req.uid, -PRICE.removeBg, 'Remove background', null);
    img = await removeBg({ charge() {} }, img).catch(async (e) => {
      await store.adjust(req.uid, PRICE.removeBg, 'Refund (remove background failed)', null, true);
      throw e;
    });
  }
  const safeLink = /^https?:\/\//i.test(link || '') ? link : '';
  res.json(await store.insert('products', req.uid, {
    id: newId(), name: name.trim().slice(0, 80), image: img, price: String(price || '').slice(0, 30), link: safeLink, benefits: String(benefits || '').slice(0, 600),
  }));
}));
app.delete('/api/products/:id', wrap(async (req, res) => {
  await store.remove('products', req.uid, req.params.id);
  res.json({ ok: true });
}));

// ---------- brainstorm ----------
app.post('/api/brainstorm', limit('brainstorm', 30, 60), wrap(async (req, res) => {
  const { mode, prompt, friendId, productId, image, lang, chat, previous } = req.body;
  const refs = (Array.isArray(req.body.refs) ? req.body.refs : []).slice(0, 8).map((r) => (r?.kind === 'image' ? (store.isOwnUrl(r.url) ? { kind: 'image', url: r.url, name: str(r.name, 80) } : null) : r?.kind === 'doc' ? { kind: 'doc', name: str(r.name, 80), text: str(r.text, 30000) } : null)).filter(Boolean);
  const brand = String((await store.getProfile(req.uid))?.prefs?.brand || '');
  const followUp = Array.isArray(chat) && chat.length > 0;
  const cost = followUp ? FOLLOWUP_COST : BRAINSTORM_COST;
  const [friend, product] = await Promise.all([
    friendId ? store.get('friends', req.uid, friendId) : null,
    productId ? store.get('products', req.uid, productId) : null,
  ]);
  const img = image && store.isOwnUrl(image) ? image : null;
  if (!friend && !product && !img && !refs.length && !String(prompt || '').trim()) throw fail('Add a photo, a product, a reference or some notes first so there is something to think about');
  await store.adjust(req.uid, -cost, followUp ? 'Brainstorm follow-up' : 'Brainstorm', null);
  try {
    const w = WRITERS[req.body.writer];
    if (w && !allowed(await planOf(req.uid), w.plan)) throw planFail(w.name, w.plan);
    res.json(await brainstorm({ mode, prompt: String(prompt || '').slice(0, 4000), friend, product, image: img, lang, chat, previous, brand, refs, effort: ['quick', 'balanced', 'deep'].includes(req.body.effort) ? req.body.effort : 'balanced', model: w && w.id !== WRITERS.flash.id ? w.id : null }));
  } catch (e) {
    await store.adjust(req.uid, cost, 'Refund (brainstorm failed)', null, true);
    throw e;
  }
}));

// ---------- reference files for Ideas (image / PDF / DOCX / text) ----------
app.post('/api/refs', limit('create', 40, 60), wrap(async (req, res) => {
  const { file, name } = req.body || {};
  if (typeof file !== 'string' || file.length > 14 * 1024 * 1024) throw fail('That file is too large (max 10 MB)');
  res.json(await readReference(file, str(name, 120)));
}));

// ---------- ideas library + brand notes ----------
app.get('/api/ideas', wrap(async (req, res) => res.json(await store.list('ideas', req.uid))));
app.post('/api/ideas', limit('create', 60, 60), wrap(async (req, res) => {
  const b = req.body || {};
  const mode = ['ad', 'video', 'image'].includes(b.mode) ? b.mode : 'ad';
  const title = str(b.title, 80).trim(), prompt = str(b.prompt, 2000).trim();
  if (!title && !prompt) throw fail('An idea needs a title or a prompt');
  const settings = b.settings && typeof b.settings === 'object' ? Object.fromEntries(Object.entries(b.settings).slice(0, 12).map(([k, v]) => [str(k, 30), str(v, 60)])) : {};
  const row = await store.insert('ideas', req.uid, {
    id: newId(), mode, title: title || prompt.slice(0, 60), prompt, why: str(b.why, 300), hook: str(b.hook, 300), settings,
    productId: b.productId ? str(b.productId, 60) : null, friendId: b.friendId ? str(b.friendId, 60) : null, lang: str(b.lang || 'ms', 10), source: str(b.source, 400),
  });
  res.json(row);
}));
app.delete('/api/ideas/:id', wrap(async (req, res) => { await store.remove('ideas', req.uid, req.params.id); res.json({ ok: true }); }));
app.put('/api/brand', limit('create', 30, 60), wrap(async (req, res) => {
  const brand = str(req.body?.brand, 1500);
  const p = await store.getProfile(req.uid);
  await store.setProfile(req.uid, { prefs: { ...(p?.prefs || {}), brand } });
  res.json({ brand });
}));

// ---------- voices (clone your own) ----------
app.get('/api/voices', wrap(async (req, res) => res.json(await store.list('voices', req.uid))));
app.post('/api/voices', limit('voice-clone', 10, 60), wrap(async (req, res) => {
  const { name, audio, consent } = req.body;
  if (consent !== true) throw fail('Please confirm this is your voice or you have permission to clone it');
  if (!name?.trim()) throw fail('Name the voice');
  await needPlan(req.uid, 'creator', 'Voice cloning');
  const sample = await saveAudioDataUrl(audio);
  await store.adjust(req.uid, -PRICE.voiceClone, 'Voice clone', null);
  try {
    let voiceId, preview = null;
    if (isMock()) voiceId = 'demo-' + newId();
    else {
      const r = await falRun(MODELS.voiceClone, { audio_url: await toRemote(sample), noise_reduction: true, need_volume_normalization: true, text: 'Hai semua! Ini suara saya di Kravitas. Jom buat video pertama kita.' });
      voiceId = r.custom_voice_id;
      if (!voiceId) throw new Error('Voice cloning returned no voice. Try a clearer 10–60 second sample.');
      preview = r.audio?.url || null;
    }
    res.json(await store.insert('voices', req.uid, { id: newId(), name: name.trim().slice(0, 40), voice_id: voiceId, sample_url: sample, preview_url: preview }));
  } catch (e) {
    await store.adjust(req.uid, PRICE.voiceClone, 'Refund (voice clone failed)', null, true);
    throw e;
  }
}));
app.delete('/api/voices/:id', wrap(async (req, res) => { await store.remove('voices', req.uid, req.params.id); res.json({ ok: true }); }));

// ---------- storyboard planning ----------
app.post('/api/storyboard/plan', limit('plan', 40, 60), wrap(async (req, res) => {
  const { prompt, scenes, lang, tone } = req.body;
  if (!String(prompt || '').trim()) throw fail('Describe the video first');
  await store.adjust(req.uid, -PRICE.llm, 'Storyboard plan', null);
  try {
    res.json(await planStory({ charge() {} }, { prompt: String(prompt).slice(0, 1000), scenes, lang, tone }));
  } catch (e) {
    await store.adjust(req.uid, PRICE.llm, 'Refund (storyboard failed)', null, true);
    throw e;
  }
}));

// ---------- idea → storyboard panels (sketch first, real keyframes on request) ----------
const ASPECTS = ['9:16', '16:9', '1:1', '4:5'];
app.post('/api/panels/plan', limit('plan', 30, 60), wrap(async (req, res) => {
  const b = req.body || {};
  const prompt = str(b.prompt, 2000).trim();
  if (!prompt) throw fail('Pick an idea first');
  const L = await lookups(req.uid);
  const n = Math.min(6, Math.max(3, +b.panels || 4));
  const aspect = ASPECTS.includes(b.aspect) ? b.aspect : '9:16';
  const cost = PRICE.llm + n * imageCost('lite', false);
  await store.adjust(req.uid, -cost, 'Storyboard (plan + sketches)', null);
  let spent = 0;
  const ctx = { charge(c) { spent += c; } };
  try {
    const plan = await planPanels(ctx, { prompt, lang: b.lang, panels: n, product: L.product(b.productId), friend: L.friend(b.friendId), brand: L.brand, notes: str(b.notes, 3000) });
    plan.panels = await Promise.all(plan.panels.map(async (x) => ({ ...x, image: await drawPanel(ctx, { kind: 'sketch', visual: x.visual, look: plan.look, aspect }), kind: 'sketch' })));
    res.json({ ...plan, aspect, cost });
  } catch (e) {
    await store.adjust(req.uid, cost, 'Refund (storyboard failed)', null, true);
    throw e;
  }
}));
app.post('/api/panels/draw', limit('draw', 120, 60), wrap(async (req, res) => {
  const b = req.body || {};
  const kind = b.kind === 'keyframe' ? 'keyframe' : 'sketch';
  const visual = str(b.visual, 600).trim();
  if (!visual) throw fail('Describe what happens in this panel first');
  const L = await lookups(req.uid);
  const aspect = ASPECTS.includes(b.aspect) ? b.aspect : '9:16';
  const quality = kind === 'keyframe' && allowed(await planOf(req.uid), 'creator') ? 'full' : 'lite';
  const f = L.friend(b.friendId), p = L.product(b.productId);
  const cost = kind === 'sketch' ? imageCost('lite', false) : imageCost(quality, !!(f || p));
  await store.adjust(req.uid, -cost, kind === 'sketch' ? 'Storyboard sketch' : 'Storyboard keyframe', null);
  try {
    const image = await drawPanel({ charge() {} }, { kind, visual, look: str(b.look, 800), style: str(b.style, 20), aspect, friend: f, product: p, quality });
    res.json({ image, kind, cost });
  } catch (e) {
    await store.adjust(req.uid, cost, 'Refund (panel failed)', null, true);
    throw e;
  }
}));

// ---------- auto-posting ----------
const needSocial = () => { if (!social.socialEnabled()) throw fail('Auto-posting is not switched on yet (add POSTFORME_API_KEY).', 501); };
app.get('/api/social/accounts', wrap(async (req, res) => { needSocial(); res.json(await social.listAccounts(req.uid)); }));
app.post('/api/social/connect', wrap(async (req, res) => { needSocial(); await needPlan(req.uid, 'creator', 'Auto-posting'); res.json({ url: await social.connectUrl(req.uid, req.body.platform) }); }));
app.delete('/api/social/accounts/:id', wrap(async (req, res) => { needSocial(); await social.disconnect(req.uid, req.params.id); res.json({ ok: true }); }));
app.get('/api/social/posts', wrap(async (req, res) => {
  const posts = await store.list('posts', req.uid);
  if (social.socialEnabled()) {
    await Promise.all(posts.filter((p) => p.remoteId && !['processed', 'failed'].includes(p.status)).map(async (p) => {
      try { Object.assign(p, await social.postStatus(p.remoteId)); await store.update('posts', req.uid, p.id, { status: p.status, results: p.results }); } catch { /* keep last known */ }
    }));
  }
  res.json(posts.sort((a, b) => (b.scheduledAt || b.createdAt) - (a.scheduledAt || a.createdAt)));
}));
app.post('/api/social/posts', limit('posts', 60, 60), wrap(async (req, res) => {
  needSocial();
  const { jobId, mediaUrl, caption, accountIds, scheduledAt, aiLabel, title } = req.body;
  const job = await store.getJob(req.uid, jobId);
  if (!job || !job.outputs.some((o) => o.url === mediaUrl)) throw fail('Pick one of your creations to post');
  if (!/^https?:\/\//.test(mediaUrl)) throw fail('Posting needs the hosted version of Kravitas (your PC copy has no public link for the video).');
  if (scheduledAt && new Date(scheduledAt).getTime() < Date.now() - 60_000) throw fail('Pick a time in the future');
  const r = await social.createPost(req.uid, { caption: String(caption || '').slice(0, 2200), accountIds: accountIds || [], mediaUrl, scheduledAt, aiLabel, title });
  res.json(await store.insert('posts', req.uid, { id: newId(), remoteId: r.id, status: r.status, platforms: r.platforms, jobId, mediaUrl, caption, scheduledAt: scheduledAt ? new Date(scheduledAt).getTime() : null, aiLabel: !!aiLabel, createdAt: Date.now() }));
}));

// ---------- jobs ----------
async function lookups(uid) {
  const [friends, products, voices, profile] = await Promise.all([store.list('friends', uid), store.list('products', uid), store.list('voices', uid), store.getProfile(uid)]);
  return { friends, products, voices, brand: String(profile?.prefs?.brand || ''), friend: (id) => friends.find((f) => f.id === id), product: (id) => products.find((p) => p.id === id) };
}
const str = (v, n) => String(v ?? '').slice(0, n);
function cleanInput(input) {
  const i = { ...input };
  for (const k of ['startImage', 'endImage', 'image']) if (i[k] && !store.isOwnUrl(i[k])) delete i[k];
  delete i.refs;
  if (i.look != null) i.look = str(i.look, 800);
  for (const k of ['prompt', 'script', 'notes', 'topic', 'tone', 'text']) if (typeof i[k] === 'string') i[k] = i[k].slice(0, k === 'text' ? 5000 : 2000);
  if (i.quality != null) i.quality = i.quality === 'lite' ? 'lite' : 'full';
  if (i.variants != null) i.variants = [1, 3, 5].includes(+i.variants) ? +i.variants : 1;
  if (i.scripts != null) i.scripts = (Array.isArray(i.scripts) ? i.scripts : []).slice(0, 5).map((x) => str(x, 1200));
  for (const k of ['fromDraft', 'reuseFrom', 'tier']) if (i[k] != null) i[k] = str(i[k], 40);
  i.draft = i.draft === true && !i.fromDraft;
  if (i.board) {
    const b = i.board;
    i.board = {
      title: str(b.title, 120), caption: str(b.caption, 600), hashtags: (Array.isArray(b.hashtags) ? b.hashtags : []).slice(0, 15).map((h) => str(h, 40)),
      scenes: (Array.isArray(b.scenes) ? b.scenes : []).slice(0, 8).map((s) => ({ narration: str(s.narration, 400), visual: str(s.visual, 600), motion: str(s.motion, 200), ...(s.frame && store.isOwnUrl(s.frame) ? { frame: str(s.frame, 600) } : {}) })).filter((s) => s.narration.trim()),
    };
    if (!i.board.scenes.length) delete i.board;
  }
  if (i.clips != null) i.clips = (Array.isArray(i.clips) ? i.clips : []).slice(0, 6).map((c) => ({ url: str(c?.url, 600), type: c?.type === 'image' ? 'image' : 'video' })).filter((c) => store.isOwnUrl(c.url));
  for (const k of ['voiceUrl', 'musicUrl']) if (i[k] != null && !(typeof i[k] === 'string' && store.isOwnUrl(i[k]))) delete i[k];
  if (i.voiceText != null) i.voiceText = str(i.voiceText, 5000);
  if (i.musicPrompt != null) i.musicPrompt = str(i.musicPrompt, 300);
  if (i.newVoice) i.newVoice = { text: str(i.newVoice.text, 3000), voice: str(i.newVoice.voice, 80), lang: str(i.newVoice.lang, 10) };
  if (i.newVoice && !i.newVoice.text.trim()) delete i.newVoice;
  if (i.look && typeof i.look === 'object') i.look = Object.fromEntries(Object.entries(i.look).slice(0, 10).map(([k, v]) => [str(k, 20), str(v, 80)]));
  return i;
}

app.post('/api/estimate', wrap(async (req, res) => {
  const t = TOOLS[req.body.tool];
  if (!t) throw fail('Unknown tool');
  const ein = cleanInput(req.body.input || {});
  if (req.body.tool === 'image' && !ein.quality) ein.quality = allowed(await planOf(req.uid), 'creator') ? 'full' : 'lite';
  res.json({ credits: Math.ceil(t.estimate(ein)) });
}));

app.post('/api/jobs', limit('jobs', 60, 60), wrap(async (req, res) => {
  const t = TOOLS[req.body.tool];
  if (!t) throw fail('Unknown tool');
  const recent = await store.listJobs(req.uid, 20);
  const running = (await Promise.all(recent.map(expireStale))).filter((j) => j.status === 'running').length;
  if (running >= config.maxRunningJobs) throw fail(`You already have ${running} generations running. Wait for one to finish.`, 429);
  const input = cleanInput(req.body.input || {});
  if (req.body.tool === 'edit' && !input.clips?.length) throw fail('Add at least one of your images or videos to edit.');
  const L = await lookups(req.uid);
  const plan0 = await planOf(req.uid);
  if (req.body.tool === 'image' && !input.quality) input.quality = allowed(plan0, 'creator') ? 'full' : 'lite';
  checkPlan(plan0, req.body.tool, input);
  if (input.reuseFrom) L.prev = await store.getJob(req.uid, String(input.reuseFrom)); // reuse unchanged scenes (own jobs only)
  if (input.fromDraft) { L.prev = await store.getJob(req.uid, String(input.fromDraft)); if (!L.prev) throw fail('That draft was not found'); }
  if (input.friendId && !L.friend(input.friendId)) input.friendId = null;
  if (input.productId && !L.product(input.productId)) input.productId = null;
  const job = await createJob({
    uid: req.uid, tool: req.body.tool, title: t.title(input, L), input,
    estimate: Math.ceil(t.estimate(input)), lookups: L, run: (ctx) => t.run(ctx, input),
  });
  res.json(job);
}));

app.get('/api/jobs', wrap(async (req, res) => {
  const jobs = await store.listJobs(req.uid, Math.min(200, +req.query.limit || 100));
  res.json(await Promise.all(jobs.map((j) => live.get(j.id) || expireStale(j))));
}));
app.get('/api/jobs/:id', wrap(async (req, res) => {
  const l = live.get(req.params.id);
  if (l && l.user_id === req.uid) return res.json(l);
  const j = await store.getJob(req.uid, req.params.id);
  if (!j) throw fail('Not found', 404);
  res.json(await expireStale(j));
}));
app.delete('/api/jobs/:id', wrap(async (req, res) => {
  const j = await store.getJob(req.uid, req.params.id);
  if (j && j.status !== 'running') {
    const L = await lookups(req.uid);
    const inUse = new Set([...L.friends.flatMap((f) => f.photos), ...L.products.map((p) => p.image)]);
    await store.deleteFiles(j.outputs.map((o) => o.url).filter((u) => u && !inUse.has(u)));
    await store.deleteJob(req.uid, j.id);
  }
  res.json({ ok: true });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.get(['/studio', '/studio/'], (req, res) => res.sendFile(path.join(ROOT, 'public', 'studio.html')));
app.get('*', (req, res) => res.sendFile(path.join(ROOT, 'public', 'index.html'))); // landing page

export default app;
