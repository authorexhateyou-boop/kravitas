// Dwibahasa: English ⇄ Bahasa Melayu for the whole studio.
// The app renders in English; this layer swaps visible text, placeholders and tooltips when BM is on,
// and puts the English back when it is off. User content (prompts, names, scripts) is never touched.
(function () {
  var D = {
    // shell
    'Studio': 'Studio', 'Models': 'Model', 'Create': 'Cipta', 'Finish': 'Siapkan', 'Ideas': 'Idea', 'Ad': 'Iklan', 'Video': 'Video', 'Image': 'Gambar',
    'Voice': 'Suara', 'Edit': 'Sunting', 'Schedule': 'Jadual', 'Recent': 'Terkini', 'Tap to open': 'Tekan untuk buka', 'Terms': 'Terma', 'Privacy': 'Privasi',
    'Kravitas home': 'Laman utama Kravitas', 'See every model and what your plan unlocks': 'Lihat semua model dan apa yang pelan anda buka',
    'Show the step-by-step guide': 'Tunjuk panduan langkah demi langkah', 'Settings': 'Tetapan', 'Tools': 'Alat', 'Delete': 'Padam',
    'What you make shows up here.': 'Hasil anda akan muncul di sini.',
    // model card
    'Model': 'Model', 'All models': 'Semua model', 'AI writer': 'Penulis AI', 'Writes ideas, prompts and storyboards.': 'Menulis idea, prompt dan papan cerita.',
    'everything unlocked on your PC': 'semua dibuka di PC anda', 'Free trial': 'Percubaan percuma', 'No AI model': 'Tiada model AI',
    'Scheduling and posting do not use credits.': 'Menjadual dan menyiar tidak guna kredit.', 'No AI needed to join clips': 'Tak perlu AI untuk cantum klip',
    'New voice-overs use ElevenLabs or MiniMax. New music uses ElevenLabs Music.': 'Suara latar baharu guna ElevenLabs atau MiniMax. Muzik baharu guna ElevenLabs Music.',
    'Sharpest images. Keeps your character and product when you add them.': 'Gambar paling tajam. Kekalkan watak dan produk anda bila ditambah.',
    'Natural English voices.': 'Suara Inggeris yang semula jadi.', 'Best for Bahasa Melayu, and your cloned voice.': 'Terbaik untuk Bahasa Melayu dan suara klon anda.',
    'Short sounds from a description.': 'Bunyi pendek daripada penerangan.', 'Background tracks from a description.': 'Muzik latar daripada penerangan.',
    'Best value': 'Paling berbaloi', 'Native audio': 'Ada bunyi asal', 'Smooth motion': 'Gerakan lancar', 'Top quality': 'Kualiti tertinggi',
    'The AI model this uses. Tap to see all models.': 'Model AI yang digunakan. Tekan untuk lihat semua model.',
    // ideas
    'Dump your ideas': 'Curahkan idea anda', 'Attach': 'Lampir', 'images · PDF · Word · text': 'gambar · PDF · Word · teks', 'Turn into prompts': 'Jadikan prompt',
    'Think again': 'Fikir semula', 'Thinking…': 'Sedang berfikir…', 'Try:': 'Cuba:', 'Product (optional)': 'Produk (pilihan)', 'Character (optional)': 'Watak (pilihan)',
    'None': 'Tiada', 'Language': 'Bahasa', 'Saved ideas': 'Idea disimpan', 'Your prompt library. Tap one to load it into a tool.': 'Pustaka prompt anda. Tekan satu untuk muatkan ke dalam alat.',
    'Brand notes': 'Nota jenama', 'Standing guidelines Kravitas follows in every idea and script: tone, must-say, never-say.': 'Garis panduan tetap yang Kravitas ikut dalam setiap idea dan skrip: nada, wajib sebut, jangan sebut.',
    'Save notes': 'Simpan nota', 'How Ideas works': 'Cara Idea berfungsi', 'Dump': 'Curahkan',
    'everything you know: product, price, promo, buyers, vibe. Messy is fine. Add files too: a product sheet, brand deck, competitor screenshots, reviews.': 'semua yang anda tahu: produk, harga, promosi, pembeli, gaya. Bersepah pun tak apa. Tambah fail juga: helaian produk, dek jenama, tangkap layar pesaing, ulasan.',
    'Kravitas writes': 'Kravitas menulis', 'the audience, hooks and ready-to-run prompts for Ad, Video and Image.': 'sasaran penonton, hook dan prompt sedia guna untuk Iklan, Video dan Gambar.',
    'Save': 'Simpan', 'the ones you like. They live in your library, and': 'yang anda suka. Ia disimpan dalam pustaka anda, dan', 'Use it': 'Guna',
    'loads one straight into the right tool.': 'memuatkannya terus ke alat yang betul.',
    'Messy is fine. Type, paste, or drop files here: product sheets, screenshots, PDF, Word. Kravitas reads them and writes the prompts.': 'Bersepah pun tak apa. Taip, tampal atau lepaskan fail di sini: helaian produk, tangkap layar, PDF, Word. Kravitas baca dan tulis prompt untuk anda.',
    'Attach images, PDF, Word or text': 'Lampirkan gambar, PDF, Word atau teks', 'Add a product photo': 'Tambah gambar produk', 'Add a character': 'Tambah watak',
    'Attach more files': 'Lampirkan fail lagi', 'Who it\'s for': 'Untuk siapa', 'Hooks': 'Hook', 'Copy': 'Salin', 'Ready-to-use prompts': 'Prompt sedia guna',
    'Use it →': 'Guna →', 'Storyboard': 'Papan cerita', 'Tell Kravitas more': 'Beritahu Kravitas lagi', 'Send': 'Hantar', 'Shown to Kravitas': 'Ditunjukkan kepada Kravitas',
    'Target busy mums': 'Sasarkan ibu yang sibuk', 'Make it funnier': 'Jadikan lebih lucu', 'Raya / festive theme': 'Tema Raya / perayaan', 'Push the price & promo': 'Tekankan harga & promosi',
    'Younger Gen Z vibe': 'Gaya Gen Z yang muda', 'More premium feel': 'Rasa lebih premium', 'PDF and Word are read as text': 'PDF dan Word dibaca sebagai teks',
    // storyboard
    '← Back to ideas': '← Kembali ke idea', 'Check the story and the character here before you spend on video. Sketches are cheap. Turn the panels you like into real keyframes with your character and product, and the video is made from those.': 'Semak jalan cerita dan watak di sini sebelum belanja untuk video. Lakaran murah. Tukar panel yang anda suka kepada gambar sebenar dengan watak dan produk anda, dan video dibuat daripada gambar itu.',
    'Same in every panel': 'Sama dalam setiap panel', 'character, product, setting': 'watak, produk, latar', 'edit it, then redraw': 'sunting, kemudian lukis semula',
    'Sketch': 'Lakaran', 'Keyframe ✓': 'Gambar sebenar ✓', 'Redraw': 'Lukis semula', 'Real keyframe': 'Gambar sebenar', 'Video quality': 'Kualiti video',
    'Real keyframes for all': 'Gambar sebenar untuk semua', 'Make the video': 'Buat video', 'What is said': 'Apa yang disebut', 'Remove panel': 'Buang panel',
    'All panels are still sketches. Panels left as sketches are painted as real images when you make the video, so you only pay for them once.': 'Semua panel masih lakaran. Panel yang kekal lakaran akan dilukis sebagai gambar sebenar bila video dibuat, jadi anda bayar sekali sahaja.',
    'Planning your shots and sketching them…': 'Merancang babak dan melakarnya…', 'This takes about 20 seconds.': 'Ambil masa kira-kira 20 saat.', 'Sketching…': 'Melakar…', 'Drawing keyframe…': 'Melukis gambar sebenar…',
    // ad / composer
    'Make an ad': 'Buat iklan', 'Add your product. Kravitas writes the script, records the voice and makes a short video for TikTok Shop and Shopee.': 'Tambah produk anda. Kravitas tulis skrip, rakam suara dan buat video pendek untuk TikTok Shop dan Shopee.',
    'Product': 'Produk', 'Add your product, pick the language and hit Generate. You see the script before anything is made.': 'Tambah produk, pilih bahasa dan tekan Jana. Anda lihat skrip dahulu sebelum apa-apa dibuat.',
    'We write the hook and script and show them to you before making the video.': 'Kami tulis hook dan skrip, dan tunjukkan kepada anda sebelum video dibuat.',
    'Someone talks about it': 'Seseorang bercakap tentangnya', 'Show the product': 'Tunjuk produk', 'More options': 'Lagi pilihan', 'Fewer options': 'Kurang pilihan', 'Generate': 'Jana',
    'Prompt from files': 'Prompt daripada fail', '50% off today only, free shipping': 'Diskaun 50% hari ini sahaja, penghantaran percuma', 'Halal and safe for sensitive skin': 'Halal dan selamat untuk kulit sensitif',
    'New arrival, limited stock': 'Baru sampai, stok terhad', 'What you are selling. One clear photo is enough.': 'Apa yang anda jual. Satu gambar yang jelas sudah cukup.', 'Add product': 'Tambah produk',
    'Ad style': 'Gaya iklan', 'Pick an angle. You can change it any time.': 'Pilih sudut. Boleh tukar bila-bila masa.', 'Honest review': 'Ulasan jujur', 'Flash sale': 'Jualan kilat',
    'Problem → fix': 'Masalah → penyelesaian', 'Unboxing': 'Buka kotak', 'Vs. pricey one': 'Lawan yang mahal', 'Before & after': 'Sebelum & selepas',
    'Character': 'Watak', 'Who presents your product. Optional.': 'Siapa yang memperkenalkan produk anda. Pilihan.', 'Add character': 'Tambah watak', 'AI avatars': 'Avatar AI', 'Tap to use': 'Tekan untuk guna',
    'Add friend, product or image': 'Tambah rakan, produk atau gambar', 'Attach images, PDF, Word or text as references': 'Lampirkan gambar, PDF, Word atau teks sebagai rujukan',
    'Anything to mention? e.g. 50% off today, halal, free shipping (optional)': 'Ada apa-apa nak sebut? cth. diskaun 50% hari ini, halal, penghantaran percuma (pilihan)',
    'Get hooks and ideas from your photos (2 credits)': 'Dapatkan hook dan idea daripada gambar anda (2 kredit)', '1 ad': '1 iklan', '3 variations': '3 variasi', '5 variations': '5 variasi',
    'Approve first': 'Luluskan dahulu', 'Captions': 'Sari kata', 'Quick': 'Pantas', 'Standard': 'Standard', 'Sharper': 'Lebih tajam', 'Lip-sync': 'Segerak bibir', 'Best': 'Terbaik',
    'Motion (photo + voice)': 'Gerakan (gambar + suara)', 'Moving photo + voice': 'Gambar bergerak + suara', 'cheapest': 'paling murah', 'Real AI video, up to 8s': 'Video AI sebenar, sehingga 8s',
    'Sharper picture, up to 10s': 'Gambar lebih tajam, sehingga 10s', 'Mouth moves with the words': 'Mulut bergerak ikut perkataan', 'Top quality lip-sync': 'Segerak bibir kualiti tertinggi',
    'Cloned voice': 'Suara klon', 'MiniMax · natural Bahasa Melayu': 'MiniMax · Bahasa Melayu semula jadi', 'Friends & avatars': 'Rakan & avatar', 'Avatar library · pick an AI creator': 'Pustaka avatar · pilih pencipta AI',
    'Create your own AI avatar': 'Cipta avatar AI anda sendiri', 'New friend': 'Rakan baharu', 'Products': 'Produk', 'New product': 'Produk baharu',
    'Script: AI writer': 'Skrip: Penulis AI', 'Picture: Seedream 4': 'Gambar: Seedream 4', 'Picture: Nano Banana 2': 'Gambar: Nano Banana 2', 'Voice: ElevenLabs or MiniMax': 'Suara: ElevenLabs atau MiniMax',
    'Sketches: FLUX Schnell': 'Lakaran: FLUX Schnell', 'Keyframes: Nano Banana 2': 'Gambar sebenar: Nano Banana 2', 'Keyframes: Seedream 4 Edit': 'Gambar sebenar: Seedream 4 Edit', 'Start picture: Nano Banana 2': 'Gambar mula: Nano Banana 2',
    // video
    'Scene prompt': 'Prompt babak', 'Camera': 'Kamera', 'Static': 'Statik', 'Dolly in': 'Dolly masuk', 'Dolly out': 'Dolly keluar', 'Pan': 'Pan', 'Orbit': 'Orbit', 'Crane up': 'Kren naik',
    'Handheld': 'Pegang tangan', 'Crash zoom': 'Zum mengejut', 'FPV drone': 'Dron FPV', 'Quick (good value)': 'Pantas (berbaloi)', 'With sound': 'Dengan bunyi', 'Best quality': 'Kualiti terbaik',
    'Format': 'Format', 'Portrait (TikTok, Reels)': 'Menegak (TikTok, Reels)', 'Landscape (YouTube)': 'Melintang (YouTube)', 'Square': 'Segi empat sama', 'Generate shot': 'Jana babak',
    'Your photo is the reference. Kravitas keeps this face.': 'Gambar anda jadi rujukan. Kravitas kekalkan wajah ini.', 'Start from a template': 'Mula dengan templat',
    'Fills the prompt, camera and style for you.': 'Mengisi prompt, kamera dan gaya untuk anda.', 'Raya greeting': 'Ucapan Raya', 'Café promo': 'Promosi kafe', 'Product reveal': 'Pendedahan produk',
    'Street food ad': 'Iklan makanan jalanan', 'Hero walk': 'Jalan hero', 'Travel vlog': 'Vlog melancong', 'Visual style': 'Gaya visual', 'Realistic': 'Realistik', 'Cinematic': 'Sinematik',
    '3D animated': 'Animasi 3D', 'Anime': 'Anime', 'Claymation': 'Animasi tanah liat', 'Storybook': 'Buku cerita', 'True to ref': 'Sama seperti rujukan', 'Live-action': 'Lakonan sebenar',
    'Family film': 'Filem keluarga', 'Bold colour': 'Warna terang', 'Handmade': 'Buatan tangan', 'Watercolour': 'Cat air', 'Rendering your shot…': 'Sedang menjana babak anda…',
    // image
    'Make an image': 'Buat gambar', 'Packshots, lifestyle and thumbnails with your friends and products.': 'Gambar produk, gaya hidup dan thumbnail dengan rakan dan produk anda.',
    'Product on a marble table, soft morning light': 'Produk di atas meja marmar, cahaya pagi yang lembut', 'Flat lay with flowers, top view': 'Susun rata dengan bunga, pandangan atas',
    'A young woman holding the product in a cafe': 'Seorang wanita muda memegang produk di kafe', 'Templates': 'Templat', 'One tap sets everything up.': 'Satu tekan, semuanya siap.',
    'Packshot': 'Gambar produk', 'Lifestyle': 'Gaya hidup', 'Flat lay': 'Susun rata', 'Friend holds it': 'Rakan pegang', 'Thumbnail': 'Thumbnail', 'Festive promo': 'Promosi perayaan',
    'Describe the image…': 'Terangkan gambar…', 'Phone / UGC': 'Telefon / UGC', 'Clay': 'Tanah liat',
    // voice
    'Make a voice-over': 'Buat suara latar', 'ElevenLabs voice-overs, natural Bahasa Melayu voices, your own cloned voice, music and sound effects.': 'Suara latar ElevenLabs, suara Bahasa Melayu semula jadi, suara klon anda sendiri, muzik dan kesan bunyi.',
    'Voice-over': 'Suara latar', 'Sound effect': 'Kesan bunyi', 'Music': 'Muzik', 'Your voice': 'Suara anda', 'Clone your own voice once, then use it on every voice-over.': 'Klon suara anda sekali, kemudian guna untuk setiap suara latar.',
    'Me': 'Saya', 'Clone my voice': 'Klon suara saya', 'Excited promo': 'Promosi teruja', 'BM sales voice': 'Suara jualan BM', 'Calm narrator': 'Pencerita tenang', 'Whisper / ASMR': 'Bisik / ASMR',
    'Background music': 'Muzik latar', 'Credits': 'Kredit', 'Plans from RM39/month': 'Pelan dari RM39/bulan', 'See plans': 'Lihat pelan',
    'Type the voice-over… v3 understands tags like [excited] [whispers] [laughs]': 'Taip suara latar… v3 faham tag seperti [excited] [whispers] [laughs]', 'Your voice-over plays here': 'Suara latar anda dimainkan di sini',
    'ElevenLabs v3 · expressive': 'ElevenLabs v3 · ekspresif', 'Me (your voice)': 'Saya (suara anda)',
    // edit
    'Add clips from your library': 'Tambah klip dari pustaka anda', 'Pick images or videos on the right, then add a voice-over and music.': 'Pilih gambar atau video di kanan, kemudian tambah suara latar dan muzik.',
    'Clips': 'Klip', 'Add': 'Tambah', 'My voice-overs': 'Suara latar saya', 'Write new': 'Tulis baharu', 'My music': 'Muzik saya', 'Keep original sound': 'Kekalkan bunyi asal',
    'Render video': 'Hasilkan video', 'Your library': 'Pustaka anda', 'Tap to add to the timeline. Up to 6 clips.': 'Tekan untuk tambah ke garis masa. Sehingga 6 klip.',
    'Voice-overs & music': 'Suara latar & muzik', 'Your audio. Tap to use it in this edit.': 'Audio anda. Tekan untuk guna dalam suntingan ini.', 'Use as voice-over': 'Guna sebagai suara latar',
    'Make → edit → post': 'Buat → sunting → siar', 'Add clips': 'Tambah klip', 'from your library, in the order you want.': 'dari pustaka anda, ikut susunan yang anda mahu.',
    'Add sound:': 'Tambah bunyi:', 'a voice-over, music and captions.': 'suara latar, muzik dan sari kata.', 'Render': 'Hasilkan', ', then post or schedule it straight from here.': ', kemudian siar atau jadualkan terus dari sini.',
    'Final video': 'Video akhir', 'Edited video': 'Video disunting', 'Keyframe': 'Gambar sebenar', 'Shot': 'Babak',
    // schedule
    'Connect your accounts once, then post or schedule any video. TikTok and YouTube posts are labelled as AI-generated.': 'Sambung akaun anda sekali, kemudian siar atau jadualkan mana-mana video. Siaran TikTok dan YouTube dilabel sebagai dijana AI.',
    'Not connected': 'Belum disambung', 'Connect': 'Sambung', 'Next 7 days': '7 hari akan datang', 'Schedule a post': 'Jadualkan siaran', 'Queue': 'Giliran',
    'Thu': 'Kha', 'Fri': 'Jum', 'Sat': 'Sab', 'Sun': 'Aha', 'Mon': 'Isn', 'Tue': 'Sel', 'Wed': 'Rab',
    'Nothing scheduled. Open any video in your creations and tap “Post / schedule”.': 'Tiada jadual. Buka mana-mana video anda dan tekan “Siar / jadual”.',
    'Ready to post': 'Sedia untuk disiar', 'Your latest videos. Tap one to post or schedule it.': 'Video terbaru anda. Tekan satu untuk siar atau jadualkan.', 'Post / schedule': 'Siar / jadual',
    'How it works': 'Cara ia berfungsi', 'your TikTok, Instagram, Facebook, YouTube or Threads.': 'TikTok, Instagram, Facebook, YouTube atau Threads anda.', 'Make': 'Buat',
    'a video in Ad or Video.': 'video dalam Iklan atau Video.', 'Post or schedule': 'Siar atau jadualkan', 'it from its card. Captions are filled in for you.': 'dari kadnya. Kapsyen diisi untuk anda.',
    // models window
    'Everything is unlocked on your own computer.': 'Semuanya dibuka di komputer anda sendiri.', 'Your plan:': 'Pelan anda:', '. You can use': '. Anda boleh guna',
    'Ads and story videos (the quality you pick)': 'Iklan dan video cerita (kualiti yang anda pilih)', 'Your photo moves, with a voice-over. No AI video, cheapest.': 'Gambar anda bergerak, dengan suara latar. Tiada video AI, paling murah.',
    'Real AI video (MiniMax H3 Turbo), up to 8 seconds.': 'Video AI sebenar (MiniMax H3 Turbo), sehingga 8 saat.', 'Sharper picture and HD voice, up to 10 seconds.': 'Gambar lebih tajam dan suara HD, sehingga 10 saat.',
    'The mouth moves with the words (VEED Fabric), up to 30 seconds.': 'Mulut bergerak ikut perkataan (VEED Fabric), sehingga 30 saat.', 'Top quality lip-sync (OmniHuman 1.5), up to 30 seconds.': 'Segerak bibir kualiti tertinggi (OmniHuman 1.5), sehingga 30 saat.',
    'Video shots (Video tab)': 'Babak video (tab Video)', 'Images and storyboard': 'Gambar dan papan cerita', 'Fast sketches for storyboards.': 'Lakaran pantas untuk papan cerita.',
    'Keyframes that keep your face and product. Used for keyframes on Basic and Starter.': 'Gambar sebenar yang kekalkan wajah dan produk anda. Digunakan pada pelan Basic dan Starter.',
    'Sharpest images. Image tab on every plan; storyboard keyframes use it from Creator.': 'Gambar paling tajam. Tab Gambar pada setiap pelan; gambar papan cerita menggunakannya dari Creator.',
    'Voice, music and writing': 'Suara, muzik dan penulisan', 'ElevenLabs voices (20)': 'Suara ElevenLabs (20)', 'MiniMax voices (12)': 'Suara MiniMax (12)', 'Best for Bahasa Melayu.': 'Terbaik untuk Bahasa Melayu.',
    'Music and sound effects': 'Muzik dan kesan bunyi', 'Add them to any video in the Edit tab.': 'Tambah pada mana-mana video dalam tab Sunting.', 'Ideas, scripts and storyboards.': 'Idea, skrip dan papan cerita.',
    'Voice cloning': 'Klon suara', 'Make a voice that sounds like you.': 'Buat suara yang serupa dengan anda.', 'More': 'Lagi', 'Auto-posting': 'Siaran automatik', 'Schedule and post from Kravitas.': 'Jadual dan siar dari Kravitas.',
    '5 variations per ad': '5 variasi setiap iklan', 'Basic and Starter get 3.': 'Basic dan Starter dapat 3.',
    // settings / guide / modals
    'Demo mode: no fal.ai key yet.': 'Mod demo: belum ada kunci fal.ai.', 'fal.ai API key': 'Kunci API fal.ai', 'Get it at': 'Dapatkan di', '. Stored only on this computer.': '. Disimpan di komputer ini sahaja.',
    'Script AI model': 'Model AI skrip', 'Local mode: a budget tracker. 1 credit ≈ US$0.01 of fal.ai usage.': 'Mod tempatan: penjejak bajet. 1 kredit ≈ US$0.01 penggunaan fal.ai.', 'Activity': 'Aktiviti', 'paste key': 'tampal kunci',
    'Your first ad in 4 steps': 'Iklan pertama anda dalam 4 langkah', 'Add your friend': 'Tambah rakan anda', 'Upload 1–3 clear photos of the face that stars in your videos. It stays the same in every shot.': 'Muat naik 1–3 gambar jelas wajah yang membintangi video anda. Ia kekal sama dalam setiap babak.',
    'Done': 'Siap', 'Add a product': 'Tambah produk', 'A photo of what you promote, plus its price and selling points.': 'Gambar apa yang anda promosikan, berserta harga dan kelebihannya.',
    'Kravitas studies your photos and prompt, then suggests hooks, angles and ready-made ideas.': 'Kravitas meneliti gambar dan prompt anda, kemudian mencadangkan hook, sudut dan idea sedia guna.',
    'Brainstorm': 'Sumbang saran', 'Generate & post': 'Jana & siar', 'Pick an idea or preset, hit Generate, then download your video with captions.': 'Pilih idea atau templat, tekan Jana, kemudian muat turun video anda dengan sari kata.',
    'Getting started': 'Mula di sini', 'Photo': 'Gambar', 'Product photo': 'Gambar produk', 'Remove background (1 cr)': 'Buang latar belakang (1 kr)', 'Name': 'Nama', 'Price': 'Harga',
    'Selling points': 'Kelebihan produk', 'Save product': 'Simpan produk', 'Brightens in 7 days, halal, free shipping': 'Cerah dalam 7 hari, halal, penghantaran percuma',
    '1–3 clear photos of the same face. They stay consistent in everything you make.': '1–3 gambar jelas wajah yang sama. Ia kekal konsisten dalam semua yang anda buat.', 'Photos': 'Gambar', 'Choose photos': 'Pilih gambar',
    'These are photos of me, or I have this person\'s permission to use their face. No minors.': 'Ini gambar saya, atau saya ada kebenaran orang ini untuk guna wajahnya. Tiada kanak-kanak bawah umur.', 'Save friend': 'Simpan rakan',
    'Refund (unused estimate)': 'Bayaran balik (anggaran tak diguna)', 'Storyboard keyframe': 'Gambar sebenar papan cerita', 'Storyboard (plan + sketches)': 'Papan cerita (rancangan + lakaran)',
    'Brainstorm follow-up': 'Susulan sumbang saran', 'Storyboard sketch': 'Lakaran papan cerita',
    // gallery / states
    'Type below, or tap an example to start.': 'Taip di bawah, atau tekan contoh untuk mula.', 'Your ads will appear here': 'Iklan anda akan muncul di sini', 'Your images will appear here': 'Gambar anda akan muncul di sini',
    'Your voice-overs will appear here': 'Suara latar anda akan muncul di sini', 'Failed': 'Gagal', 'Check the script': 'Semak skrip', 'Starting…': 'Bermula…', 'Audio': 'Audio',
    'your plan: Free trial': 'pelan anda: Percubaan percuma', 'ElevenLabs voices': 'Suara ElevenLabs', 'MiniMax Speech': 'MiniMax Speech',
    'Auto-posting switches on when POSTFORME_API_KEY is added on the server.': 'Siaran automatik dihidupkan bila POSTFORME_API_KEY ditambah pada pelayan.',
    'Your work will appear here': 'Hasil anda akan muncul di sini', 'Describe the scene first': 'Terangkan babak dahulu', 'Making your video. Watch it under Recent.': 'Video anda sedang dibuat. Lihat di bawah Terkini.',
  };
  var RX = [
    [/^(\d+) of (\d+) done$/, function (m) { return m[1] + ' daripada ' + m[2] + ' siap'; }],
    [/^(\d+) of (\d+)$/, function (m) { return m[1] + ' daripada ' + m[2]; }],
    [/^(\d+)\/8 files$/, function (m) { return m[1] + '/8 fail'; }],
    [/^([\d,]+) characters read$/, function (m) { return m[1] + ' aksara dibaca'; }],
    [/^Reading (\d+) files?…$/, function (m) { return 'Membaca ' + m[1] + ' fail…'; }],
    [/^Save all (\d+)$/, function (m) { return 'Simpan semua ' + m[1]; }],
    [/^Scene (\d+)$/, function (m) { return 'Babak ' + m[1]; }],
    [/^Panel (\d+)$/, function (m) { return 'Panel ' + m[1]; }],
    [/^What happens in panel (\d+)$/, function (m) { return 'Apa yang berlaku dalam panel ' + m[1]; }],
    [/^Line spoken in panel (\d+)$/, function (m) { return 'Ayat yang disebut dalam panel ' + m[1]; }],
    [/^from (Basic|Starter|Creator|Pro)$/, function (m) { return 'dari ' + m[1]; }],
    [/^your plan: (.+)$/, function (m) { return 'pelan anda: ' + m[1]; }],
    [/^Runs on fal\.ai$/, function () { return 'Dijalankan di fal.ai'; }],
    [/^PREVIEW$/, function () { return 'PRATONTON'; }],
    [/^LAST (AD|IMAGE)$/, function (m) { return m[1] === 'AD' ? 'IKLAN TERAKHIR' : 'GAMBAR TERAKHIR'; }],
    [/^TAP TO OPEN$/, function () { return 'TEKAN UNTUK BUKA'; }],
    [/^(Quick|Standard|Sharper|Lip-sync|Best) quality\. (.*)$/, function (m) { return 'Kualiti ' + (D[m[1]] || m[1]) + '. ' + (tr(m[2]) || m[2]); }],
    [/^(\d+) of (\d+) panels are real keyframes\. Panels left as sketches are painted as real images when you make the video, so you only pay for them once\.$/, function (m) { return m[1] + ' daripada ' + m[2] + ' panel sudah jadi gambar sebenar. Panel yang kekal lakaran akan dilukis sebagai gambar sebenar bila video dibuat, jadi anda bayar sekali sahaja.'; }],
    [/^Credits$/, function () { return 'Kredit'; }],
  ];
  function tr(s) {
    if (D[s] != null) return D[s];
    for (var i = 0; i < RX.length; i++) { var m = s.match(RX[i][0]); if (m) return RX[i][1](m); }
    // "🛒 Honest review", "＋ Product", "Bahasa Melayu ▾", "✓ Captions": translate the words, keep the symbols
    var m2 = s.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9)\].!?…]*)$/);
    if (m2 && (m2[1] || m2[3]) && m2[2] && D[m2[2]] != null) return m2[1] + D[m2[2]] + m2[3];
    if (s.indexOf(' · ') > 0) {
      var hit = false, parts = s.split(' · ').map(function (p) { var t = tr(p); if (t != null) { hit = true; return t; } return p; });
      if (hit) return parts.join(' · ');
    }
    return null;
  }

  var lang = 'en';
  try { lang = localStorage.getItem('kv-ui') === 'bm' ? 'bm' : 'en'; } catch (e) {}
  var orig = new WeakMap(); // text node → { en, bm }
  var ATTRS = ['placeholder', 'title', 'aria-label'];
  var SKIP = 'SCRIPT,STYLE,TEXTAREA,CODE,[data-noi18n],.hs-card p,[contenteditable]';
  function doText(n) {
    var pe = n.parentElement; if (!pe || pe.closest(SKIP)) return;
    var rec = orig.get(n), cur = n.nodeValue;
    if (!rec || (cur !== rec.en && cur !== rec.bm)) { rec = { en: cur, bm: null }; orig.set(n, rec); }
    if (lang === 'bm') {
      if (rec.bm == null) { var core = rec.en.trim(); var t = core.length > 1 ? tr(core) : null; rec.bm = t == null ? rec.en : rec.en.replace(core, t); }
      if (cur !== rec.bm) n.nodeValue = rec.bm;
    } else if (cur !== rec.en) n.nodeValue = rec.en;
  }
  function doAttrs(el) {
    if (el.closest && el.closest('[data-noi18n]')) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i]; if (!el.hasAttribute(a)) continue;
      var key = 'i18n' + a.replace('-', ''), cur = el.getAttribute(a);
      var en = el.dataset[key]; var bmWas = el.dataset[key + 'bm'];
      if (en == null || (cur !== en && cur !== bmWas)) { en = cur; el.dataset[key] = en; delete el.dataset[key + 'bm']; }
      if (lang === 'bm') { var t = tr(en.trim()); if (t != null && cur !== t) { el.dataset[key + 'bm'] = t; el.setAttribute(a, t); } }
      else if (cur !== en) el.setAttribute(a, en);
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1) return;
    doAttrs(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
  }
  var busy = false;
  function apply() {
    busy = true;
    document.documentElement.lang = lang === 'bm' ? 'ms' : 'en';
    walk(document.body);
    document.querySelectorAll('[data-uilang]').forEach(function (b) { b.setAttribute('data-noi18n', ''); b.innerHTML = lang === 'bm' ? '<span>EN</span> · <b>BM</b>' : '<b>EN</b> · <span>BM</span>'; });
    busy = false;
  }
  function start() {
    apply();
    new MutationObserver(function (list) {
      if (busy) return;
      busy = true;
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') doAttrs(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
      busy = false;
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-uilang]')) UILang.set(lang === 'bm' ? 'en' : 'bm');
    });
  }
  window.UILang = {
    get: function () { return lang; },
    set: function (l) { lang = l === 'bm' ? 'bm' : 'en'; try { localStorage.setItem('kv-ui', lang); } catch (e) {} apply(); },
    t: function (s) { return lang === 'bm' ? (tr(s) || s) : s; },
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
