import { useState, useEffect } from "react";

// ─── Storage ───────────────────────────────────────────────────────────────────
const store = {
  async get(key) {
    try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
  },
  async set(key, val) {
    try { await window.storage.set(key, JSON.stringify(val)); } catch {}
  }
};

const ADMIN_PASSWORD = "sonia2024";

const SEED_LESSONS = [
  {
    id: 1, title: "حروف تہجی — الف سے یاء", order: 1, category: "بنیادی",
    description: "قرآنی عربی کے حروف پہچاننا سیکھیں",
    content: "عربی میں 28 حروف ہیں۔ ہر حرف کی اپنی آواز ہے۔\n\nا — الف\nب — با\nت — تا\nث — ثا\nج — جیم\nح — حا\nخ — خا",
    videoUrl: "", imageUrl: "", pdfUrl: "",
    quiz: [
      { q: "عربی میں کتنے حروف ہیں؟", options: ["26", "28", "30", "24"], ans: 1 },
      { q: "کون سا حرف 'ب' کی آواز دیتا ہے؟", options: ["ا", "ت", "ب", "ث"], ans: 2 },
      { q: "الف کون سا حرف ہے؟", options: ["پہلا", "آخری", "درمیانی", "کوئی نہیں"], ans: 0 }
    ]
  },
  {
    id: 2, title: "سورہ فاتحہ — آیت آیت", order: 2, category: "قرآن",
    description: "سورہ فاتحہ کے الفاظ کا مطلب سمجھیں",
    content: "بِسْمِ اللَّهِ = اللہ کے نام سے\nالرَّحْمَٰنِ = بہت مہربان\nالرَّحِيمِ = نہایت رحم والے\nاَلْحَمْدُ لِلَّهِ = تمام تعریف اللہ کے لیے\nرَبِّ الْعَالَمِينَ = تمام جہانوں کے پروردگار",
    videoUrl: "", imageUrl: "", pdfUrl: "",
    quiz: [
      { q: "بِسْمِ اللَّهِ کا مطلب کیا ہے؟", options: ["اللہ کے نام سے", "اللہ بڑا ہے", "اللہ ایک ہے", "اللہ کی تعریف"], ans: 0 },
      { q: "الرَّحْمَٰنِ کا مطلب؟", options: ["رحم والے", "بہت مہربان", "مالک", "خالق"], ans: 1 },
      { q: "الْحَمْدُ لِلَّهِ کا مطلب؟", options: ["اللہ کے نام سے", "اللہ کی مدد سے", "تمام تعریف اللہ کے لیے", "اللہ ہی مالک ہے"], ans: 2 }
    ]
  },
  {
    id: 3, title: "عام قرآنی الفاظ", order: 3, category: "الفاظ",
    description: "قرآن میں بار بار آنے والے الفاظ",
    content: "رَبّ = پروردگار\nعَالَم = دنیا / جہان\nكِتَاب = کتاب\nعِلْم = علم / جاننا\nنُور = روشنی\nهُدَى = ہدایت\nصِرَاط = راستہ\nاِيمَان = ایمان",
    videoUrl: "", imageUrl: "", pdfUrl: "",
    quiz: [
      { q: "رَبّ کا مطلب؟", options: ["کتاب", "پروردگار", "روشنی", "راستہ"], ans: 1 },
      { q: "نُور کا مطلب؟", options: ["ہدایت", "علم", "روشنی", "دنیا"], ans: 2 },
      { q: "هُدَى کا مطلب؟", options: ["راستہ", "کتاب", "ہدایت", "علم"], ans: 2 }
    ]
  }
];

const CATEGORIES = ["بنیادی", "قرآن", "الفاظ", "جملے", "تلاوت"];

// ─── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #1a1209; --gold: #c8973a; --gold-light: #f0d9a0; --gold-pale: #fdf6e3;
    --teal: #2a6b5e; --teal-light: #e6f4f1; --teal-mid: #3d8f7d; --teal-dark: #1d4a41;
    --cream: #faf7f0; --border: #e8d8b0; --muted: #8a7550;
    --danger: #c0392b; --success: #27ae60; --r: 12px;
    --shadow: 0 4px 20px rgba(26,18,9,0.12);
  }
  body { font-family:'Noto Nastaliq Urdu',serif; background:var(--cream); color:var(--ink); direction:rtl; }
  .app { min-height:100vh; display:flex; flex-direction:column; }

  /* ── NAV ── */
  .nav { background:var(--teal-dark); padding:0 20px; display:flex; align-items:center; justify-content:space-between; height:68px; position:sticky; top:0; z-index:200; box-shadow:0 3px 16px rgba(0,0,0,.3); }
  .nav-brand { display:flex; align-items:center; gap:12px; cursor:pointer; }
  .nav-logo-circle { width:44px; height:44px; background:var(--gold); border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Amiri',serif; font-size:22px; color:var(--teal-dark); font-weight:700; flex-shrink:0; }
  .nav-name { line-height:1.25; }
  .nav-name-main { font-size:15px; font-weight:700; color:white; }
  .nav-name-sub { font-size:11px; color:var(--gold-light); }
  .nav-tabs { display:flex; gap:4px; }
  .nav-tab { background:none; border:none; color:rgba(255,255,255,.7); padding:8px 14px; border-radius:8px; cursor:pointer; font-family:inherit; font-size:13px; transition:all .2s; white-space:nowrap; }
  .nav-tab:hover { background:rgba(255,255,255,.12); color:white; }
  .nav-tab.active { background:var(--gold); color:var(--ink); font-weight:700; }
  .nav-tab.admin-tab { border:1px solid rgba(200,151,58,.4); }
  .nav-tab.admin-tab.active { background:#c0392b; color:white; }
  .nav-right { display:flex; align-items:center; gap:10px; }
  .nav-user { font-size:13px; color:var(--gold-light); display:flex; align-items:center; gap:6px; }
  .nav-dot { width:8px; height:8px; background:#4caf50; border-radius:50%; }

  /* ── HERO ── */
  .hero { background:linear-gradient(145deg,var(--teal) 0%,var(--teal-dark) 100%); color:white; text-align:center; padding:56px 24px 48px; position:relative; overflow:hidden; }
  .hero::before { content:'﷽'; position:absolute; font-family:'Amiri',serif; font-size:220px; opacity:.035; top:-30px; left:50%; transform:translateX(-50%); pointer-events:none; white-space:nowrap; }
  .hero-badge { display:inline-block; background:rgba(200,151,58,.25); border:1px solid var(--gold); color:var(--gold-light); padding:5px 18px; border-radius:20px; font-size:12px; margin-bottom:14px; }
  .hero-arabic { font-family:'Amiri',serif; font-size:38px; color:var(--gold); margin-bottom:10px; line-height:1.5; }
  .hero-title { font-size:22px; font-weight:700; margin-bottom:6px; }
  .hero-title span { color:var(--gold); }
  .hero-sub { font-size:14px; color:rgba(255,255,255,.8); max-width:480px; margin:0 auto 28px; line-height:2.2; }
  .hero-stats { display:flex; justify-content:center; gap:36px; flex-wrap:wrap; }
  .stat { text-align:center; }
  .stat-num { font-family:'Amiri',serif; font-size:36px; font-weight:700; color:var(--gold); line-height:1; }
  .stat-label { font-size:11px; color:rgba(255,255,255,.65); margin-top:2px; }

  /* ── MAIN ── */
  .main { flex:1; max-width:1200px; margin:0 auto; width:100%; padding:28px 20px; }
  .section-title { font-size:19px; font-weight:700; color:var(--teal); display:flex; align-items:center; gap:8px; }

  /* ── FILTER ── */
  .lessons-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:12px; }
  .filter-tabs { display:flex; gap:6px; flex-wrap:wrap; }
  .filter-tab { border:1.5px solid var(--border); background:white; color:var(--muted); padding:5px 14px; border-radius:20px; cursor:pointer; font-family:inherit; font-size:12px; transition:all .2s; }
  .filter-tab.active,.filter-tab:hover { border-color:var(--teal); background:var(--teal-light); color:var(--teal); font-weight:600; }

  /* ── LESSON CARDS ── */
  .lessons-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:18px; }
  .lesson-card { background:white; border-radius:var(--r); border:1.5px solid var(--border); overflow:hidden; cursor:pointer; transition:all .25s; position:relative; }
  .lesson-card:hover { transform:translateY(-4px); box-shadow:var(--shadow); border-color:var(--gold); }
  .lesson-card-top { height:6px; background:linear-gradient(90deg,var(--teal),var(--gold)); }
  .lesson-card-badge { position:absolute; top:18px; right:14px; background:var(--teal); color:white; font-size:10px; padding:3px 10px; border-radius:12px; }
  .lesson-card-body { padding:18px; }
  .lesson-num { font-family:'Amiri',serif; font-size:44px; color:var(--gold-light); line-height:1; margin-bottom:6px; }
  .lesson-card-title { font-size:15px; font-weight:700; color:var(--ink); margin-bottom:5px; line-height:1.6; }
  .lesson-card-desc { font-size:12px; color:var(--muted); line-height:1.9; }
  .lesson-card-footer { padding:10px 18px; background:var(--gold-pale); border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; gap:10px; }
  .progress-bar { height:5px; background:var(--border); border-radius:3px; flex:1; overflow:hidden; }
  .progress-fill { height:100%; background:linear-gradient(90deg,var(--teal),var(--teal-mid)); border-radius:3px; transition:width .5s; }
  .score-text { font-size:11px; color:var(--teal); font-weight:700; white-space:nowrap; }

  /* ── LESSON DETAIL ── */
  .lesson-detail { background:white; border-radius:var(--r); border:1.5px solid var(--border); overflow:hidden; }
  .lesson-detail-header { background:linear-gradient(135deg,var(--teal),var(--teal-mid)); color:white; padding:28px 32px; }
  .back-btn { background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.3); color:white; padding:7px 16px; border-radius:8px; cursor:pointer; font-family:inherit; font-size:13px; margin-bottom:14px; display:inline-flex; align-items:center; gap:6px; transition:background .2s; }
  .back-btn:hover { background:rgba(255,255,255,.28); }
  .lesson-detail-title { font-size:22px; font-weight:700; margin-bottom:6px; }
  .lesson-detail-desc { font-size:14px; opacity:.85; line-height:2.2; }
  .lesson-detail-body { padding:28px 32px; }
  .media-section { margin-bottom:24px; }
  .media-label { font-size:12px; font-weight:700; color:var(--muted); margin-bottom:8px; text-transform:uppercase; letter-spacing:.03em; display:flex; align-items:center; gap:6px; }
  .content-box { background:var(--cream); border:1.5px solid var(--border); border-radius:10px; padding:22px 26px; font-size:18px; line-height:3; direction:rtl; white-space:pre-wrap; font-family:'Amiri',serif; color:var(--ink); }
  .video-wrap { border-radius:10px; overflow:hidden; background:#111; }
  .video-wrap iframe { display:block; width:100%; height:260px; border:none; }
  .video-placeholder { background:#111; border-radius:10px; height:180px; display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:13px; border:1.5px dashed var(--border); flex-direction:column; gap:8px; }
  .pdf-btn { display:inline-flex; align-items:center; gap:8px; background:var(--teal-light); color:var(--teal); padding:10px 20px; border-radius:8px; font-size:14px; font-weight:600; text-decoration:none; border:1.5px solid var(--teal); cursor:pointer; transition:all .2s; }
  .pdf-btn:hover { background:var(--teal); color:white; }
  .img-wrap img { width:100%; border-radius:10px; border:1.5px solid var(--border); max-height:300px; object-fit:cover; }

  /* ── QUIZ ── */
  .quiz-section { background:var(--gold-pale); border:1.5px solid #e8d080; border-radius:var(--r); padding:26px; margin-top:4px; }
  .quiz-title { font-size:17px; font-weight:700; color:var(--teal); margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .quiz-progress-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .quiz-prog-text { font-size:13px; color:var(--muted); }
  .quiz-prog-bar { height:4px; background:var(--border); border-radius:2px; flex:1; margin-right:12px; overflow:hidden; }
  .quiz-prog-fill { height:100%; background:var(--teal); border-radius:2px; transition:width .3s; }
  .quiz-q { font-size:16px; font-weight:600; margin-bottom:16px; line-height:2.2; color:var(--ink); }
  .quiz-options { display:grid; gap:9px; }
  .quiz-opt { background:white; border:1.5px solid var(--border); border-radius:10px; padding:13px 16px; cursor:pointer; font-family:inherit; font-size:14px; text-align:right; transition:all .2s; color:var(--ink); line-height:1.8; }
  .quiz-opt:hover:not(:disabled) { border-color:var(--teal); background:var(--teal-light); }
  .quiz-opt.correct { border-color:var(--success)!important; background:#e8f8ee!important; color:var(--success)!important; font-weight:700; }
  .quiz-opt.wrong { border-color:var(--danger)!important; background:#fde8e8!important; color:var(--danger)!important; }
  .quiz-opt:disabled { cursor:default; }
  .quiz-feedback { margin-top:14px; padding:12px 16px; border-radius:8px; font-size:14px; font-weight:600; text-align:center; }
  .quiz-feedback.correct { background:#e8f8ee; color:var(--success); }
  .quiz-feedback.wrong { background:#fde8e8; color:var(--danger); }
  .quiz-next-btn { margin-top:14px; background:var(--teal); color:white; border:none; padding:13px 28px; border-radius:10px; cursor:pointer; font-family:inherit; font-size:14px; font-weight:700; width:100%; transition:background .2s; }
  .quiz-next-btn:hover { background:var(--teal-dark); }
  .quiz-start-box { text-align:center; }
  .quiz-start-info { font-size:13px; color:var(--muted); margin-bottom:16px; line-height:2; }
  .quiz-start-btn { background:var(--teal); color:white; border:none; padding:14px 36px; border-radius:12px; cursor:pointer; font-family:inherit; font-size:15px; font-weight:700; transition:background .2s; }
  .quiz-start-btn:hover { background:var(--teal-dark); }
  .quiz-result { text-align:center; padding:24px 0; }
  .quiz-result-circle { width:120px; height:120px; border-radius:50%; background:linear-gradient(135deg,var(--teal),var(--teal-mid)); margin:0 auto 16px; display:flex; align-items:center; justify-content:center; flex-direction:column; box-shadow:0 4px 20px rgba(42,107,94,.4); }
  .quiz-result-pct { font-family:'Amiri',serif; font-size:40px; color:white; font-weight:700; line-height:1; }
  .quiz-result-label { font-size:12px; color:rgba(255,255,255,.8); }
  .quiz-result-msg { font-size:18px; font-weight:700; margin-bottom:4px; }
  .quiz-result-sub { font-size:14px; color:var(--muted); line-height:2; }
  .quiz-retry-btn { margin-top:16px; background:white; color:var(--teal); border:2px solid var(--teal); padding:11px 28px; border-radius:10px; cursor:pointer; font-family:inherit; font-size:14px; font-weight:700; transition:all .2s; }
  .quiz-retry-btn:hover { background:var(--teal); color:white; }

  /* ── AI TUTOR ── */
  .tutor-section { background:var(--teal-light); border:1.5px solid var(--teal-mid); border-radius:var(--r); padding:24px; margin-top:20px; }
  .tutor-header-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px; }
  .tutor-progress { font-size:12px; background:white; border:1px solid var(--teal); color:var(--teal); padding:4px 12px; border-radius:20px; font-weight:700; white-space:nowrap; }
  .tutor-intro-text { font-size:13.5px; color:var(--muted); line-height:2.1; margin-bottom:16px; }
  .tutor-btn-row { display:flex; gap:10px; flex-wrap:wrap; }
  .tutor-secondary-btn { background:white; color:var(--teal); border:1.5px solid var(--teal); padding:14px 24px; border-radius:12px; cursor:pointer; font-family:inherit; font-size:14px; font-weight:700; transition:all .2s; }
  .tutor-secondary-btn:hover { background:var(--teal); color:white; }
  .tutor-chat-box { max-height:360px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding:4px 2px 8px; margin-bottom:12px; }
  .tutor-msg { max-width:85%; padding:11px 15px; border-radius:14px; font-size:14.5px; line-height:1.95; white-space:pre-wrap; }
  .tutor-msg.ai { align-self:flex-start; background:white; border:1px solid var(--border); color:var(--ink); }
  .tutor-msg.user { align-self:flex-end; background:var(--teal); color:white; font-weight:600; }
  .tutor-typing { align-self:flex-start; display:flex; gap:5px; padding:12px 16px; background:white; border-radius:14px; border:1px solid var(--border); width:fit-content; }
  .tutor-typing span { width:6px; height:6px; border-radius:50%; background:var(--teal); animation:tutorBounce 1.2s infinite ease-in-out; display:inline-block; }
  .tutor-typing span:nth-child(2){ animation-delay:.15s; }
  .tutor-typing span:nth-child(3){ animation-delay:.3s; }
  @keyframes tutorBounce { 0%,60%,100%{ transform:translateY(0); opacity:.5; } 30%{ transform:translateY(-4px); opacity:1; } }
  .tutor-input-row { display:flex; gap:8px; }
  .tutor-input-row input { flex:1; }
  .tutor-send-btn { background:var(--teal); color:white; border:none; padding:0 22px; border-radius:10px; cursor:pointer; font-family:inherit; font-size:14px; font-weight:700; transition:background .2s; }
  .tutor-send-btn:hover { background:var(--teal-dark); }
  .tutor-send-btn:disabled { opacity:.5; cursor:not-allowed; }
  .tutor-done-row { display:flex; gap:8px; flex-wrap:wrap; }
  .tutor-close-btn { background:none; border:1.5px solid var(--border); color:var(--muted); padding:11px 18px; border-radius:10px; cursor:pointer; font-family:inherit; font-size:13px; }

  /* ── REGISTER ── */
  .register-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(145deg,var(--teal) 0%,var(--teal-dark) 100%); padding:20px; }
  .register-card { background:white; border-radius:20px; padding:44px 36px; width:100%; max-width:440px; text-align:center; box-shadow:0 24px 64px rgba(0,0,0,.35); }
  .register-logo { width:80px; height:80px; background:linear-gradient(135deg,var(--teal),var(--teal-mid)); border-radius:50%; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-family:'Amiri',serif; font-size:36px; color:var(--gold); }
  .register-brand { font-size:13px; font-weight:700; color:var(--teal); letter-spacing:.03em; margin-bottom:4px; }
  .register-title { font-size:20px; font-weight:700; color:var(--ink); margin-bottom:6px; }
  .register-sub { font-size:13px; color:var(--muted); margin-bottom:28px; line-height:2.2; }
  .input { width:100%; border:1.5px solid var(--border); border-radius:10px; padding:13px 16px; font-family:inherit; font-size:15px; direction:rtl; text-align:right; background:var(--cream); color:var(--ink); outline:none; transition:border-color .2s; margin-bottom:12px; }
  .input:focus { border-color:var(--teal); background:white; }
  .btn-primary { width:100%; background:linear-gradient(135deg,var(--teal),var(--teal-mid)); color:white; border:none; padding:15px; border-radius:12px; font-family:inherit; font-size:15px; font-weight:700; cursor:pointer; transition:opacity .2s; }
  .btn-primary:hover { opacity:.9; }

  /* ── DASHBOARD ── */
  .dash-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:14px; margin-bottom:28px; }
  .dash-card { background:white; border:1.5px solid var(--border); border-radius:var(--r); padding:22px; text-align:center; }
  .dash-icon { font-size:32px; margin-bottom:8px; }
  .dash-num { font-family:'Amiri',serif; font-size:42px; color:var(--teal); font-weight:700; line-height:1; }
  .dash-label { font-size:12px; color:var(--muted); margin-top:4px; }
  .progress-list { display:flex; flex-direction:column; gap:10px; }
  .progress-item { background:white; border:1.5px solid var(--border); border-radius:10px; padding:14px 18px; display:flex; align-items:center; gap:14px; }
  .progress-item-title { flex:1; font-size:14px; font-weight:600; }
  .progress-item-score { font-size:13px; font-weight:700; padding:4px 12px; border-radius:10px; }
  .score-high { background:#e8f8ee; color:var(--success); }
  .score-mid { background:#fff3cd; color:#856404; }
  .score-low { background:#fde8e8; color:var(--danger); }

  /* ── ADMIN ── */
  .admin-wrap { display:grid; grid-template-columns:260px 1fr; gap:0; min-height:calc(100vh - 68px); }
  .admin-sidebar { background:var(--ink); color:white; padding:0; display:flex; flex-direction:column; }
  .admin-sidebar-header { padding:24px 20px; border-bottom:1px solid rgba(255,255,255,.1); }
  .admin-sidebar-title { font-size:14px; font-weight:700; color:var(--gold); margin-bottom:4px; }
  .admin-sidebar-sub { font-size:11px; color:rgba(255,255,255,.5); }
  .admin-nav { padding:12px 0; flex:1; }
  .admin-nav-item { display:flex; align-items:center; gap:10px; padding:12px 20px; cursor:pointer; font-size:14px; color:rgba(255,255,255,.75); transition:all .2s; border-right:3px solid transparent; }
  .admin-nav-item:hover { background:rgba(255,255,255,.07); color:white; }
  .admin-nav-item.active { background:rgba(200,151,58,.15); color:var(--gold); border-right-color:var(--gold); font-weight:600; }
  .admin-nav-icon { font-size:18px; width:24px; text-align:center; }
  .admin-content { background:var(--cream); padding:28px 32px; overflow-y:auto; }
  .admin-content-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; flex-wrap:wrap; gap:12px; }
  .admin-content-title { font-size:18px; font-weight:700; color:var(--ink); }
  .btn-add { background:var(--teal); color:white; border:none; padding:10px 22px; border-radius:10px; cursor:pointer; font-family:inherit; font-size:14px; font-weight:700; display:flex; align-items:center; gap:6px; transition:background .2s; }
  .btn-add:hover { background:var(--teal-dark); }

  /* Lesson list in admin */
  .admin-lesson-list { display:flex; flex-direction:column; gap:10px; }
  .admin-lesson-row { background:white; border:1.5px solid var(--border); border-radius:10px; padding:14px 18px; display:flex; align-items:center; gap:14px; transition:border-color .2s; }
  .admin-lesson-row:hover { border-color:var(--teal); }
  .admin-lesson-num { font-family:'Amiri',serif; font-size:32px; color:var(--gold); width:36px; text-align:center; flex-shrink:0; }
  .admin-lesson-info { flex:1; min-width:0; }
  .admin-lesson-title { font-size:14px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .admin-lesson-meta { font-size:11px; color:var(--muted); margin-top:2px; }
  .admin-lesson-btns { display:flex; gap:8px; flex-shrink:0; }
  .btn-edit { background:var(--teal-light); color:var(--teal); border:1px solid var(--teal); padding:6px 14px; border-radius:8px; cursor:pointer; font-family:inherit; font-size:12px; font-weight:600; transition:all .2s; }
  .btn-edit:hover { background:var(--teal); color:white; }
  .btn-del { background:#fde8e8; color:var(--danger); border:1px solid var(--danger); padding:6px 14px; border-radius:8px; cursor:pointer; font-family:inherit; font-size:12px; font-weight:600; transition:all .2s; }
  .btn-del:hover { background:var(--danger); color:white; }

  /* Lesson Form */
  .lesson-form { background:white; border:1.5px solid var(--border); border-radius:var(--r); padding:26px; }
  .form-title { font-size:17px; font-weight:700; color:var(--teal); margin-bottom:20px; padding-bottom:12px; border-bottom:1.5px solid var(--border); }
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .fg { display:flex; flex-direction:column; gap:5px; }
  .fg.full { grid-column:1/-1; }
  .form-label { font-size:12px; font-weight:700; color:var(--ink); }
  .form-input { border:1.5px solid var(--border); border-radius:8px; padding:10px 13px; font-family:inherit; font-size:14px; direction:rtl; background:var(--cream); color:var(--ink); outline:none; transition:border-color .2s; width:100%; }
  .form-input:focus { border-color:var(--teal); background:white; }
  .form-textarea { min-height:110px; resize:vertical; }
  .form-actions { display:flex; gap:10px; margin-top:20px; justify-content:flex-end; }
  .btn-save { background:var(--teal); color:white; border:none; padding:11px 28px; border-radius:10px; cursor:pointer; font-family:inherit; font-size:14px; font-weight:700; transition:background .2s; }
  .btn-save:hover { background:var(--teal-dark); }
  .btn-cancel { background:white; color:var(--muted); border:1.5px solid var(--border); padding:11px 20px; border-radius:10px; cursor:pointer; font-family:inherit; font-size:14px; transition:all .2s; }
  .btn-cancel:hover { border-color:var(--muted); }

  /* Quiz builder */
  .quiz-builder { margin-top:22px; padding-top:18px; border-top:1.5px solid var(--border); }
  .quiz-builder-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
  .quiz-builder-title { font-size:14px; font-weight:700; color:var(--ink); }
  .quiz-q-card { background:var(--cream); border:1.5px solid var(--border); border-radius:10px; padding:16px; margin-bottom:10px; }
  .quiz-q-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
  .quiz-q-label { font-size:13px; font-weight:700; color:var(--teal); }
  .opt-row { display:flex; gap:8px; align-items:center; margin-bottom:7px; }
  .opt-radio { width:16px; height:16px; accent-color:var(--teal); cursor:pointer; flex-shrink:0; }
  .opt-hint { font-size:11px; color:var(--muted); margin-top:4px; }

  /* Students table */
  .students-table { width:100%; border-collapse:collapse; background:white; border-radius:var(--r); overflow:hidden; border:1.5px solid var(--border); }
  .students-table th { background:var(--teal); color:white; padding:12px 16px; font-size:13px; text-align:right; font-weight:600; }
  .students-table td { padding:12px 16px; font-size:13px; border-bottom:1px solid var(--border); text-align:right; }
  .students-table tr:last-child td { border-bottom:none; }
  .students-table tr:nth-child(even) td { background:var(--cream); }
  .score-pill { display:inline-block; padding:3px 12px; border-radius:12px; font-size:11px; font-weight:700; }

  /* Admin login */
  .admin-login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--ink); padding:20px; }
  .admin-login-card { background:#2a2010; border:1.5px solid rgba(200,151,58,.3); border-radius:16px; padding:40px 32px; width:100%; max-width:380px; text-align:center; }
  .admin-login-icon { font-size:48px; margin-bottom:12px; }
  .admin-login-title { font-size:18px; font-weight:700; color:var(--gold); margin-bottom:4px; }
  .admin-login-sub { font-size:12px; color:rgba(255,255,255,.5); margin-bottom:24px; }
  .admin-input { width:100%; background:#1a1209; border:1.5px solid rgba(200,151,58,.3); border-radius:8px; padding:12px 14px; font-family:inherit; font-size:14px; color:white; outline:none; margin-bottom:12px; direction:ltr; text-align:left; transition:border-color .2s; }
  .admin-input:focus { border-color:var(--gold); }
  .admin-login-btn { width:100%; background:var(--gold); color:var(--ink); border:none; padding:13px; border-radius:10px; font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; transition:opacity .2s; }
  .admin-login-btn:hover { opacity:.9; }
  .admin-err { color:#e74c3c; font-size:12px; margin-bottom:10px; }

  /* Toast */
  .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--ink); color:white; padding:12px 24px; border-radius:10px; font-size:14px; z-index:9999; box-shadow:0 4px 24px rgba(0,0,0,.4); animation:fadeUp .3s ease; white-space:nowrap; }
  @keyframes fadeUp { from{opacity:0;transform:translate(-50%,14px)} to{opacity:1;transform:translate(-50%,0)} }

  .empty-state { text-align:center; padding:56px 20px; color:var(--muted); }
  .empty-state-icon { font-size:52px; margin-bottom:12px; }
  .empty-state h3 { font-size:17px; font-weight:600; margin-bottom:6px; color:var(--ink); }

  @media(max-width:768px) {
    .admin-wrap { grid-template-columns:1fr; }
    .admin-sidebar { display:none; }
    .nav-tabs .nav-tab:not(.admin-tab) { display:none; }
    .form-grid { grid-template-columns:1fr; }
    .hero-stats { gap:20px; }
    .main { padding:18px 14px; }
    .lesson-detail-body { padding:20px 18px; }
  }
`;

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("loading");
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [scores, setScores] = useState({});
  const [allStudents, setAllStudents] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [filterCat, setFilterCat] = useState("سب");
  const [toast, setToast] = useState("");
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminSection, setAdminSection] = useState("lessons");
  const [editingLesson, setEditingLesson] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(false);

  useEffect(() => {
    async function init() {
      let saved = await store.get("lessons_v2");
      if (!saved || saved.length === 0) {
        saved = SEED_LESSONS;
        await store.set("lessons_v2", saved);
      }
      setLessons(saved);
      const studs = await store.get("students_v2") || [];
      setAllStudents(studs);
      setPage("register");
    }
    init();
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function handleRegister(name) {
    if (!name.trim()) return;
    const s = { name: name.trim(), joinedAt: new Date().toLocaleDateString("ur-PK") };
    setStudent(s);
    const sc = await store.get("sc_" + s.name) || {};
    setScores(sc);
    const existing = allStudents.find(x => x.name === s.name);
    if (!existing) {
      const upd = [...allStudents, s];
      setAllStudents(upd);
      await store.set("students_v2", upd);
    }
    setPage("home");
  }

  async function saveScore(lessonId, score, total) {
    const pct = Math.round((score / total) * 100);
    const upd = { ...scores, [lessonId]: { score, total, pct, date: new Date().toLocaleDateString("ur-PK") } };
    setScores(upd);
    await store.set("sc_" + student.name, upd);
    showToast(`نتیجہ محفوظ! آپ نے ${pct}% حاصل کیا ✓`);
  }

  async function handleSaveLesson(lesson) {
    let upd;
    if (lesson.id) {
      upd = lessons.map(l => l.id === lesson.id ? lesson : l);
    } else {
      upd = [...lessons, { ...lesson, id: Date.now() }].sort((a, b) => a.order - b.order);
    }
    setLessons(upd);
    await store.set("lessons_v2", upd);
    setShowLessonForm(false);
    setEditingLesson(null);
    showToast("سبق محفوظ ہو گیا ✓");
  }

  async function handleDeleteLesson(id) {
    if (!window.confirm("کیا آپ یہ سبق حذف کرنا چاہتے ہیں؟")) return;
    const upd = lessons.filter(l => l.id !== id);
    setLessons(upd);
    await store.set("lessons_v2", upd);
    showToast("سبق حذف کر دیا گیا");
  }

  const filtered = filterCat === "سب" ? lessons : lessons.filter(l => l.category === filterCat);
  const completedCount = Object.keys(scores).length;
  const avgScore = completedCount > 0
    ? Math.round(Object.values(scores).reduce((a, b) => a + b.pct, 0) / completedCount) : 0;

  if (page === "loading") return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#1d4a41" }}>
      <div style={{ fontFamily:"Amiri,serif", fontSize:60, color:"#c8973a" }}>﷽</div>
    </div>
  );

  if (page === "register") return (
    <>
      <style>{css}</style>
      <RegisterScreen onRegister={handleRegister} onAdmin={() => setPage("admin")} />
      {toast && <div className="toast">{toast}</div>}
    </>
  );

  if (page === "admin") return (
    <>
      <style>{css}</style>
      {!adminLoggedIn
        ? <AdminLogin onLogin={(ok) => { if(ok){ setAdminLoggedIn(true); } else { showToast("❌ غلط پاسورڈ"); } }} />
        : <AdminPanel
            lessons={lessons}
            allStudents={allStudents}
            scores={scores}
            section={adminSection}
            setSection={setAdminSection}
            editingLesson={editingLesson}
            showLessonForm={showLessonForm}
            onAdd={() => { setEditingLesson(null); setShowLessonForm(true); }}
            onEdit={(l) => { setEditingLesson(l); setShowLessonForm(true); }}
            onDelete={handleDeleteLesson}
            onSave={handleSaveLesson}
            onCancelForm={() => { setShowLessonForm(false); setEditingLesson(null); }}
            onExit={() => { setAdminLoggedIn(false); setPage("register"); }}
          />
      }
      {toast && <div className="toast">{toast}</div>}
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand" onClick={() => setPage("home")}>
            <div className="nav-logo-circle">ص</div>
            <div className="nav-name">
              <div className="nav-name-main">Learn with Sonia Mughal</div>
              <div className="nav-name-sub">قرآنی عربی کورس</div>
            </div>
          </div>

          <div className="nav-tabs">
            {[["home","📚 اسباق"],["dashboard","📊 پیشرفت"]].map(([v,l]) => (
              <button key={v} className={`nav-tab${page===v?" active":""}`} onClick={() => setPage(v)}>{l}</button>
            ))}
            <button className={`nav-tab admin-tab${page==="admin"?" active":""}`} onClick={() => setPage("admin")}>⚙️ ایڈمن</button>
          </div>

          <div className="nav-right">
            <div className="nav-user"><div className="nav-dot" />{student?.name}</div>
          </div>
        </nav>

        {/* HOME */}
        {page === "home" && (
          <>
            <div className="hero">
              <div className="hero-badge">Learn with Sonia Mughal</div>
              <div className="hero-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
              <div className="hero-title">قرآنی عربی سیکھیں — <span>آسان اور سہل طریقے سے</span></div>
              <div className="hero-sub">گرامر کی پیچیدگیوں کے بغیر، قرآن کے الفاظ اور معانی سمجھیں</div>
              <div className="hero-stats">
                <div className="stat"><div className="stat-num">{lessons.length}</div><div className="stat-label">کل اسباق</div></div>
                <div className="stat"><div className="stat-num">{completedCount}</div><div className="stat-label">مکمل اسباق</div></div>
                <div className="stat"><div className="stat-num">{avgScore}%</div><div className="stat-label">اوسط اسکور</div></div>
              </div>
            </div>
            <div className="main">
              <div className="lessons-header">
                <div className="section-title">📚 تمام اسباق</div>
                <div className="filter-tabs">
                  {["سب",...CATEGORIES].map(c => (
                    <button key={c} className={`filter-tab${filterCat===c?" active":""}`} onClick={() => setFilterCat(c)}>{c}</button>
                  ))}
                </div>
              </div>
              {filtered.length === 0
                ? <div className="empty-state"><div className="empty-state-icon">📖</div><h3>کوئی سبق نہیں ملا</h3></div>
                : <div className="lessons-grid">
                    {filtered.map(lesson => {
                      const sc = scores[lesson.id];
                      return (
                        <div key={lesson.id} className="lesson-card" onClick={() => { setActiveLesson(lesson); setPage("lesson"); }}>
                          <div className="lesson-card-top" />
                          <div className="lesson-card-badge">{lesson.category}</div>
                          <div className="lesson-card-body">
                            <div className="lesson-num">{lesson.order}</div>
                            <div className="lesson-card-title">{lesson.title}</div>
                            <div className="lesson-card-desc">{lesson.description}</div>
                          </div>
                          <div className="lesson-card-footer">
                            <div className="score-text">{sc ? `${sc.pct}% ✓` : "شروع کریں →"}</div>
                            <div className="progress-bar"><div className="progress-fill" style={{width: sc ? `${sc.pct}%` : "0%"}} /></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>
          </>
        )}

        {/* LESSON */}
        {page === "lesson" && activeLesson && (
          <div className="main">
            <LessonDetail lesson={activeLesson} score={scores[activeLesson.id]} onBack={() => setPage("home")} onScore={(s,t) => saveScore(activeLesson.id,s,t)} />
          </div>
        )}

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <div className="main">
            <div className="section-title" style={{marginBottom:20}}>📊 میری پیشرفت — {student?.name}</div>
            <div className="dash-grid">
              {[["📚",lessons.length,"کل اسباق"],["✅",completedCount,"مکمل"],["⭐",avgScore+"%","اوسط اسکور"],["🎯",lessons.length-completedCount,"باقی"]].map(([ic,n,l],i) => (
                <div key={i} className="dash-card"><div className="dash-icon">{ic}</div><div className="dash-num">{n}</div><div className="dash-label">{l}</div></div>
              ))}
            </div>
            {completedCount > 0
              ? <div className="progress-list">
                  {lessons.filter(l => scores[l.id]).map(l => {
                    const sc = scores[l.id];
                    const cls = sc.pct>=80?"score-high":sc.pct>=50?"score-mid":"score-low";
                    return (
                      <div key={l.id} className="progress-item">
                        <div className="progress-item-title">{l.title}</div>
                        <span className={`progress-item-score ${cls}`}>{sc.pct}%</span>
                        <div style={{fontSize:11,color:"var(--muted)"}}>{sc.date}</div>
                      </div>
                    );
                  })}
                </div>
              : <div className="empty-state"><div className="empty-state-icon">📝</div><h3>ابھی تک کوئی سبق مکمل نہیں</h3><p>کوئی سبق کھول کر کوئز دیں</p></div>
            }
          </div>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// ── Register ──────────────────────────────────────────────────────────────────
function RegisterScreen({ onRegister, onAdmin }) {
  const [name, setName] = useState("");
  return (
    <div className="register-wrap">
      <div className="register-card">
        <div className="register-logo">ص</div>
        <div className="register-brand">LEARN WITH SONIA MUGHAL</div>
        <div className="register-title">قرآنی عربی کورس میں خوش آمدید</div>
        <div className="register-sub">بغیر گرامر کی پیچیدگیوں کے<br />قرآنی الفاظ اور معانی آسانی سے سیکھیں</div>
        <input className="input" placeholder="اپنا نام لکھیں..." value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onRegister(name)} />
        <button className="btn-primary" onClick={()=>onRegister(name)}>سیکھنا شروع کریں ◄</button>
        <div style={{marginTop:20}}>
          <button onClick={onAdmin} style={{background:"none",border:"none",color:"var(--muted)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>⚙️ ایڈمن پینل</button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Login ───────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false);
  function check() { if(pw===ADMIN_PASSWORD){onLogin(true);}else{setErr(true);onLogin(false);} }
  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-icon">🔐</div>
        <div className="admin-login-title">ایڈمن پینل</div>
        <div className="admin-login-sub">Learn with Sonia Mughal — Admin Access</div>
        {err && <div className="admin-err">❌ غلط پاسورڈ، دوبارہ کوشش کریں</div>}
        <input className="admin-input" type="password" placeholder="Password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&check()} />
        <button className="admin-login-btn" onClick={check}>داخل ہوں →</button>
        <div style={{marginTop:16,fontSize:11,color:"rgba(255,255,255,.3)"}}>Default: sonia2024</div>
      </div>
    </div>
  );
}

// ── Admin Panel ───────────────────────────────────────────────────────────────
function AdminPanel({ lessons, allStudents, section, setSection, editingLesson, showLessonForm, onAdd, onEdit, onDelete, onSave, onCancelForm, onExit }) {
  const navItems = [
    { id:"lessons", icon:"📚", label:"اسباق کا انتظام" },
    { id:"students", icon:"👥", label:"طلبہ کی فہرست" },
    { id:"stats", icon:"📊", label:"اعداد و شمار" },
  ];
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{css}</style>
      {/* Admin Top Bar */}
      <div style={{background:"#1a1209",padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(200,151,58,.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontFamily:"Amiri,serif",fontSize:22,color:"var(--gold)"}}>⚙️</span>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"white"}}>Learn with Sonia Mughal</div>
            <div style={{fontSize:10,color:"rgba(200,151,58,.7)"}}>Admin Panel</div>
          </div>
        </div>
        <button onClick={onExit} style={{background:"none",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.7)",padding:"6px 16px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>← باہر نکلیں</button>
      </div>

      <div className="admin-wrap">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="admin-sidebar-header">
            <div className="admin-sidebar-title">ایڈمن مینو</div>
            <div className="admin-sidebar-sub">{lessons.length} اسباق • {allStudents.length} طلبہ</div>
          </div>
          <div className="admin-nav">
            {navItems.map(item => (
              <div key={item.id} className={`admin-nav-item${section===item.id?" active":""}`} onClick={()=>setSection(item.id)}>
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">

          {/* ── LESSONS SECTION ── */}
          {section === "lessons" && (
            <>
              {!showLessonForm ? (
                <>
                  <div className="admin-content-header">
                    <div className="admin-content-title">📚 اسباق کا انتظام ({lessons.length})</div>
                    <button className="btn-add" onClick={onAdd}>＋ نیا سبق شامل کریں</button>
                  </div>
                  {lessons.length === 0
                    ? <div className="empty-state"><div className="empty-state-icon">📖</div><h3>کوئی سبق نہیں</h3></div>
                    : <div className="admin-lesson-list">
                        {[...lessons].sort((a,b)=>a.order-b.order).map(l => (
                          <div key={l.id} className="admin-lesson-row">
                            <div className="admin-lesson-num">{l.order}</div>
                            <div className="admin-lesson-info">
                              <div className="admin-lesson-title">{l.title}</div>
                              <div className="admin-lesson-meta">{l.category} • {l.quiz?.length||0} سوالات {l.videoUrl?"• 🎬":""} {l.pdfUrl?"• 📄":""} {l.imageUrl?"• 🖼️":""}</div>
                            </div>
                            <div className="admin-lesson-btns">
                              <button className="btn-edit" onClick={()=>onEdit(l)}>✏️ ترمیم</button>
                              <button className="btn-del" onClick={()=>onDelete(l.id)}>🗑️ حذف</button>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </>
              ) : (
                <LessonForm lesson={editingLesson} onSave={onSave} onCancel={onCancelForm} />
              )}
            </>
          )}

          {/* ── STUDENTS SECTION ── */}
          {section === "students" && (
            <>
              <div className="admin-content-header">
                <div className="admin-content-title">👥 طلبہ کی فہرست ({allStudents.length})</div>
              </div>
              {allStudents.length === 0
                ? <div className="empty-state"><div className="empty-state-icon">👤</div><h3>کوئی طالب علم نہیں</h3></div>
                : <table className="students-table">
                    <thead><tr><th>#</th><th>نام</th><th>شمولیت کی تاریخ</th></tr></thead>
                    <tbody>
                      {allStudents.map((s,i) => (
                        <tr key={i}>
                          <td>{i+1}</td>
                          <td style={{fontWeight:600}}>{s.name}</td>
                          <td>{s.joinedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </>
          )}

          {/* ── STATS SECTION ── */}
          {section === "stats" && (
            <>
              <div className="admin-content-header">
                <div className="admin-content-title">📊 اعداد و شمار</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14}}>
                {[
                  ["📚","کل اسباق",lessons.length],
                  ["👥","کل طلبہ",allStudents.length],
                  ["🧠","کل کوئز سوالات",lessons.reduce((a,l)=>a+(l.quiz?.length||0),0)],
                  ["🎬","ویڈیو اسباق",lessons.filter(l=>l.videoUrl).length],
                  ["📄","PDF اسباق",lessons.filter(l=>l.pdfUrl).length],
                  ["🖼️","تصویری اسباق",lessons.filter(l=>l.imageUrl).length],
                ].map(([ic,lb,n],i)=>(
                  <div key={i} style={{background:"white",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:22,textAlign:"center"}}>
                    <div style={{fontSize:32,marginBottom:8}}>{ic}</div>
                    <div style={{fontFamily:"Amiri,serif",fontSize:42,color:"var(--teal)",fontWeight:700,lineHeight:1}}>{n}</div>
                    <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>{lb}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Lesson Detail ─────────────────────────────────────────────────────────────
function LessonDetail({ lesson, score, onBack, onScore }) {
  const [quizMode, setQuizMode] = useState(false);
  return (
    <div className="lesson-detail">
      <div className="lesson-detail-header">
        <button className="back-btn" onClick={onBack}>◄ واپس</button>
        <div style={{fontSize:11,opacity:.7,marginBottom:6}}>{lesson.category} • سبق {lesson.order}</div>
        <div className="lesson-detail-title">{lesson.title}</div>
        <div className="lesson-detail-desc">{lesson.description}</div>
      </div>
      <div className="lesson-detail-body">
        <div className="media-section">
          <div className="media-label">📖 سبق کا مواد</div>
          <div className="content-box">{lesson.content || "مواد جلد شامل کیا جائے گا۔"}</div>
        </div>

        {lesson.imageUrl && (
          <div className="media-section">
            <div className="media-label">🖼️ تصویر</div>
            <div className="img-wrap"><img src={lesson.imageUrl} alt={lesson.title} /></div>
          </div>
        )}

        <div className="media-section">
          <div className="media-label">🎬 ویڈیو</div>
          {lesson.videoUrl
            ? <div className="video-wrap"><iframe src={lesson.videoUrl.includes("youtu")?lesson.videoUrl.replace("watch?v=","embed/").replace("youtu.be/","youtube.com/embed/"):lesson.videoUrl} allowFullScreen /></div>
            : <div className="video-placeholder"><span>▶</span><span>ویڈیو ابھی شامل نہیں</span></div>
          }
        </div>

        {lesson.pdfUrl && (
          <div className="media-section">
            <div className="media-label">📄 PDF نوٹس</div>
            <a className="pdf-btn" href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer">📥 PDF ڈاؤن لوڈ کریں</a>
          </div>
        )}

        {lesson.quiz && lesson.quiz.length > 0 && (
          <div className="quiz-section">
            {!quizMode
              ? <div className="quiz-start-box">
                  <div className="quiz-title">🧠 اپنا علم جانچیں</div>
                  <div className="quiz-start-info">
                    {lesson.quiz.length} سوالات ہیں
                    {score && <span style={{color:"var(--success)",marginRight:8}}>• پچھلا اسکور: {score.pct}%</span>}
                  </div>
                  <button className="quiz-start-btn" onClick={()=>setQuizMode(true)}>کوئز شروع کریں ◄</button>
                </div>
              : <QuizPlayer questions={lesson.quiz} onComplete={(s,t)=>{onScore(s,t);setQuizMode(false);}} />
            }
          </div>
        )}

        <AITutor lesson={lesson} />
      </div>
    </div>
  );
}

// ── Quiz Player ───────────────────────────────────────────────────────────────
function QuizPlayer({ questions, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  function pick(i) {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[idx].ans) setCorrect(c => c+1);
  }
  function next() {
    const isCorrect = selected === questions[idx].ans;
    const newCorrect = isCorrect ? correct + 1 : correct;
    if (idx + 1 >= questions.length) {
      setFinalScore(newCorrect);
      setDone(true);
      onComplete(newCorrect, questions.length);
    } else {
      setIdx(i => i+1);
      setSelected(null);
    }
  }

  if (done) {
    const pct = Math.round((finalScore / questions.length) * 100);
    const msg = pct>=80 ? "شاباش! بہترین کارکردگی 🌟" : pct>=50 ? "اچھا کیا! مزید مشق کریں 💪" : "مایوس نہ ہوں، دوبارہ کوشش کریں 📚";
    return (
      <div className="quiz-result">
        <div className="quiz-result-circle"><div className="quiz-result-pct">{pct}%</div><div className="quiz-result-label">{finalScore}/{questions.length}</div></div>
        <div className="quiz-result-msg">{msg}</div>
        <div className="quiz-result-sub">آپ نے {finalScore} میں سے {questions.length} سوال درست کیے</div>
      </div>
    );
  }

  const q = questions[idx];
  const pctDone = Math.round(((idx) / questions.length) * 100);
  return (
    <>
      <div className="quiz-title">🧠 کوئز</div>
      <div className="quiz-progress-row">
        <div className="quiz-prog-bar"><div className="quiz-prog-fill" style={{width:`${pctDone}%`}} /></div>
        <div className="quiz-prog-text">سوال {idx+1} / {questions.length}</div>
      </div>
      <div className="quiz-q">{q.q}</div>
      <div className="quiz-options">
        {q.options.map((opt, i) => (
          <button key={i} disabled={selected!==null}
            className={`quiz-opt${selected!==null ? (i===q.ans?" correct":i===selected?" wrong":"") : ""}`}
            onClick={()=>pick(i)}>{opt}</button>
        ))}
      </div>
      {selected !== null && (
        <>
          <div className={`quiz-feedback ${selected===q.ans?"correct":"wrong"}`}>
            {selected===q.ans ? "✓ بالکل درست!" : `✗ غلط — درست جواب: ${q.options[q.ans]}`}
          </div>
          <button className="quiz-next-btn" onClick={next}>{idx+1<questions.length?"اگلا سوال ◄":"نتیجہ دیکھیں ◄"}</button>
        </>
      )}
    </>
  );
}

// ── AI Tutor ──────────────────────────────────────────────────────────────────
// Uses the lesson's own title/description/content as the knowledge base.
// Practice rounds are capped at PRACTICE_LIMIT short questions so students
// don't get overwhelmed; free chat lets a student ask about the same lesson.
function AITutor({ lesson }) {
  const PRACTICE_LIMIT = 5;
  const [mode, setMode] = useState("idle"); // idle | practice | chat | done
  const [messages, setMessages] = useState([]); // {role:'ai'|'user', text}
  const [history, setHistory] = useState([]);   // full API message history
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [practiceCount, setPracticeCount] = useState(0);

  function buildSystemPrompt(currentMode, count) {
    let base = `آپ ایک نہایت شفیق اور صابر عربی زبان کے استاد ہیں، جو اردو بولنے والے طلبہ کو قرآنی عربی سکھاتے ہیں۔

موجودہ سبق کا عنوان: "${lesson.title}"
سبق کا تعارف: ${lesson.description || ""}

سبق کا مکمل مواد (صرف اسی پر انحصار کریں):
${lesson.content || ""}

بنیادی اصول:
- صرف اسی سبق کے مواد تک محدود رہیں۔ اس سے باہر کی گرامر یا نئے موضوعات متعارف نہ کروائیں۔
- ہمیشہ اردو میں سمجھائیں، عربی الفاظ عربی رسم الخط میں مکمل اعراب کے ساتھ لکھیں۔
- ہر جواب مختصر رکھیں: زیادہ سے زیادہ 3-4 سطریں۔ ایک وقت میں صرف ایک نکتہ۔
- لہجہ نرم، حوصلہ افزا اور محبت بھرا رکھیں، طالبہ کو کبھی شرمندہ نہ کریں۔`;

    if (currentMode === "practice") {
      if (count >= PRACTICE_LIMIT) {
        base += `\n\nاب اس سبق کی مشق کے پانچوں سوالات مکمل ہو چکے ہیں۔ کوئی نیا سوال نہ پوچھیں۔ طالبہ کو مختصر، حوصلہ افزا مبارکباد کا پیغام دیں اور بتائیں کہ وہ چاہے تو دوبارہ مشق کر سکتی ہیں یا سبق سے متعلق سوال پوچھ سکتی ہیں۔`;
      } else {
        base += `\n\nآپ اس وقت طالبہ کی مشق کروا رہے ہیں۔ صرف اسی سبق کے مواد سے ایک وقت میں ایک، مختصر اور آسان سوال پوچھیں (ترجمہ کروانا، خالی جگہ پُر کروانا، یا مطلب پوچھنا جیسی مشقیں)۔ اس راؤنڈ میں کل ${PRACTICE_LIMIT} سوالات ہوں گے، یہ سوال نمبر ${count+1} ہے۔ طالبہ کے جواب پر فوراً بتائیں درست ہے یا نہیں اور ایک سطر میں مختصر وضاحت دیں، پھر اگلا سوال پوچھیں۔ ایک وقت میں صرف ایک سوال پوچھیں۔`;
      }
    } else {
      base += `\n\nطالبہ آزادانہ طور پر سوال پوچھ رہی ہے۔ صرف اسی سبق کے دائرے میں رہ کر مختصر اور واضح جواب دیں۔`;
    }
    return base;
  }

  async function callAPI(newHistory, currentMode, count) {
    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          system: buildSystemPrompt(currentMode, count),
          messages: newHistory
        })
      });
      const data = await response.json();
      let reply = "";
      if (data && data.content) reply = data.content.map(b => b.text || "").join("\n").trim();
      if (!reply) reply = "معذرت، مجھے جواب دینے میں مسئلہ ہوا۔ دوبارہ کوشش کریں۔";

      setHistory([...newHistory, { role: "assistant", content: reply }]);
      setMessages(m => [...m, { role: "ai", text: reply }]);

      if (currentMode === "practice") {
        const newCount = count + 1;
        setPracticeCount(newCount);
        if (newCount >= PRACTICE_LIMIT) setMode("done");
      }
    } catch (err) {
      setMessages(m => [...m, { role: "ai", text: "معذرت، رابطے میں مسئلہ ہوا۔ براہِ کرم دوبارہ کوشش کریں۔" }]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function startPractice() {
    setMode("practice");
    setPracticeCount(0);
    setMessages([{ role: "ai", text: `چلیں "${lesson.title}" کی مشق شروع کرتے ہیں! ${PRACTICE_LIMIT} سوالات ہوں گے۔ 😊` }]);
    const newHistory = [{ role: "user", content: "پہلا سوال پوچھیں" }];
    setHistory(newHistory);
    callAPI(newHistory, "practice", 0);
  }

  function startChat() {
    setMode("chat");
    setPracticeCount(0);
    setMessages([{ role: "ai", text: `جی بتائیں، "${lesson.title}" کے بارے میں آپ کیا پوچھنا چاہتی ہیں؟` }]);
    setHistory([]);
  }

  function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(m => [...m, { role: "user", text }]);
    const newHistory = [...history, { role: "user", content: text }];
    setHistory(newHistory);
    setInput("");
    callAPI(newHistory, mode, practiceCount);
  }

  if (mode === "idle") {
    return (
      <div className="tutor-section">
        <div className="quiz-title">🤖 AI معلم کے ساتھ سیکھیں</div>
        <div className="tutor-intro-text">اگر یہ سبق سمجھ نہیں آیا، AI معلم سے پوچھیں یا خود مشق کر لیں — بالکل اسی سبق کے مواد سے۔</div>
        <div className="tutor-btn-row">
          <button className="quiz-start-btn" onClick={startPractice}>🎯 مشق کریں ({PRACTICE_LIMIT} سوالات)</button>
          <button className="tutor-secondary-btn" onClick={startChat}>💬 سوال پوچھیں</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-section">
      <div className="tutor-header-row">
        <div className="quiz-title" style={{marginBottom:0}}>🤖 AI معلم</div>
        {mode === "practice" && (
          <div className="tutor-progress">سوال {Math.min(practiceCount+1, PRACTICE_LIMIT)}/{PRACTICE_LIMIT}</div>
        )}
      </div>

      <div className="tutor-chat-box">
        {messages.map((m, i) => (
          <div key={i} className={`tutor-msg ${m.role}`}>{m.text}</div>
        ))}
        {loading && (
          <div className="tutor-typing"><span></span><span></span><span></span></div>
        )}
      </div>

      {mode === "done" ? (
        <div className="tutor-done-row">
          <button className="btn-edit" onClick={startPractice}>🔁 دوبارہ مشق کریں</button>
          <button className="btn-edit" onClick={startChat}>💬 سوال پوچھیں</button>
          <button className="tutor-close-btn" onClick={() => setMode("idle")}>بند کریں</button>
        </div>
      ) : (
        <div className="tutor-input-row">
          <input
            className="form-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="یہاں اپنا جواب یا سوال لکھیں..."
            disabled={loading}
          />
          <button className="tutor-send-btn" onClick={handleSend} disabled={loading}>بھیجیں</button>
        </div>
      )}
    </div>
  );
}

// ── Lesson Form ───────────────────────────────────────────────────────────────
function LessonForm({ lesson, onSave, onCancel }) {
  const [d, setD] = useState(lesson || {title:"",order:1,category:"بنیادی",description:"",content:"",videoUrl:"",imageUrl:"",pdfUrl:"",quiz:[]});
  const [quiz, setQuiz] = useState(d.quiz || []);
  const f = (k,v) => setD(x => ({...x,[k]:v}));
  const addQ = () => setQuiz(q => [...q,{q:"",options:["","","",""],ans:0}]);
  const upQ = (i,k,v) => setQuiz(q => q.map((x,j)=>j===i?{...x,[k]:v}:x));
  const upOpt = (qi,oi,v) => setQuiz(q => q.map((x,j)=>j===qi?{...x,options:x.options.map((o,k)=>k===oi?v:o)}:x));
  const delQ = (i) => setQuiz(q => q.filter((_,j)=>j!==i));
  const save = () => { if(!d.title.trim()) return alert("عنوان لازمی ہے"); onSave({...d,quiz}); };

  return (
    <div className="lesson-form">
      <div className="form-title">{lesson?"✏️ سبق میں ترمیم":"➕ نیا سبق شامل کریں"}</div>
      <div className="form-grid">
        <div className="fg"><div className="form-label">عنوان *</div><input className="form-input" value={d.title} onChange={e=>f("title",e.target.value)} placeholder="سبق کا عنوان" /></div>
        <div className="fg"><div className="form-label">ترتیب نمبر</div><input className="form-input" type="number" value={d.order} onChange={e=>f("order",+e.target.value)} /></div>
        <div className="fg"><div className="form-label">زمرہ</div>
          <select className="form-input" value={d.category} onChange={e=>f("category",e.target.value)}>
            {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="fg"><div className="form-label">مختصر تفصیل</div><input className="form-input" value={d.description} onChange={e=>f("description",e.target.value)} placeholder="سبق کی مختصر تفصیل" /></div>
        <div className="fg full"><div className="form-label">📖 سبق کا متن / مواد</div><textarea className="form-input form-textarea" value={d.content} onChange={e=>f("content",e.target.value)} placeholder="سبق کا مواد یہاں لکھیں..." /></div>
        <div className="fg"><div className="form-label">🎬 یوٹیوب ویڈیو لنک</div><input className="form-input" value={d.videoUrl} onChange={e=>f("videoUrl",e.target.value)} placeholder="https://youtube.com/watch?v=..." dir="ltr" style={{textAlign:"left"}} /></div>
        <div className="fg"><div className="form-label">📄 PDF لنک</div><input className="form-input" value={d.pdfUrl} onChange={e=>f("pdfUrl",e.target.value)} placeholder="https://example.com/file.pdf" dir="ltr" style={{textAlign:"left"}} /></div>
        <div className="fg full"><div className="form-label">🖼️ تصویر لنک (URL)</div><input className="form-input" value={d.imageUrl} onChange={e=>f("imageUrl",e.target.value)} placeholder="https://example.com/image.jpg" dir="ltr" style={{textAlign:"left"}} /></div>
      </div>

      <div className="quiz-builder">
        <div className="quiz-builder-header">
          <div className="quiz-builder-title">🧠 کوئز سوالات ({quiz.length})</div>
          <button className="btn-edit" onClick={addQ}>＋ سوال شامل کریں</button>
        </div>
        {quiz.map((q,qi)=>(
          <div key={qi} className="quiz-q-card">
            <div className="quiz-q-header">
              <div className="quiz-q-label">سوال {qi+1}</div>
              <button className="btn-del" onClick={()=>delQ(qi)}>حذف</button>
            </div>
            <input className="form-input" style={{marginBottom:10}} value={q.q} onChange={e=>upQ(qi,"q",e.target.value)} placeholder="سوال یہاں لکھیں..." />
            {q.options.map((opt,oi)=>(
              <div key={oi} className="opt-row">
                <input type="radio" className="opt-radio" name={`ans_${qi}`} checked={q.ans===oi} onChange={()=>upQ(qi,"ans",oi)} />
                <input className="form-input" style={{marginBottom:0}} value={opt} onChange={e=>upOpt(qi,oi,e.target.value)} placeholder={`آپشن ${oi+1}`} />
              </div>
            ))}
            <div className="opt-hint">◉ سے درست جواب منتخب کریں</div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="btn-cancel" onClick={onCancel}>منسوخ</button>
        <button className="btn-save" onClick={save}>💾 محفوظ کریں</button>
      </div>
    </div>
  );
}
