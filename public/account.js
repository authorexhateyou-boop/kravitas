// Accounts: guests become real accounts by adding an email (keeps all their media and tokens).
// supabase mode = Supabase Auth, preview mode = browser-only demo, local mode = the owner's PC (no sign-in).
(function () {
  const isSb = () => typeof CFG !== 'undefined' && CFG.mode === 'supabase' && typeof sb !== 'undefined' && sb;
  const isPreview = () => typeof CFG !== 'undefined' && CFG.mode === 'preview';
  const prevGet = () => { try { return JSON.parse(localStorage.getItem('kv-acct') || 'null'); } catch { return null; } };
  const prevSet = (v) => { try { v ? localStorage.setItem('kv-acct', JSON.stringify(v)) : localStorage.removeItem('kv-acct'); } catch {} };

  async function info() {
    if (isSb()) { const { data } = await sb.auth.getUser(); const u = data && data.user; return { email: u && u.email || '', guest: !(u && u.email), kind: 'account' }; }
    if (isPreview()) { const a = prevGet(); return { email: a ? a.email : '', guest: !a, kind: 'account', preview: true }; }
    return { email: '', guest: false, kind: 'owner' };
  }
  async function refreshAvatar() {
    const av = document.getElementById('me-av'); if (!av) return;
    const i = await info();
    av.textContent = (i.email ? i.email[0] : i.kind === 'owner' ? 'K' : 'G').toUpperCase();
    av.title = i.email || (i.kind === 'owner' ? 'Your account' : 'Guest account: tap to save it');
  }
  window.refreshAvatar = refreshAvatar;

  async function profileMenu(anchor) {
    const i = await info(); const a = (typeof S !== 'undefined' && S.app) || {};
    const rows = [
      `<div class="pm-head"><b>${i.email ? esc(i.email) : i.kind === 'owner' ? 'You (this PC)' : 'Guest account'}</b><span class="muted">${i.guest ? 'Create an account so your work and tokens are never lost.' : i.kind === 'owner' ? 'Everything is unlocked on your PC.' : 'Signed in'}</span></div>`,
      `<button class="it" data-v="tokens">✦ ${(a.credits || 0).toLocaleString()} tokens · Top up or change plan</button>`,
      `<button class="it" data-v="library">🗂 My library</button>`,
      i.guest ? `<button class="it pri" data-v="signup">Create account / Log in</button>` : '',
      i.kind === 'owner' ? `<button class="it" data-v="settings">⚙ Settings</button>` : '',
      !i.guest && i.kind !== 'owner' ? `<button class="it" data-v="logout">Log out</button>` : '',
    ].join('');
    openPop(anchor, rows, async (v) => {
      closePop();
      if (v === 'tokens') return accountModal();
      if (v === 'library') { closePop(); setMode('media'); return renderAll(); }
      if (v === 'settings') return accountModal();
      if (v === 'signup') return authModal('signup');
      if (v === 'logout') return logout();
    });
  }

  async function logout() {
    if (isSb()) await sb.auth.signOut();
    prevSet(null);
    location.reload();
  }

  function authModal(tab) {
    const prev = isPreview();
    const m = modal(`<h2 id="au-h">${tab === 'login' ? 'Log in' : 'Create your account'}</h2>
      <div class="seg" id="au-seg"><button data-t="signup" class="${tab !== 'login' ? 'on' : ''}">Create account</button><button data-t="login" class="${tab === 'login' ? 'on' : ''}">Log in</button></div>
      ${prev ? '<p class="muted" style="font-size:12.5px">Preview only: this account lives in your browser. Real accounts work on your own site.</p>' : ''}
      <p class="muted" style="font-size:13px;margin:8px 0" id="au-note">${tab === 'login' ? 'Logging in switches to your saved account. This guest session will be left behind.' : 'Your guest work and tokens move into the account. Nothing is lost.'}</p>
      <input class="in" id="au-email" type="email" placeholder="Email" autocomplete="email">
      <input class="in" id="au-pass" type="password" placeholder="Password (at least 8 characters)" autocomplete="${tab === 'login' ? 'current-password' : 'new-password'}" style="margin-top:8px">
      <div class="acts" style="margin-top:12px"><button class="btn pri" id="au-go">${tab === 'login' ? 'Log in' : 'Create account'}</button>${!prev ? '<button class="btn" id="au-g">Continue with Google</button>' : ''}</div>
      ${tab === 'login' && !prev ? '<p style="margin:10px 0 0"><a href="#" id="au-forgot" class="muted">Forgot password?</a></p>' : ''}
      <p class="muted" id="au-err" style="color:#ff6b6b;margin:8px 0 0"></p>`);
    const err = (t) => { m.querySelector('#au-err').textContent = t || ''; };
    m.querySelectorAll('#au-seg button').forEach((b) => (b.onclick = () => { closeModal(); authModal(b.dataset.t); }));
    m.querySelector('#au-go').onclick = async () => {
      const email = m.querySelector('#au-email').value.trim(), pass = m.querySelector('#au-pass').value;
      if (!/^\S+@\S+\.\S+$/.test(email)) return err('Enter a valid email.');
      if (pass.length < 8) return err('Password needs at least 8 characters.');
      err(''); const go = m.querySelector('#au-go'); go.disabled = true;
      try {
        if (prev) { prevSet({ email }); toast('Signed in (preview)'); closeModal(); refreshAvatar(); return; }
        if (tab === 'login') { const { error } = await sb.auth.signInWithPassword({ email, password: pass }); if (error) throw error; location.reload(); return; }
        const { error } = await sb.auth.updateUser({ email, password: pass }); if (error) throw error;
        toast('Account created. If asked, confirm the link we emailed you.'); closeModal(); refreshAvatar();
      } catch (e) { err(e.message || 'Something went wrong.'); go.disabled = false; }
    };
    const g = m.querySelector('#au-g');
    if (g) g.onclick = async () => {
      try {
        const redirectTo = location.origin + '/studio';
        const i = await info();
        const { error } = i.guest ? await sb.auth.linkIdentity({ provider: 'google', options: { redirectTo } }) : await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
        if (error) throw error;
      } catch (e) { err(e.message || 'Google sign-in is not set up yet.'); }
    };
    const f = m.querySelector('#au-forgot');
    if (f) f.onclick = async (e) => { e.preventDefault(); const email = m.querySelector('#au-email').value.trim(); if (!email) return err('Type your email first.'); const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/studio' }); err(error ? error.message : ''); if (!error) toast('Reset link sent. Check your email.'); };
  }

  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-open="profile"]'); if (b) { e.stopPropagation(); profileMenu(b); } }, true);
  let tries = 0; const t = setInterval(() => { if ((typeof S !== 'undefined' && S.app) || ++tries > 40) { clearInterval(t); refreshAvatar(); } }, 300);
  window.authModal = authModal;
})();
