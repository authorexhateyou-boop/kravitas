// Plans come from the server (so prices stay in one place); this list is the fallback.
(function () {
  var FALLBACK = [
    { id: 'basic', name: 'Basic', credits: 600, price: 39, features: ['Motion ads (animated photo + voice)', 'Up to 3 variations per ad', 'All voices + brainstorm'] },
    { id: 'starter', name: 'Starter', credits: 1000, price: 59, features: ['Everything in Basic', 'Lite & Fast AI video', 'Camera video shots'] },
    { id: 'creator', name: 'Creator', credits: 2500, price: 129, tag: 'Popular', features: ['Everything in Starter', 'Studio lip-sync + Kling', '5 variations per ad', 'Voice cloning & auto-post'] },
    { id: 'pro', name: 'Pro', credits: 6500, price: 299, tag: 'Best value', features: ['Everything in Creator', 'Premium lip-sync (OmniHuman)', 'Kling Pro video'] }
  ];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function draw(plans) {
    var el = document.getElementById('plans');
    el.innerHTML = plans.map(function (p) {
      var pop = p.tag === 'Popular';
      return '<div class="plan' + (pop ? ' pop' : '') + '">' + (p.tag ? '<span class="badge">' + esc(p.tag) + '</span>' : '') +
        '<h3>' + esc(p.name) + '</h3><div class="price">RM' + p.price + '<small>/month</small></div>' +
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
  models();
  var studio = document.querySelector('[data-studio]').getAttribute('href');
  draw(FALLBACK);
  fetch('/api/config').then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
    if (c && Array.isArray(c.plans) && c.plans.length) draw(c.plans.slice().sort(function (a, b) { return a.price - b.price; }));
  }).catch(function () {});
})();
