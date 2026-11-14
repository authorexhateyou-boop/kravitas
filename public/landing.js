// Plans come from the server (so prices stay in one place); this list is the fallback.
(function () {
  var FALLBACK = [
    { id: 'basic', name: 'Basic', credits: 600, price: 39, features: ['Motion ads (animated photo + voice)', 'Up to 3 variations per ad', 'All voices + brainstorm'] },
    { id: 'starter', name: 'Starter', credits: 1000, price: 59, features: ['Everything in Basic', 'Lite & Fast AI video', 'Camera video shots'] },
    { id: 'creator', name: 'Creator', credits: 2500, price: 129, tag: 'Popular', features: ['Everything in Starter', 'Studio lip-sync + Kling', '5 variations per ad', 'Voice cloning & auto-post'] },
    { id: 'pro', name: 'Pro', credits: 6500, price: 299, tag: 'Best value', features: ['Everything in Creator', 'Premium lip-sync (OmniHuman)', 'Kling Pro video'] }
  ];
  // Launch offer: shown prices are the discounted ones; the struck-through list price = price / (1 - off). Set off:0 to hide it.
  var PROMO = { off: 40 };
  var listPrice = function (p) { return Math.round(p / (1 - PROMO.off / 100)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function draw(plans) {
    var el = document.getElementById('plans');
    el.innerHTML = plans.map(function (p) {
      var pop = p.tag === 'Popular';
      return '<div class="plan' + (pop ? ' pop' : '') + '">' + (p.tag ? '<span class="badge">' + esc(p.tag) + '</span>' : '') +
        '<h3>' + esc(p.name) + '</h3><div class="price">' + (PROMO.off ? '<s>RM' + listPrice(p.price) + '</s>' : '') + 'RM' + p.price + '<small>/month</small></div>' + (PROMO.off ? '<span class="save">Save ' + PROMO.off + '%</span>' : '') +
        '<div class="cred">' + Number(p.credits).toLocaleString('en-MY') + ' tokens</div>' +
        '<div class="est">≈ ' + Math.floor(p.credits / 9) + ' Motion ads or ' + Math.floor(p.credits / 32) + ' Lite ads</div>' +
        '<ul>' + (p.features || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
        '<a class="btn" href="' + studio + '" data-studio>Choose ' + esc(p.name) + '</a></div>';
    }).join('');
  }
  function models() {
    var t = document.getElementById('models-table'); if (!t || !window.ModelData) return;
    var order = ['basic', 'starter', 'creator', 'pro'], rows = ModelData.rows(), g = '', h = '<thead><tr><th>Model</th>' + order.map(function (k) { return '<th>' + ModelData.LABEL[k] + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) {
      if (r.g !== g) { g = r.g; h += '<tr class="g"><th colspan="5">' + esc(g) + '</th></tr>'; }
      var min = Math.max(1, ModelData.RANK[r.p]);
      h += '<tr><td>' + esc(r.n) + '<small>' + esc(r.d) + '</small></td>' + order.map(function (k) { return ModelData.RANK[k] >= min ? '<td>✓</td>' : '<td class="no">–</td>'; }).join('') + '</tr>';
    });
    t.innerHTML = h + '</tbody>';
  }
  (function () {
    var t = document.getElementById('promo-pill-t'), bar = document.getElementById('promo-bar'), pill = document.getElementById('promo-pill');
    if (!PROMO.off) { if (pill) pill.style.display = 'none'; return; }
    if (t) t.textContent = '-' + PROMO.off + '%';
    if (bar) bar.textContent = 'Launch offer: ' + PROMO.off + '% off every plan. Prices shown are already discounted.';
  })();
  models();
  var studio = document.querySelector('[data-studio]').getAttribute('href');
  var form = document.getElementById('try');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var idea = (document.getElementById('try-idea').value || '').trim();
      var lang = form.querySelector('[name=lang]').value;
      var base = studio.split('#')[0];
      var url = base + (base.indexOf('?') > -1 ? '&' : '?') + 'idea=' + encodeURIComponent(idea) + '&lang=' + encodeURIComponent(lang) + (idea ? '&go=1' : '');
      var a = document.querySelector('[data-studio]');
      if (a.getAttribute('target') === '_blank') window.open(url, '_blank', 'noopener'); else location.href = url;
    });
    var ta = document.getElementById('try-idea');
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  }
  draw(FALLBACK);
  fetch('/api/config').then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
    if (c && Array.isArray(c.plans) && c.plans.length) draw(c.plans.slice().sort(function (a, b) { return a.price - b.price; }));
  }).catch(function () {});
})();
