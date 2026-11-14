// Templates: ready-to-run starting points. Pick one, it sets up the right tool, look and wording,
// then you add your product and press Make. Nothing is spent until you do.
(function () {
  const T = [
    { id: 'flash', cat: 'Ads', e: '⚡', h: 8, title: 'Flash sale ad', sub: '11.11 style urgency, 8s', mode: 'ad', set: { angle: 'deal', format: 'showcase', seconds: 8, lang: 'ms', prompt: 'Diskaun 50% hari ni sahaja, stok terhad, percuma pos' },
      gets: ['A hook in the first 2 seconds', 'Voice-over in Bahasa Melayu', 'Captions burned in', 'Caption and hashtags'] },
    { id: 'review', cat: 'Ads', e: '🛒', h: 28, title: 'Honest review', sub: 'Creator talks to camera', mode: 'ad', set: { angle: 'review', format: 'talking', seconds: 8, lang: 'ms', prompt: 'Dah cuba 2 minggu, ini apa yang saya betul-betul rasa' },
      gets: ['Casual, believable script', 'Friend or presenter speaks it', 'Works with your product photo', 'TikTok-ready 9:16'] },
    { id: 'unbox', cat: 'Ads', e: '📦', h: 48, title: 'Unboxing', sub: 'First impressions', mode: 'ad', set: { angle: 'unboxing', format: 'showcase', seconds: 8, lang: 'ms', prompt: 'Baru sampai! Jom buka sama-sama' },
      gets: ['Opening-the-box story', 'Close-ups of the product', 'Excited voice-over', 'Captions'] },
    { id: 'ba', cat: 'Ads', e: '🪄', h: 160, title: 'Before and after', sub: 'The transformation', mode: 'ad', set: { angle: 'beforeafter', format: 'showcase', seconds: 8, lang: 'ms', prompt: 'Sebelum dan selepas guna selama 14 hari' },
      gets: ['Clear before and after beats', 'Proof-style voice-over', 'Captions', 'Caption and hashtags'] },
    { id: 'pack', cat: 'Photos', e: '✨', h: 210, title: 'Clean packshot', sub: 'Shopee and TikTok Shop listing', mode: 'image', set: { style: 'studio', aspect: '1:1', count: 1, prompt: 'the product on a seamless pastel background, soft shadows, premium e-commerce packshot' },
      gets: ['Square 1:1 for listings', 'Soft studio light', 'Your product stays accurate (add a product photo)', 'Cheap model by default'] },
    { id: 'life', cat: 'Photos', e: '🛋️', h: 30, title: 'Lifestyle scene', sub: 'Product in a real home', mode: 'image', set: { style: 'photo', aspect: '4:5', count: 1, prompt: 'the product in a bright cosy Malaysian home, natural morning light' },
      gets: ['4:5 for Instagram and Facebook', 'Natural light', 'Feels like a real home', 'Add a friend to hold it'] },
    { id: 'raya', cat: 'Photos', e: '🌙', h: 330, title: 'Festive promo', sub: 'Raya, CNY, Deepavali mood', mode: 'image', set: { style: 'cinematic', aspect: '4:5', count: 1, prompt: 'the product in a festive sale setting with ketupat and warm pelita lights' },
      gets: ['Warm festive lighting', 'Space left for your text', '4:5 portrait', 'Swap the setting in the prompt'] },
    { id: 'orbit', cat: 'Video', e: '🌀', h: 260, title: 'Product orbit shot', sub: 'Smooth camera around it', mode: 'video', set: { camera: 'orbit', model: 'h3-turbo', duration: 5, aspect: '9:16', style: 'cinematic', prompt: 'slow orbit around the product on a marble table, soft window light' },
      gets: ['5s vertical clip', 'Cheapest video model', 'Needs your product photo as the start frame', 'Change the camera any time'] },
    { id: 'story', cat: 'Ideas', e: '🎞', h: 190, title: 'Hook to CTA storyboard', sub: 'Plan before you spend', mode: 'ideas', dump: 'Serum vit C RM29, kulit kusam dan berminyak, nak video TikTok 15 saat dengan hook kuat dan ajak beli di hujung',
      gets: ['5 ideas to choose from', 'A storyboard for the one you like', 'Cost shown before the video', 'Edit any panel first'] },
    { id: 'bm', cat: 'Voice', e: '🇲🇾', h: 120, title: 'BM sales voice-over', sub: 'Natural Bahasa Melayu', mode: 'voice', set: { kind: 'tts', voice: 'mm:Lively_Girl', emotion: 'happy', lang: 'ms', prompt: 'Assalamualaikum semua! Hari ni saya nak kongsi satu produk yang betul-betul berbaloi. Jom tengok sama-sama.' },
      gets: ['MiniMax speech made for Malay', 'Happy, friendly tone', 'Edit the words freely', 'Download or use in an ad'] },
  ];
  const CATS = ['All', 'Ads', 'Photos', 'Video', 'Ideas', 'Voice'];
  let cat = 'All';

  function use(t) {
    if (t.mode === 'ideas') {
      IDEAS.dump = t.dump; IDEAS.result = null; IDEAS.chat = [];
      setMode('ideas'); renderAll(); toast('Template ready. Add your product, then press send');
      return;
    }
    S.forms[t.mode] = { ...DEFAULTS[t.mode](), ...t.set };
    setMode(t.mode); renderAll();
    toast(`${t.title} template ready. Add your product, then press Make`);
  }

  window.renderTemplates = function (box) {
    const list = T.filter((t) => cat === 'All' || t.cat === cat);
    box.innerHTML = `<div class="fl-head"><h1>Templates</h1><p>Start from something that already works. Pick one, add your product, press Make. Nothing is spent until you do.</p></div>
      <div class="lib-chips">${CATS.map((c) => `<button class="chip ${c === cat ? 'on' : ''}" data-tc="${c}">${c}</button>`).join('')}</div>
      <div class="tpl-grid">${list.map((t) => `<article class="tpl" style="--h:${t.h}">
        <div class="tpl-cover"><span class="tpl-e">${t.e}</span><small>${esc(t.cat)}</small></div>
        <div class="tpl-b"><b>${esc(t.title)}</b><p>${esc(t.sub)}</p>
          <ul>${t.gets.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
          <button class="btn pri" data-tu="${t.id}">Use this template</button></div></article>`).join('')}</div>`;
    box.querySelectorAll('[data-tc]').forEach((b) => (b.onclick = () => { cat = b.dataset.tc; window.renderTemplates(box); }));
    box.querySelectorAll('[data-tu]').forEach((b) => (b.onclick = () => use(T.find((x) => x.id === b.dataset.tu))));
  };
})();
