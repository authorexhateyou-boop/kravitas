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
    { id: 'motion', cat: 'Ads', e: '✨', h: 40, title: 'Motion ad', sub: 'Your photo animated, cheapest daily post', mode: 'ad', set: { angle: 'deal', format: 'showcase', tier: 'motion', seconds: 8, lang: 'ms', prompt: 'Stok baru sampai! Harga istimewa minggu ni sahaja, tekan bakul kuning sekarang.' },
      gets: ['Animated product photo', 'Bahasa Melayu voice-over', 'Captions burned in', 'About 9 tokens'] },
    { id: 'affil', cat: 'Ads', e: '🔗', h: 200, title: 'Affiliate review', sub: 'Honest review for a TikTok Shop link', mode: 'ad', set: { angle: 'review', format: 'talking', seconds: 8, lang: 'ms', prompt: 'Aku dah guna seminggu, jujur memang berbaloi bawah RM30. Link ada kat bakul kuning.' },
      gets: ['Creator talks to camera', 'Works for any affiliate product', 'Script you can edit first', 'Captions and hashtags'] },
    { id: 'pack', cat: 'Photos', e: '✨', h: 210, title: 'Clean packshot', sub: 'Shopee and TikTok Shop listing', mode: 'image', set: { style: 'studio', aspect: '1:1', count: 1, prompt: 'the product on a seamless pastel background, soft shadows, premium e-commerce packshot' },
      gets: ['Square 1:1 for listings', 'Soft studio light', 'Your product stays accurate (add a product photo)', 'Cheap model by default'] },
    { id: 'life', cat: 'Photos', e: '🛋️', h: 30, title: 'Lifestyle scene', sub: 'Product in a real home', mode: 'image', set: { style: 'photo', aspect: '4:5', count: 1, prompt: 'the product in a bright cosy Malaysian home, natural morning light' },
      gets: ['4:5 for Instagram and Facebook', 'Natural light', 'Feels like a real home', 'Add a friend to hold it'] },
    { id: 'raya', cat: 'Photos', e: '🌙', h: 330, title: 'Festive promo', sub: 'Raya, CNY, Deepavali mood', mode: 'image', set: { style: 'cinematic', aspect: '4:5', count: 1, prompt: 'the product in a festive sale setting with ketupat and warm pelita lights' },
      gets: ['Warm festive lighting', 'Space left for your text', '4:5 portrait', 'Swap the setting in the prompt'] },
    { id: 'thumb', cat: 'Photos', e: '😱', h: 0, title: 'YouTube thumbnail', sub: 'Wide 16:9 cover with room for text', mode: 'image', set: { style: 'photo', aspect: '16:9', count: 1, prompt: 'YouTube thumbnail, close-up of a surprised face on one side, the product on the other, empty space for big bold text, bright high-contrast colours' },
      gets: ['16:9 for YouTube', 'Close-up face that grabs attention', 'Empty space for your title', 'Add your product or friend'] },
    { id: 'orbit', cat: 'Video', e: '🌀', h: 260, title: 'Product orbit shot', sub: 'Smooth camera around it', mode: 'video', set: { camera: 'orbit', model: 'h3-turbo', duration: 5, aspect: '9:16', style: 'cinematic', prompt: 'slow orbit around the product on a marble table, soft window light' },
      gets: ['5s vertical clip', 'Cheapest video model', 'Needs your product photo as the start frame', 'Change the camera any time'] },
    { id: 'story', cat: 'Ideas', e: '🎞', h: 190, title: 'Hook to CTA storyboard', sub: 'Plan before you spend', mode: 'ideas', dump: 'Serum vit C RM29, kulit kusam dan berminyak, nak video TikTok 15 saat dengan hook kuat dan ajak beli di hujung',
      gets: ['5 ideas to choose from', 'A storyboard for the one you like', 'Cost shown before the video', 'Edit any panel first'] },
    { id: 'drama', cat: 'Micro drama', e: '🎭', h: 350, title: 'Micro drama, episode 1', sub: 'A story that ends on a cliffhanger', mode: 'ideas', dump: 'Micro drama untuk TikTok, episod 1. Seorang gadis kampung baru bekerja di KL dan menemui surat rahsia di dalam beg majikannya. Mula dengan hook yang kuat, ketegangan naik, dan tamat dengan cliffhanger supaya orang tunggu episod 2. Watak sama dalam setiap babak.',
      gets: ['A hook, rising tension, cliffhanger', 'Same character in every scene', 'Storyboard you can edit by chat', 'Cost shown before the video'] },
    { id: 'trailer', cat: 'Cinematic', e: '🎬', h: 15, title: 'Film trailer', sub: 'Big mood, fast cuts', mode: 'ideas', dump: 'Trailer filem pendek 30 saat tentang seorang peniaga pasar malam yang mewarisi sebuah kedai lama. Suasana sinematik, muzik dramatik, ayat pendek yang berat. Tamat dengan tajuk filem.',
      gets: ['Cinematic look', 'Short, heavy lines', 'Ends on a title card idea', 'Add your own soundtrack'] },
    { id: 'explain', cat: 'Social', e: '🧠', h: 100, title: 'Explainer', sub: 'Teach one thing in 30 seconds', mode: 'ideas', dump: 'Video penerangan 30 saat: cara kerja faedah kompaun, dijelaskan mudah untuk orang muda Malaysia. Hook soalan di awal, tiga langkah mudah, ajak follow di hujung.',
      gets: ['Question hook', 'Three simple steps', 'Follow-us call to action', 'Plain language'] },
    { id: 'bm', cat: 'Voice', e: '🇲🇾', h: 120, title: 'BM sales voice-over', sub: 'Natural Bahasa Melayu', keepLang: true, mode: 'voice', set: { kind: 'tts', voice: 'mm:Lively_Girl', emotion: 'happy', lang: 'ms', prompt: 'Assalamualaikum semua! Hari ni saya nak kongsi satu produk yang betul-betul berbaloi. Jom tengok sama-sama.' },
      gets: ['MiniMax speech made for Malay', 'Happy, friendly tone', 'Edit the words freely', 'Download or use in an ad'] },
  ];

  // ---- cover art: small original illustrations (SVG). Real sample pictures in public/tpl/<id>.jpg replace them when present. ----
  const bottle = (x, y, c = '#f5e6c8', cap = '#222') => `<g transform="translate(${x} ${y})"><rect x="-14" y="-6" width="28" height="56" rx="8" fill="${c}"/><rect x="-7" y="-22" width="14" height="18" rx="3" fill="${cap}"/><rect x="-10" y="14" width="20" height="16" rx="3" fill="#fff" opacity=".75"/></g>`;
  const box = (x, y, c = '#e9c46a') => `<g transform="translate(${x} ${y})"><path d="M-34 0 L0 -14 L34 0 L34 40 L0 54 L-34 40Z" fill="${c}"/><path d="M0 -14 L0 54" stroke="#0003" stroke-width="2"/><path d="M-34 0 L0 14 L34 0" fill="none" stroke="#0003" stroke-width="2"/></g>`;
  const phone = (x, y, inner = '') => `<g transform="translate(${x} ${y})"><rect x="-30" y="-56" width="60" height="112" rx="10" fill="#111" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><rect x="-25" y="-49" width="50" height="98" rx="5" fill="#2a2a30"/>${inner}</g>`;
  const person = (x, y, skin = '#d9a577', hair = '#2b1d14') => `<g transform="translate(${x} ${y})"><path d="M-30 60 Q-30 20 0 18 Q30 20 30 60Z" fill="#fff" opacity=".9"/><circle cx="0" cy="-6" r="20" fill="${skin}"/><path d="M-21 -10 Q-18 -30 0 -30 Q20 -30 21 -10 Q10 -22 -21 -10Z" fill="${hair}"/></g>`;
  const spark = (x, y, r = 8, c = '#fff') => `<path transform="translate(${x} ${y})" d="M0 -${r} L${r * .3} -${r * .3} L${r} 0 L${r * .3} ${r * .3} L0 ${r} L-${r * .3} ${r * .3} L-${r} 0 L-${r * .3} -${r * .3}Z" fill="${c}"/>`;
  const wrap = (bg1, bg2, body) => `<svg viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g${bg1.slice(1)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs><rect width="300" height="170" fill="url(#g${bg1.slice(1)})"/>${body}</svg>`;
  const ART = {
    flash: wrap('#7a1f1f', '#2a0d0d', `${bottle(120, 100)}${bottle(160, 108, '#f2b5a7')}<g transform="translate(222 52) rotate(10)"><rect x="-38" y="-18" width="76" height="36" rx="8" fill="#ffd60a"/><text x="0" y="8" text-anchor="middle" font-family="Inter,Arial" font-weight="800" font-size="20" fill="#000">-50%</text></g><path d="M60 38 L72 20 L66 36 L82 34 L62 66 L68 44Z" fill="#ffd60a"/>`),
    review: wrap('#5a3a1a', '#1b1208', `${person(110, 84)}${phone(210, 86, `<rect x="-17" y="-28" width="34" height="34" rx="4" fill="#d9a577"/><rect x="-17" y="14" width="34" height="5" rx="2" fill="#fff" opacity=".7"/><rect x="-17" y="24" width="24" height="5" rx="2" fill="#fff" opacity=".4"/>`)}${spark(160, 40, 7, '#ffd60a')}${spark(176, 56, 4, '#ffd60a')}`),
    unbox: wrap('#6b5a1e', '#201b08', `${box(150, 96)}<path d="M116 80 L150 66 L184 80 L150 94Z" fill="#f4d58d"/><path d="M150 54 L150 28 M132 60 L116 40 M168 60 L184 40" stroke="#fff" stroke-width="3" stroke-linecap="round"/>${spark(96, 50, 8, '#fff')}${spark(212, 46, 6, '#fff')}`),
    ba: wrap('#1d5a47', '#08201a', `<rect x="26" y="30" width="116" height="110" rx="12" fill="#00000040"/><rect x="158" y="30" width="116" height="110" rx="12" fill="#ffffff22"/><circle cx="84" cy="80" r="24" fill="#b88a6e"/><circle cx="76" cy="78" r="3" fill="#7b5a44"/><circle cx="92" cy="86" r="3" fill="#7b5a44"/><circle cx="82" cy="94" r="2.5" fill="#7b5a44"/><circle cx="216" cy="80" r="24" fill="#e7c3a1"/>${spark(244, 52, 8, '#fff')}<text x="84" y="128" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="11" fill="#fff" opacity=".8">BEFORE</text><text x="216" y="128" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="11" fill="#fff">AFTER</text>`),
    motion: wrap('#3a2a6b', '#120b20', `<g stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"><path d="M70 70 h30 M60 90 h40 M74 110 h26"/></g>${bottle(160, 92, '#f5e6c8')}${spark(214, 52, 10, '#ffd60a')}`),
    affil: wrap('#1f4a5a', '#08161c', `${person(110, 84, '#c98d62', '#1a120c')}<g transform="translate(214 64)"><rect x="-34" y="-16" width="68" height="32" rx="16" fill="#ffd60a"/><text x="0" y="6" text-anchor="middle" font-family="Inter,Arial" font-weight="800" font-size="15" fill="#000">LINK</text></g>${bottle(214, 112, '#f2b5a7')}`),
    thumb: wrap('#6b1f1f', '#1c0808', `<rect x="18" y="20" width="264" height="130" rx="10" fill="#ffffff10" stroke="#fff" stroke-opacity=".4"/>${person(92, 92)}<text x="200" y="78" text-anchor="middle" font-family="Inter,Arial" font-weight="900" font-size="30" fill="#ffd60a">WOW!</text><text x="200" y="108" text-anchor="middle" font-family="Inter,Arial" font-weight="900" font-size="22" fill="#fff">RM29</text>`),
    pack: wrap('#26364f', '#0b121d', `<ellipse cx="150" cy="138" rx="86" ry="12" fill="#0006"/>${bottle(150, 92, '#fdf3e0')}${bottle(106, 104, '#f2c5d0')}${bottle(194, 104, '#c9e4de')}`),
    life: wrap('#6b4b2a', '#1f150b', `<rect x="0" y="120" width="300" height="50" fill="#0003"/><rect x="40" y="36" width="70" height="74" rx="4" fill="#ffe8a8" opacity=".8"/><path d="M75 36 V110 M40 73 H110" stroke="#0004" stroke-width="3"/><rect x="150" y="96" width="110" height="34" rx="12" fill="#a97c50"/><rect x="150" y="82" width="110" height="22" rx="10" fill="#c39866"/>${bottle(205, 78, '#fff3d6')}`),
    raya: wrap('#12432f', '#06180f', `<circle cx="244" cy="40" r="22" fill="#ffd60a"/><circle cx="254" cy="34" r="20" fill="#12432f"/><g fill="#7bd88f"><path d="M90 60 l16 16 l-16 16 l-16 -16Z"/><path d="M140 80 l14 14 l-14 14 l-14 -14Z" fill="#a8e6b5"/></g><path d="M90 60 V30 M140 80 V40" stroke="#ffffff66" stroke-width="2"/>${bottle(210, 112, '#fff1c9')}<circle cx="60" cy="130" r="5" fill="#ffd60a"/><circle cx="80" cy="138" r="4" fill="#ffd60a"/><circle cx="112" cy="136" r="3" fill="#ffd60a"/>`),
    orbit: wrap('#2a2a55', '#0a0a1c', `<ellipse cx="150" cy="96" rx="104" ry="34" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-dasharray="4 6"/>${bottle(150, 84, '#f5e6c8')}<g transform="translate(254 96)"><rect x="-14" y="-10" width="28" height="20" rx="4" fill="#fff"/><circle cx="0" cy="0" r="6" fill="#2a2a55"/></g>`),
    story: wrap('#4a2a6b', '#150b20', `<g fill="#ffffff22" stroke="#fff" stroke-opacity=".5"><rect x="22" y="44" width="62" height="82" rx="6"/><rect x="96" y="44" width="62" height="82" rx="6"/><rect x="170" y="44" width="62" height="82" rx="6"/></g><circle cx="53" cy="80" r="12" fill="#fff" opacity=".7"/><rect x="108" y="70" width="38" height="30" rx="4" fill="#fff" opacity=".7"/><path d="M182 104 L200 74 L218 104Z" fill="#fff" opacity=".7"/><path d="M240 85 H272 M262 75 L272 85 L262 95" stroke="#ffd60a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    drama: wrap('#6b1f3a', '#1c0810', `<g transform="translate(112 86)"><path d="M-34 -36 Q0 -48 34 -36 L30 8 Q0 44 -30 8Z" fill="#fff" opacity=".92"/><path d="M-20 -14 q8 -8 16 0 M4 -14 q8 -8 16 0" stroke="#6b1f3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-14 12 q14 -12 28 0" stroke="#6b1f3a" stroke-width="3" fill="none" stroke-linecap="round"/></g><g transform="translate(196 96) rotate(12)"><path d="M-34 -36 Q0 -48 34 -36 L30 8 Q0 44 -30 8Z" fill="#ffd60a" opacity=".95"/><path d="M-20 -12 q8 8 16 0 M4 -12 q8 8 16 0" stroke="#6b1f3a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-14 22 q14 -12 28 0" stroke="#6b1f3a" stroke-width="3" fill="none" stroke-linecap="round"/></g>`),
    trailer: wrap('#1a1a1a', '#000', `<rect x="0" y="0" width="300" height="22" fill="#000"/><rect x="0" y="148" width="300" height="22" fill="#000"/><path d="M0 120 L80 70 L130 100 L190 52 L300 110 V148 H0Z" fill="#2c2c34"/><circle cx="232" cy="46" r="16" fill="#ffd60a" opacity=".9"/><text x="150" y="132" text-anchor="middle" font-family="Georgia,serif" font-size="15" letter-spacing="6" fill="#fff" opacity=".85">COMING SOON</text>`),
    explain: wrap('#1d4a6b', '#08141d', `<g transform="translate(70 70)"><circle r="26" fill="#ffd60a"/><path d="M-10 -4 h20 M-8 8 h16 M-4 18 h8" stroke="#000" stroke-width="3" stroke-linecap="round"/><path d="M-6 -22 q6 -6 12 0" stroke="#000" stroke-width="3" fill="none"/></g><g fill="#fff"><rect x="124" y="46" width="130" height="12" rx="6" opacity=".9"/><rect x="124" y="70" width="104" height="12" rx="6" opacity=".6"/><rect x="124" y="94" width="116" height="12" rx="6" opacity=".4"/></g><g fill="#ffd60a"><circle cx="112" cy="52" r="5"/><circle cx="112" cy="76" r="5"/><circle cx="112" cy="100" r="5"/></g>`),
    bm: wrap('#2b2f6b', '#0c0d20', `<g fill="#fff">${[20,34,48,28,60,40,72,52,36,64,44,26,56,38,22].map((h, k) => `<rect x="${44 + k * 14}" y="${85 - h / 2}" width="7" height="${h}" rx="3.5" opacity="${.5 + (k % 3) * .2}"/>`).join('')}</g><g transform="translate(246 38)"><rect x="-7" y="-14" width="14" height="22" rx="7" fill="#ffd60a"/><path d="M-12 0 q12 18 24 0 M0 12 v8" stroke="#ffd60a" stroke-width="3" fill="none" stroke-linecap="round"/></g>`),
  };

  // ---- language: the whole template page and what it fills in follows the interface language (EN or BM) ----
  // en = English prompt / brief used when the interface is English; ms = Bahasa Melayu card text for the BM interface.
  const TX = {
    flash: { en: 'Half price today only, limited stock, free postage', ms: { title: 'Iklan jualan kilat', sub: 'Desakan gaya 11.11, 8s', gets: ['Hook dalam 2 saat pertama', 'Suara latar Bahasa Melayu', 'Sari kata terbakar', 'Kapsyen dan hashtag'] } },
    review: { en: "Tried it for 2 weeks, here's what I honestly think", ms: { title: 'Ulasan jujur', sub: 'Kreator bercakap ke kamera', gets: ['Skrip santai dan meyakinkan', 'Kawan atau pengacara yang bercakap', 'Sesuai dengan gambar produk anda', 'Sedia untuk TikTok 9:16'] } },
    unbox: { en: 'It just arrived! Let\'s open it together', ms: { title: 'Unboxing', sub: 'Kesan pertama', gets: ['Cerita membuka kotak', 'Syot dekat produk', 'Suara latar teruja', 'Sari kata'] } },
    ba: { en: 'Before and after using it for 14 days', ms: { title: 'Sebelum dan selepas', sub: 'Perubahannya', gets: ['Babak sebelum dan selepas yang jelas', 'Suara latar gaya bukti', 'Sari kata', 'Kapsyen dan hashtag'] } },
    motion: { en: 'New stock just landed! Special price this week only, tap the yellow basket now.', ms: { title: 'Iklan Motion', sub: 'Gambar anda dianimasikan, paling murah', gets: ['Gambar produk bergerak', 'Suara latar Bahasa Melayu', 'Sari kata terbakar', 'Kira-kira 9 token'] } },
    affil: { en: 'Used it for a week, honestly worth it under RM30. Link is in the yellow basket.', ms: { title: 'Ulasan affiliate', sub: 'Ulasan jujur untuk pautan TikTok Shop', gets: ['Kreator bercakap ke kamera', 'Sesuai untuk mana-mana produk affiliate', 'Skrip boleh disunting dahulu', 'Kapsyen dan hashtag'] } },
    thumb: { ms: { title: 'Thumbnail YouTube', sub: 'Kulit lebar 16:9 dengan ruang untuk teks', gets: ['16:9 untuk YouTube', 'Wajah dekat yang menarik perhatian', 'Ruang kosong untuk tajuk', 'Tambah produk atau kawan anda'] } },
    pack: { ms: { title: 'Packshot bersih', sub: 'Penyenaraian Shopee dan TikTok Shop', gets: ['Segi empat 1:1 untuk penyenaraian', 'Cahaya studio lembut', 'Produk anda kekal tepat (tambah gambar produk)', 'Model murah secara lalai'] } },
    life: { ms: { title: 'Babak gaya hidup', sub: 'Produk di rumah sebenar', gets: ['4:5 untuk Instagram dan Facebook', 'Cahaya semula jadi', 'Terasa seperti rumah sebenar', 'Tambah kawan memegangnya'] } },
    raya: { ms: { title: 'Promosi perayaan', sub: 'Suasana Raya, CNY, Deepavali', gets: ['Cahaya perayaan yang hangat', 'Ruang untuk teks anda', 'Potret 4:5', 'Tukar suasana dalam prompt'] } },
    orbit: { ms: { title: 'Syot orbit produk', sub: 'Kamera berputar lancar', gets: ['Klip menegak 5s', 'Model video paling murah', 'Perlukan gambar produk sebagai bingkai mula', 'Tukar kamera bila-bila masa'] } },
    story: { en: 'Vitamin C serum RM29, dull and oily skin, I want a 15 second TikTok video with a strong hook and a call to buy at the end', ms: { title: 'Papan cerita Hook ke CTA', sub: 'Rancang sebelum berbelanja', gets: ['5 idea untuk dipilih', 'Papan cerita untuk idea pilihan anda', 'Kos ditunjuk sebelum video', 'Edit mana-mana panel dahulu'] } },
    drama: { en: 'A TikTok micro drama, episode 1. A village girl who just started working in KL finds a secret letter in her employer\'s bag. Start with a strong hook, build tension, and end on a cliffhanger so people wait for episode 2. Same character in every scene.', ms: { title: 'Mikro drama, episod 1', sub: 'Cerita yang tamat dengan cliffhanger', gets: ['Hook, ketegangan naik, cliffhanger', 'Watak sama dalam setiap babak', 'Papan cerita boleh diedit melalui sembang', 'Kos ditunjuk sebelum video'] } },
    trailer: { en: 'A 30 second short film trailer about a night market trader who inherits an old shop. Cinematic mood, dramatic music, short heavy lines. End with the film title.', ms: { title: 'Treler filem', sub: 'Suasana besar, potongan pantas', gets: ['Rupa sinematik', 'Ayat pendek dan berat', 'Tamat dengan idea kad tajuk', 'Tambah runut bunyi anda'] } },
    explain: { en: 'A 30 second explainer: how compound interest works, explained simply for young Malaysians. Question hook at the start, three easy steps, ask to follow at the end.', ms: { title: 'Penerangan', sub: 'Ajar satu perkara dalam 30 saat', gets: ['Hook soalan', 'Tiga langkah mudah', 'Ajakan ikuti kami', 'Bahasa mudah'] } },
    bm: { en: "Hi everyone! Today I want to share a product that is really worth it. Let's take a look together.", ms: { title: 'Suara latar jualan BM', sub: 'Bahasa Melayu yang semula jadi', gets: ['MiniMax speech dibuat untuk Bahasa Melayu', 'Nada ceria dan mesra', 'Edit perkataan sesuka hati', 'Muat turun atau guna dalam iklan'] } },
  };
  const CAT_MS = { All: 'Semua', Ads: 'Iklan', Photos: 'Foto', Video: 'Video', 'Micro drama': 'Mikro drama', Cinematic: 'Sinematik', Social: 'Sosial', Ideas: 'Idea', Voice: 'Suara' };
  const HEAD_MS = ['Templat', 'Mula dengan sesuatu yang sudah berjaya. Pilih satu, tambah produk anda, tekan Buat. Tiada apa dibelanjakan sehingga anda berbuat demikian.', 'Guna templat ini', 'Templat siap. Tambah produk anda, kemudian tekan'];
  const bm = () => window.UILang && UILang.get() === 'bm';
  // returns the template as it should look and fill in for the current interface language
  function view(t) {
    const x = TX[t.id] || {};
    if (bm()) return { ...t, ...(x.ms || {}), lang: 'ms' };
    const set = t.set ? { ...t.set } : null;
    if (set && !t.keepLang) { if (set.lang) set.lang = 'en'; if (x.en) set.prompt = x.en; }
    return { ...t, set, dump: x.en || t.dump, lang: 'en' };
  }
  const art = (id, M) => { const a = ART[id]; return a && M ? a.replace('BEFORE', 'SEBELUM').replace('AFTER', 'SELEPAS').replace('COMING SOON', 'AKAN DATANG') : a; };
  const CATS = ['All', 'Ads', 'Photos', 'Video', 'Micro drama', 'Cinematic', 'Social', 'Ideas', 'Voice'];
  let cat = 'All';

  // the template text is an example: highlight it so the first keystroke replaces it
  function selectExample(sel) { setTimeout(() => { const el = document.querySelector(sel); if (el) { el.focus(); el.select(); } }, 80); }
  window.useTemplateId = (id) => { const t = T.find((x) => x.id === id); if (t) use(t); return !!t; };
  function use(t0) {
    const t = view(t0);
    if (t.mode === 'ideas') {
      IDEAS.dump = t.dump; IDEAS.lang = t.lang; IDEAS.result = null; IDEAS.chat = [];
      setMode('ideas'); renderAll(); selectExample('#id-dump'); toast(bm() ? 'Templat siap. Tambah produk anda, kemudian tekan hantar' : 'Template ready. Add your product, then press send');
      return;
    }
    S.forms[t.mode] = { ...DEFAULTS[t.mode](), ...t.set };
    setMode(t.mode); renderAll(); selectExample('#prompt');
    toast(bm() ? `Templat ${t.title} siap. Tambah produk anda, kemudian tekan Buat` : `${t.title} template ready. Add your product, then press Make`);
  }

  window.renderTemplates = function (box) {
    const M = bm();
    const list = T.filter((t) => cat === 'All' || t.cat === cat).map(view);
    box.innerHTML = `<div class="fl-head" data-noi18n><h1>${M ? HEAD_MS[0] : 'Templates'}</h1><p>${M ? HEAD_MS[1] : 'Start from something that already works. Pick one, add your product, press Make. Nothing is spent until you do.'}</p></div>
      <div class="lib-chips" data-noi18n>${CATS.map((c) => `<button class="chip ${c === cat ? 'on' : ''}" data-tc="${c}">${M ? CAT_MS[c] : c}</button>`).join('')}</div>
      <div class="tpl-grid" data-noi18n>${list.map((t) => `<article class="tpl" style="--h:${t.h}">
        <div class="tpl-cover">${art(t.id, M) || `<span class="tpl-e">${t.e}</span>`}<small>${esc(M ? CAT_MS[t.cat] : t.cat)}</small></div>
        <div class="tpl-b"><b>${esc(t.title)}</b><p>${esc(t.sub)}</p>
          <ul>${t.gets.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
          <button class="btn pri" data-tu="${t.id}">${M ? HEAD_MS[2] : 'Use this template'}</button></div></article>`).join('')}</div>`;
    box.querySelectorAll('.tpl').forEach((el, k) => { // real sample photo, if public/tpl/<id>.jpg exists
      const im = new Image(); const t = list[k];
      im.onload = () => { im.className = 'tpl-img'; im.alt = ''; el.querySelector('.tpl-cover')?.prepend(im); };
      im.src = 'tpl/' + t.id + '.jpg';
    });
    box.querySelectorAll('[data-tc]').forEach((b) => (b.onclick = () => { cat = b.dataset.tc; window.renderTemplates(box); }));
    box.querySelectorAll('[data-tu]').forEach((b) => (b.onclick = () => use(T.find((x) => x.id === b.dataset.tu))));
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('[data-uilang]') && S.mode === 'templates') setTimeout(() => renderAll(), 30);
  });
})();
