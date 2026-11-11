// Every model and feature Kravitas offers, with the cheapest plan that unlocks it.
// Shared by the studio's Models window and the landing page. Plans come from the server's catalog when
// it is loaded (so there is one source of truth); the fallbacks below match lib/models.js.
(function () {
  var RANK = { free: 0, basic: 1, starter: 2, creator: 3, pro: 4 };
  var LABEL = { free: 'Free', basic: 'Basic', starter: 'Starter', creator: 'Creator', pro: 'Pro' };
  function rows(cat, price) {
    cat = cat || {}; price = price || {};
    var tiers = cat.tiers || {}, mp = cat.modelPlan || { 'h3-turbo': 'starter', 'seedance-fast': 'creator', 'kling-std': 'creator', 'kling-pro': 'pro' };
    var vm = cat.videoModels || {
      'h3-turbo': { label: 'MiniMax H3 Turbo', tag: 'Best value' }, 'seedance-fast': { label: 'Seedance 2.0 Fast', tag: 'Native audio' },
      'kling-std': { label: 'Kling 3.0 Standard', tag: 'Smooth motion' }, 'kling-pro': { label: 'Kling 3.0 Pro', tag: 'Top quality' },
    };
    var tp = function (k, d) { return (tiers[k] && tiers[k].plan) || d; };
    var cr = function (n) { return n ? '✦ ' + n : ''; };
    var out = [
      { g: 'Ads and story videos (the quality you pick)', n: 'Quick', d: 'Your photo moves, with a voice-over. No AI video, cheapest.', p: tp('motion', 'free') },
      { g: 'Ads and story videos (the quality you pick)', n: 'Standard', d: 'Real AI video (MiniMax H3 Turbo), up to 8 seconds.', p: tp('lite', 'starter') },
      { g: 'Ads and story videos (the quality you pick)', n: 'Sharper', d: 'Sharper picture and HD voice, up to 10 seconds.', p: tp('fast', 'starter') },
      { g: 'Ads and story videos (the quality you pick)', n: 'Lip-sync', d: 'The mouth moves with the words (VEED Fabric), up to 30 seconds.', p: tp('studio', 'creator') },
      { g: 'Ads and story videos (the quality you pick)', n: 'Best', d: 'Top quality lip-sync (OmniHuman 1.5), up to 30 seconds.', p: tp('premium', 'pro') },
    ];
    Object.keys(vm).forEach(function (k) {
      out.push({ g: 'Video shots (Video tab)', n: vm[k].label, d: vm[k].tag + (vm[k].perSec ? '' : ''), p: mp[k] || 'starter', c: vm[k].perSec ? '✦ ' + vm[k].perSec + '/sec' : '' });
    });
    out.push(
      { g: 'Images and storyboard', n: 'FLUX Schnell', d: 'Fast sketches for storyboards.', p: 'free', c: cr(price.imageSchnell) },
      { g: 'Images and storyboard', n: 'Seedream 4 Edit', d: 'Keyframes that keep your face and product. Used for keyframes on Basic and Starter.', p: 'free', c: cr(price.imageLite) },
      { g: 'Images and storyboard', n: 'Nano Banana 2', d: 'Sharpest images. Image tab on every plan; storyboard keyframes use it from Creator.', p: 'free', c: cr(price.image) },
      { g: 'Voice, music and writing', n: 'ElevenLabs voices (20)', d: 'Natural English voices.', p: 'free' },
      { g: 'Voice, music and writing', n: 'MiniMax voices (12)', d: 'Best for Bahasa Melayu.', p: 'free' },
      { g: 'Voice, music and writing', n: 'Music and sound effects', d: 'Add them to any video in the Edit tab.', p: 'free' },
      { g: 'Voice, music and writing', n: 'AI writer', d: 'Ideas, scripts and storyboards.', p: 'free', c: cr(price.llm ? 2 : 0) },
      { g: 'Voice, music and writing', n: 'Voice cloning', d: 'Make a voice that sounds like you.', p: 'creator', c: cr(price.voiceClone) },
      { g: 'More', n: 'Auto-posting', d: 'Schedule and post from Kravitas.', p: 'creator' },
      { g: 'More', n: '5 variations per ad', d: 'Basic and Starter get 3.', p: 'creator' }
    );
    return out;
  }
  window.ModelData = { rows: rows, RANK: RANK, LABEL: LABEL };
})();
