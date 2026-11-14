// Model picker: one Claude-style menu for every chatbox.
// Models on top, "More models" below, an effort-style control, and anything the plan does not include is
// greyed out with a lock and the plan name (not clickable).
(function () {
  const LOCK = '<svg class="lk" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const ok = (need) => !need || need === 'free' || canUse(need);
  const planName = (n) => PLAN_LABEL[n] || n;
  const TOP = 3;

  function cfgFor(mode) {
    const c = S.app.catalog, f = F();
    if (mode === 'ideas') {
      const W = c.writers || {};
      return {
        title: 'Model', cur: IDEAS.writer || 'flash',
        models: Object.entries(W).map(([id, w]) => ({ id, name: w.name, sub: w.note, plan: w.plan, more: !!w.more })),
        pick: (id) => { IDEAS.writer = id; const v = document.querySelector('#id-model .v'); if (v) v.textContent = llmName() + ' ▾'; },
        effort: { title: 'Effort', note: 'How hard the AI thinks about your ideas.', cur: IDEAS.effort || 'balanced', opts: [['quick', 'Quick', 'Short and fast'], ['balanced', 'Balanced', 'Good for most'], ['deep', 'Deep', 'Thinks longer']], set: (v) => { IDEAS.effort = v; } },
      };
    }
    if (mode === 'video') {
      const sub = (m) => [m.tag, m.perSec ? `✦ ${m.perSec}/sec` : ''].filter(Boolean).join(' · ');
      return {
        title: 'Video model', cur: f.model,
        models: Object.entries(c.videoModels).map(([id, m]) => ({ id, name: m.label, sub: sub(m), plan: c.modelPlan?.[id], more: id === 'kling-pro' })),
        pick: (id) => { f.model = id; if (f.endImage && !c.videoModels[id]?.endFrame) f.endImage = null; },
        effort: { title: 'Length', note: 'Longer shots cost more.', cur: String(f.duration), opts: [['5', '5s', ''], ['8', '8s', ''], ['10', '10s', '']], set: (v) => { f.duration = +v; } },
      };
    }
    if (mode === 'image') {
      return {
        title: 'Image model', cur: f.quality || 'full',
        models: [
          { id: 'lite', name: 'Seedream 4', sub: 'Good quality · cheaper', plan: null },
          { id: 'full', name: 'Nano Banana 2', sub: 'Sharpest, keeps faces and products', plan: 'creator' },
        ],
        pick: (id) => { f.quality = id; },
        effort: { title: 'Images per go', note: 'More images cost more tokens.', cur: String(f.count || 1), opts: [['1', '1', ''], ['2', '2', ''], ['4', '4', '']], set: (v) => { f.count = +v; } },
      };
    }
    if (mode === 'ad' || mode === 'talk' || mode === 'story') {
      const cfg = {
        title: 'Quality', cur: f.tier,
        models: Object.entries(c.tiers || {}).map(([id, t]) => ({ id, name: TIER_NAME[id] || t.label, sub: TIER_DESC[id] || t.tag, plan: t.plan })),
        pick: (id) => { f.tier = id; },
      };
      if (mode === 'ad') cfg.effort = { title: 'Variations', note: 'One keyframe, several scripts to test.', cur: String(f.variants || 1), opts: [['1', '1 ad', ''], ['3', '3', ''], ['5', '5', '']].map(([v, l, s]) => [v, l, s, needFor('variants', +v)]), set: (v) => { f.variants = +v; } };
      return cfg;
    }
    if (mode === 'voice') {
      return {
        title: 'Voice model', cur: String(f.voice).startsWith('mm:') ? 'mm' : f.voiceEngine === 'multilingual' ? 'multi' : 'v3',
        models: [
          { id: 'mm', name: 'MiniMax Speech', sub: 'Natural Bahasa Melayu', plan: null },
          { id: 'v3', name: 'ElevenLabs v3', sub: 'Expressive English', plan: null },
          { id: 'multi', name: 'ElevenLabs Multilingual', sub: 'Many languages, steady', plan: null },
        ],
        pick: (id) => {
          const first = (k) => Object.keys(pillOptions('voice')).find((x) => x.startsWith(k));
          if (id === 'mm') f.voice = first('mm:') || f.voice;
          else { f.voice = first('el:') || f.voice; f.voiceEngine = id === 'multi' ? 'multilingual' : 'v3'; }
        },
      };
    }
    return null;
  }

  let open = null;
  function render(anchor, mode, showMore) {
    const cfg = cfgFor(mode); if (!cfg) return;
    const top = cfg.models.filter((m) => !m.more), more = cfg.models.filter((m) => m.more);
    const lockedAny = cfg.models.some((m) => !ok(m.plan)) || (cfg.effort?.opts || []).some((o) => o[3] && !ok(o[3]));
    const row = (m) => {
      const lock = !ok(m.plan), on = m.id === cfg.cur;
      return lock
        ? `<div class="it mp-row locked" aria-disabled="true" title="Included in the ${planName(m.plan)} plan"><span><b>${esc(m.name)}</b>${m.sub ? `<small>${esc(m.sub)}</small>` : ''}</span><em class="lockbadge">${LOCK}${planName(m.plan)}</em></div>`
        : `<button class="it mp-row ${on ? 'on' : ''}" data-v="m:${esc(m.id)}"><span><b>${esc(m.name)}</b>${m.sub ? `<small>${esc(m.sub)}</small>` : ''}</span></button>`;
    };
    const eff = cfg.effort ? `<hr><div class="h">${esc(cfg.effort.title)}</div><div class="mp-seg" role="radiogroup">${cfg.effort.opts.map(([v, l, s, need]) => {
      const lock = need && !ok(need), on = v === cfg.effort.cur;
      return lock ? `<span class="mp-opt locked" aria-disabled="true" title="Included in the ${planName(need)} plan">${LOCK}${esc(l)} <em>${planName(need)}</em></span>` : `<button class="mp-opt ${on ? 'on' : ''}" data-v="e:${esc(v)}" title="${esc(s || '')}">${esc(l)}${s ? `<small>${esc(s)}</small>` : ''}</button>`;
    }).join('')}</div>${cfg.effort.note ? `<p class="mp-note">${esc(cfg.effort.note)}</p>` : ''}` : '';
    const moreHtml = more.length
      ? (showMore ? `<hr><div class="h">More models</div>${more.map(row).join('')}` : `<button class="it mp-more" data-v="mp:more"><span><b>More models</b><small>${more.length} more</small></span><i class="ck">›</i></button>`)
      : `<div class="it mp-row locked" aria-disabled="true"><span><b>More models</b><small>New ones are added here as they launch</small></span><em class="lockbadge">Soon</em></div>`;
    const foot = lockedAny ? `<hr><button class="it mp-plans" data-v="mp:plans">Unlock more models with a plan →</button>` : '';
    openPop(anchor, `<div class="mp"><div class="h">${esc(cfg.title)}</div>${top.map(row).join('')}${moreHtml}${eff}${foot}</div>`, (v) => {
      if (v === 'mp:more') return render(anchor, mode, true);
      if (v === 'mp:plans') { closePop(); return accountModal(); }
      if (v.startsWith('m:')) { cfg.pick(v.slice(2)); closePop(); if (mode !== 'ideas') { renderComposer(); renderPresets(); } return; }
      if (v.startsWith('e:')) { cfg.effort.set(v.slice(2)); if (mode !== 'ideas') { renderComposer(); renderPresets(); } return render($('#composer [data-pill="' + (anchor.dataset.pill || '') + '"], #composer .mchip') || anchor, mode, showMore); }
    });
    open = { anchor, mode };
  }
  window.openModelPicker = (anchor, mode) => render(anchor, mode, false);
  window.hasModelPicker = (mode) => !!cfgFor(mode);
})();
