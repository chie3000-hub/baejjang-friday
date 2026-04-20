import { useState, useEffect, useCallback } from "react";
import { supabase } from "./src/supabase.js";

// ── 관리자 고정 인증 정보 ────────────────────────────────────────────────────
const ADMIN_NAME = "관리자";
const ADMIN_PW   = "관리자";

// ── 아바타 선택지 ──────────────────────────────────────────────────────────
const AVATARS = [
  // 볼링 & 스포츠
  "🎳","🏅","🥇","⚽","🏀","⚾","🎾","🏸","🥊","🎱",
  // 동물
  "🦁","🐯","🦊","🐺","🐻","🐼","🦅","🦋","🐲","🦄",
  // 파워 & 감정
  "🔥","⚡","💫","🎯","🏆","💥","👑","😎","🤩","😈",
  // 자연 & 기타
  "🌊","🌙","⭐","🌈","❄️","🌸","🍀","🎸","🎮","🚀",
  // 탈것
  "🚗","🏎️","🚕","🚙","🏍️","✈️","🚂","🚢","🚁","🛸",
  // 음식
  "🍕","🍔","🍜","🍣","🍩","🎂","🍦","🍗","🥩","🍺",
];

const fmtDate = (date) => date.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
const fmtDt = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const p2 = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
};

// ── 아이콘 ────────────────────────────────────────────────────────────────
const Ic = ({ n, s = 18 }) => {
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    check: <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>,
    x:     <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    users: <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    logout:<svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    cal:   <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    img:   <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    trophy:<svg {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
    msg:   <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    heart: <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    plus:  <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    send:  <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    book:  <svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    edit2: <svg {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    admin: <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    eye:   <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    trash: <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  };
  return icons[n] || null;
};

// ── Logo SVG ──────────────────────────────────────────────────────────────
const LogoMark = ({ size = 160 }) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 320 176" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="glow2"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="tg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#60b0ff"/><stop offset="100%" stopColor="#c060ff"/></linearGradient>
      <linearGradient id="cg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#7040ff"/><stop offset="100%" stopColor="#d040ff"/></linearGradient>
    </defs>
    <polygon points="160,4 148,22 136,14 142,30 178,30 184,14 172,22" fill="none" stroke="#ffe040" strokeWidth="2.5" filter="url(#glow)"/>
    <polygon points="160,4 148,22 136,14 142,30 178,30 184,14 172,22" fill="#ffe04040"/>
    <rect x="12" y="36" width="296" height="58" rx="10" fill="none" stroke="#00ff80" strokeWidth="3" filter="url(#glow2)" opacity="0.7"/>
    <text x="160" y="82" textAnchor="middle" fontFamily="'Arial Black',sans-serif" fontSize="46" fontWeight="900" fill="url(#tg)" stroke="#00d0ff" strokeWidth="1.5" filter="url(#glow)" letterSpacing="1">BAEJJANG</text>
    <text x="160" y="138" textAnchor="middle" fontFamily="'Arial Black',sans-serif" fontSize="46" fontWeight="900" fill="url(#cg)" stroke="#8040ff" strokeWidth="1.5" filter="url(#glow)" letterSpacing="2">CREW!</text>
    <path d="M80,150 Q160,162 240,150" stroke="#c040ff" strokeWidth="3" fill="none" filter="url(#glow)"/>
    {[[30,50],[290,60],[20,110],[300,100],[50,160],[270,165]].map(([cx,cy],i)=>(
      <circle key={i} cx={cx} cy={cy} r="3" fill="#00ff80" opacity="0.6" filter="url(#glow)"/>
    ))}
  </svg>
);

// ── CSS ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#06080f;--s1:#0e1120;--s2:#161b2e;--s3:#1e2540;--bd:#252d45;
    --ac:#4f7cff;--ac2:#7b4fff;--yw:#f5c542;--gn:#2ddc78;--rd:#ff4f6b;
    --tx:#e4e8f5;--mu:#5a6385;--r:14px;
  }
  html,body{background:var(--bg);color:var(--tx);font-family:'Noto Sans KR',sans-serif;min-height:100vh;}
  .app{min-height:100vh;display:flex;flex-direction:column;}

  /* AUTH */
  .auth-wrap{
    min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:radial-gradient(ellipse at 50% 40%,#0a1530 0%,var(--bg) 70%);
    padding:24px;
  }
  .auth-card{
    width:100%;max-width:400px;
    background:rgba(14,17,32,0.92);backdrop-filter:blur(20px);
    border:1px solid rgba(79,124,255,0.25);border-radius:24px;padding:36px 32px;
    box-shadow:0 0 60px rgba(79,124,255,0.08),0 32px 80px rgba(0,0,0,0.7);
  }
  .logo-area{text-align:center;margin-bottom:24px;}
  .logo-float{display:inline-block;filter:drop-shadow(0 0 12px rgba(0,200,255,0.5)) drop-shadow(0 0 24px rgba(150,0,255,0.3));animation:lf 3s ease-in-out infinite;}
  @keyframes lf{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
  .logo-sub{font-size:12px;color:var(--mu);margin-top:8px;letter-spacing:.06em;}

  .auth-tabs{display:flex;gap:0;margin-bottom:24px;background:var(--s2);border-radius:10px;padding:4px;}
  .auth-tab{flex:1;padding:9px;font-size:13px;font-weight:700;font-family:inherit;background:transparent;border:none;color:var(--mu);border-radius:8px;cursor:pointer;transition:all .15s;}
  .auth-tab.on{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;box-shadow:0 4px 12px rgba(79,124,255,0.3);}

  .field{margin-bottom:14px;}
  .field label{display:block;font-size:11px;color:var(--mu);margin-bottom:6px;letter-spacing:.06em;font-weight:600;}
  .field input{width:100%;background:rgba(30,37,64,.8);border:1px solid var(--bd);border-radius:10px;padding:12px 14px;color:var(--tx);font-size:14px;font-family:inherit;outline:none;transition:border-color .2s;}
  .field input:focus{border-color:var(--ac);box-shadow:0 0 0 3px rgba(79,124,255,.12);}
  .pw-wrap{position:relative;}
  .pw-wrap input{padding-right:44px;}
  .pw-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--mu);cursor:pointer;display:flex;align-items:center;padding:4px;}
  .pw-eye:hover{color:var(--tx);}

  .avatar-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;}
  .avatar-btn{width:40px;height:40px;background:var(--s2);border:2px solid var(--bd);border-radius:10px;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
  .avatar-btn:hover{border-color:var(--ac);}
  .avatar-btn.sel{border-color:var(--ac);background:rgba(79,124,255,.15);box-shadow:0 0 0 3px rgba(79,124,255,.2);}

  .btn-primary{width:100%;margin-top:10px;background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;transition:opacity .15s,transform .1s;box-shadow:0 8px 24px rgba(79,124,255,.4);}
  .btn-primary:hover{opacity:.9;}
  .btn-primary:active{transform:scale(.98);}
  .err{color:var(--rd);font-size:12px;margin-top:8px;}
  .suc{color:var(--gn);font-size:12px;margin-top:8px;}

  /* HEADER */
  .hdr{background:rgba(14,17,32,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--bd);padding:0 16px;height:54px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:200;}
  .hdr-l{display:flex;align-items:center;gap:10px;}
  .hdr-logo{filter:drop-shadow(0 0 4px rgba(0,200,255,.6));}
  .hdr-name{font-weight:900;font-size:15px;background:linear-gradient(135deg,#60b0ff,#c060ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .hdr-r{display:flex;align-items:center;gap:10px;}
  .hdr-user{font-size:13px;color:var(--mu);display:flex;align-items:center;gap:6px;}
  .ibtn{background:transparent;border:1px solid var(--bd);border-radius:8px;color:var(--mu);padding:7px;cursor:pointer;display:flex;align-items:center;transition:all .15s;}
  .ibtn:hover{color:var(--tx);border-color:var(--ac);}

  /* NAV */
  .nav{background:var(--s1);border-bottom:1px solid var(--bd);display:flex;overflow-x:auto;padding:0 12px;scrollbar-width:none;}
  .nav::-webkit-scrollbar{display:none;}
  .ntab{display:flex;align-items:center;gap:6px;padding:14px 14px 12px;font-size:13px;font-weight:500;color:var(--mu);background:transparent;border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:inherit;transition:color .15s;white-space:nowrap;margin-bottom:-1px;}
  .ntab.on{color:var(--ac);border-bottom-color:var(--ac);}
  .ntab:hover:not(.on){color:var(--tx);}

  /* MAIN */
  .main{padding:20px;flex:1;max-width:780px;width:100%;margin:0 auto;}

  /* SESSION */
  .slist{display:flex;flex-direction:column;gap:10px;}
  .scard{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);overflow:hidden;transition:border-color .2s;}
  .scard:hover{border-color:#2e3a60;}
  .scard-hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;cursor:pointer;}
  .scard-l{display:flex;align-items:center;gap:12px;}
  .snum{font-size:10px;color:var(--mu);background:var(--s2);border-radius:6px;padding:3px 8px;font-weight:600;}
  .sdate{font-size:15px;font-weight:700;}
  .stime{font-size:11px;color:var(--mu);margin-top:2px;}
  .sdead{font-size:11px;color:var(--yw);margin-top:2px;}
  .scard-r{display:flex;align-items:center;gap:8px;}
  .sbadge{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;padding:4px 11px;border-radius:99px;}
  .sbadge.join{background:rgba(45,220,120,.12);color:var(--gn);border:1px solid rgba(45,220,120,.25);}
  .sbadge.skip{background:rgba(255,79,107,.1);color:var(--rd);border:1px solid rgba(255,79,107,.2);}
  .sbadge.pend{background:var(--s2);color:var(--mu);border:1px solid var(--bd);}
  .sbadge.closed{background:rgba(245,197,66,.1);color:var(--yw);border:1px solid rgba(245,197,66,.25);}
  .sbody{padding:0 18px 18px;border-top:1px solid var(--bd);animation:fd .2s ease;}
  @keyframes fd{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:none;}}
  .arow{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;}
  .bjoin,.bskip{display:flex;align-items:center;gap:7px;padding:11px 22px;border-radius:10px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;border:1.5px solid;transition:all .15s;}
  .bjoin{background:rgba(45,220,120,.1);color:var(--gn);border-color:rgba(45,220,120,.25);}
  .bjoin.on,.bjoin:hover{background:var(--gn);color:#06080f;border-color:var(--gn);}
  .bskip{background:rgba(255,79,107,.08);color:var(--rd);border-color:rgba(255,79,107,.2);}
  .bskip.on,.bskip:hover{background:var(--rd);color:#fff;border-color:var(--rd);}
  .bjoin:active,.bskip:active{transform:scale(.97);}
  .btn-disabled{display:flex;align-items:center;gap:7px;padding:11px 22px;border-radius:10px;font-size:14px;font-weight:700;font-family:inherit;background:var(--s2);color:var(--mu);border:1.5px solid var(--bd);cursor:not-allowed;}
  .pcnt{margin-top:14px;font-size:12px;color:var(--mu);display:flex;align-items:center;gap:6px;}

  /* GALLERY */
  .gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}
  .gal-card{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);overflow:hidden;transition:transform .2s,box-shadow .2s;}
  .gal-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.4);}
  .gal-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--s2);}
  .gal-info{padding:12px;}
  .gal-session{font-size:10px;color:var(--ac);font-weight:700;letter-spacing:.06em;margin-bottom:4px;}
  .gal-caption{font-size:13px;font-weight:500;line-height:1.4;margin-bottom:8px;}
  .gal-meta{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--mu);}
  .form-box{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);padding:20px;margin-bottom:20px;animation:fd .2s ease;}
  .form-title{font-size:14px;font-weight:700;margin-bottom:14px;}
  .frow{margin-bottom:12px;}
  .frow label{display:block;font-size:11px;color:var(--mu);margin-bottom:6px;}
  .frow input,.frow textarea{width:100%;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:10px 12px;color:var(--tx);font-size:13px;font-family:inherit;outline:none;transition:border-color .2s;resize:none;}
  .frow input:focus,.frow textarea:focus{border-color:var(--ac);}
  .fbtns{display:flex;gap:8px;}

  /* TOURNAMENT */
  .t-season{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);margin-bottom:14px;overflow:hidden;}
  .t-hdr{padding:16px 20px;background:linear-gradient(135deg,rgba(79,124,255,.08),rgba(123,79,255,.08));border-bottom:1px solid var(--bd);}
  .t-name{font-size:16px;font-weight:800;}
  .t-date{font-size:12px;color:var(--mu);}
  .t-row{display:flex;align-items:center;gap:14px;padding:14px 20px;border-top:1px solid var(--bd);}
  .t-row:hover{background:rgba(255,255,255,.02);}
  .t-place{font-size:18px;font-weight:900;min-width:32px;text-align:center;}
  .t-place.p1{color:var(--yw);}.t-place.p2{color:#c0c8e0;}.t-place.p3{color:#cd7f32;}.t-place.pn{color:var(--mu);font-size:15px;}
  .t-av{font-size:22px;}
  .t-info{flex:1;}
  .t-pname{font-size:15px;font-weight:700;}
  .t-rec{font-size:11px;color:var(--mu);margin-top:2px;}
  .t-score{font-size:15px;font-weight:800;color:var(--ac);}

  /* BOARD */
  .post-list{display:flex;flex-direction:column;gap:12px;}
  .post-card{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);overflow:hidden;}
  .post-hdr{padding:16px 18px;cursor:pointer;}
  .post-hdr:hover{background:rgba(255,255,255,.02);}
  .post-author{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
  .p-av{font-size:18px;}.p-name{font-size:13px;font-weight:700;}.p-date{font-size:11px;color:var(--mu);}
  .post-title{font-size:15px;font-weight:700;margin-bottom:6px;}
  .post-body-txt{font-size:13px;color:#b0b8d0;line-height:1.6;}
  .post-foot{display:flex;align-items:center;gap:14px;margin-top:12px;}
  .like-btn{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--mu);cursor:pointer;transition:color .15s;background:none;border:none;font-family:inherit;}
  .like-btn:hover,.like-btn.liked{color:var(--rd);}
  .cmt-cnt{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--mu);}
  .post-cmts{border-top:1px solid var(--bd);padding:14px 18px;background:rgba(255,255,255,.015);}
  .cmt{display:flex;gap:10px;margin-bottom:12px;}
  .cmt:last-child{margin-bottom:0;}
  .cmt-av{font-size:16px;}
  .cmt-body{flex:1;}
  .cmt-meta{display:flex;align-items:center;gap:8px;margin-bottom:3px;}
  .cmt-name{font-size:12px;font-weight:700;}.cmt-date{font-size:11px;color:var(--mu);}
  .cmt-txt{font-size:13px;color:#b0b8d0;line-height:1.5;}
  .cmt-form{display:flex;gap:8px;margin-top:12px;border-top:1px solid var(--bd);padding-top:12px;}
  .cmt-input{flex:1;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:9px 12px;color:var(--tx);font-size:13px;font-family:inherit;outline:none;transition:border-color .2s;}
  .cmt-input:focus{border-color:var(--ac);}
  .cmt-send{background:var(--ac);color:#fff;border:none;border-radius:8px;padding:9px 14px;cursor:pointer;display:flex;align-items:center;transition:opacity .15s;}
  .cmt-send:hover{opacity:.85;}

  /* ADMIN */
  .acard{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);margin-bottom:10px;overflow:hidden;}
  .acard-hdr{padding:14px 18px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;}
  .acard-hdr:hover{background:rgba(255,255,255,.02);}
  .ahl{display:flex;align-items:center;gap:12px;}
  .astats{display:flex;gap:8px;align-items:center;}
  .spill{font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;border:1px solid;}
  .spill.g{color:var(--gn);border-color:rgba(45,220,120,.3);background:rgba(45,220,120,.08);}
  .spill.r{color:var(--rd);border-color:rgba(255,79,107,.3);background:rgba(255,79,107,.08);}
  .abody{border-top:1px solid var(--bd);}
  .ptbl{width:100%;border-collapse:collapse;}
  .ptbl th{font-size:11px;color:var(--mu);text-align:left;padding:10px 18px;background:var(--s2);font-weight:600;}
  .ptbl td{padding:10px 18px;font-size:13px;border-top:1px solid var(--bd);vertical-align:middle;}
  .ptbl tr:hover td{background:rgba(255,255,255,.02);}
  .sj{color:var(--gn);font-weight:700;}.ss{color:var(--rd);}.sn{color:var(--mu);}
  .sgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
  .sbox{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r);padding:16px;}
  .slbl{font-size:11px;color:var(--mu);margin-bottom:8px;}
  .sval{font-size:26px;font-weight:900;}
  .sval.g{color:var(--gn);}.sval.r{color:var(--rd);}

  /* MEMBER LIST */
  .member-list{display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
  .member-row{background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:14px 16px;}
  .member-row-top{display:flex;align-items:center;justify-content:space-between;gap:10px;}
  .member-info{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}
  .member-av{font-size:26px;flex-shrink:0;}
  .member-name{font-size:14px;font-weight:700;}
  .member-meta{font-size:11px;color:var(--mu);margin-top:3px;display:flex;flex-wrap:wrap;gap:6px;}
  .member-meta span{display:inline-flex;align-items:center;gap:3px;}
  .member-extra{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--bd);}
  .member-tag{display:inline-flex;align-items:center;gap:4px;background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:4px 10px;font-size:11px;color:var(--mu);}
  .member-tag b{color:var(--tx);font-weight:600;}
  .del-btn{background:rgba(255,79,107,.1);border:1px solid rgba(255,79,107,.2);color:var(--rd);border-radius:8px;padding:6px 10px;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:12px;font-family:inherit;transition:all .15s;flex-shrink:0;}
  .del-btn:hover{background:var(--rd);color:#fff;}

  /* TOAST */
  .toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e2030;border:1px solid var(--bd);border-radius:12px;padding:12px 20px;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.5);z-index:9999;animation:toastIn .2s ease;white-space:nowrap;}
  .toast.error{border-color:rgba(255,79,107,.4);color:var(--rd);}
  .toast.success{border-color:rgba(45,220,120,.4);color:var(--gn);}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

  /* MISC */
  .sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
  .sec-ttl{font-size:17px;font-weight:800;display:flex;align-items:center;gap:8px;}
  .fab{display:flex;align-items:center;gap:7px;background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;border:none;border-radius:12px;padding:11px 18px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;box-shadow:0 6px 20px rgba(79,124,255,.4);transition:opacity .15s,transform .1s;margin-bottom:16px;}
  .fab:hover{opacity:.9;}.fab:active{transform:scale(.97);}
  .btn-ac{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:opacity .15s;}
  .btn-ac:hover{opacity:.88;}
  .btn-ghost{background:transparent;color:var(--mu);border:1px solid var(--bd);border-radius:8px;padding:9px 16px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;}
  .btn-ghost:hover{color:var(--tx);border-color:var(--tx);}
  .section-label{font-size:12px;font-weight:700;color:var(--mu);letter-spacing:.08em;margin-bottom:12px;margin-top:20px;}
  .fee-row{display:flex;align-items:center;gap:10px;padding:12px 18px;background:rgba(245,197,66,0.04);border-bottom:1px solid var(--bd);}
  .fee-row label{font-size:12px;color:var(--mu);white-space:nowrap;font-weight:600;}
  .fee-input{background:var(--s2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);font-size:15px;font-weight:700;padding:7px 12px;width:140px;outline:none;font-family:inherit;transition:border-color .2s;}
  .fee-input:focus{border-color:var(--yw);}
  .fee-save{background:rgba(245,197,66,.15);color:var(--yw);border:1px solid rgba(245,197,66,.3);border-radius:8px;padding:7px 16px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .15s;}
  .fee-save:hover{background:var(--yw);color:#06080f;}
  .fee-badge{font-size:11px;font-weight:700;color:var(--yw);background:rgba(245,197,66,.12);border:1px solid rgba(245,197,66,.25);padding:3px 9px;border-radius:99px;white-space:nowrap;}
  .fee-total-row{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;border-top:1px solid var(--bd);background:rgba(45,220,120,0.03);}
  .fee-total-label{font-size:12px;color:var(--mu);}
  .fee-total-val{font-size:15px;font-weight:800;color:var(--gn);}

  /* 상품 관리 */
  .product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:6px;}
  .product-card{background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px;transition:border-color .2s;}
  .product-card:hover{border-color:#2e3a60;}
  .product-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;}
  .product-name{font-size:14px;font-weight:700;line-height:1.3;}
  .product-desc{font-size:11px;color:var(--mu);margin-top:3px;line-height:1.5;}
  .product-price{font-size:18px;font-weight:900;color:var(--yw);}
  .product-price span{font-size:11px;font-weight:400;color:var(--mu);margin-left:2px;}
  .stock-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px;}
  .stock-ok{background:rgba(45,220,120,.12);color:var(--gn);border:1px solid rgba(45,220,120,.25);}
  .stock-low{background:rgba(245,197,66,.12);color:var(--yw);border:1px solid rgba(245,197,66,.25);}
  .stock-zero{background:rgba(255,79,107,.12);color:var(--rd);border:1px solid rgba(255,79,107,.25);}
  .product-actions{display:flex;gap:6px;margin-top:4px;}
  .btn-edit-sm{background:var(--s2);border:1px solid var(--bd);color:var(--mu);border-radius:7px;padding:5px 10px;font-size:11px;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:3px;transition:all .15s;}
  .btn-edit-sm:hover{color:var(--tx);border-color:var(--ac);}
`;

// ── メインアプリ ────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [rules, setRules] = useState([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({ icon: "📌", title: "", content: "" });

  // ── 상품 관리 ──
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", price: "", stock: "", description: "" });
  const [productDeleteId, setProductDeleteId] = useState(null);

  const [user, setUser] = useState(() => {
    try { const d = localStorage.getItem("bjf_session"); return d ? JSON.parse(d) : null; } catch { return null; }
  });
  const [authMode, setAuthMode] = useState("login");
  const [tab, setTab] = useState("schedule");
  const [expanded, setExpanded] = useState(null);

  // ── 로그인 폼 ──
  const [lName, setLName] = useState(() => { try { return localStorage.getItem("bjf_saved_name") || ""; } catch { return ""; } });
  const [lPw, setLPw] = useState("");
  const [lErr, setLErr] = useState("");
  const [showLPw, setShowLPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => { try { return localStorage.getItem("bjf_remember") === "1"; } catch { return false; } });
  // T2: 기존 저장된 평문 비밀번호 제거
  try { localStorage.removeItem("bjf_saved_pw"); } catch {}

  // ── 회원가입 폼 ──
  const [sName, setSName] = useState("");
  const [sPw, setSPw] = useState("");
  const [sPw2, setSPw2] = useState("");
  const [sAvatar, setSAvatar] = useState("🔥");
  const [sErr, setSErr] = useState("");
  const [sSuc, setSSuc] = useState("");
  const [showSPw, setShowSPw] = useState(false);

  // ── 갤러리 폼 ──
  const [showGalForm, setShowGalForm] = useState(false);
  const [galForm, setGalForm] = useState({ sessionLabel: "", caption: "", url: "" });

  // ── 게시판 폼 ──
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", content: "" });
  const [expandedPost, setExpandedPost] = useState(null);
  const [cmtInputs, setCmtInputs] = useState({});
  const [feeInputs, setFeeInputs] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);
  const [sessionCmtInputs, setSessionCmtInputs] = useState({});

  // ── 게스트 ──
  const [guestInputs, setGuestInputs] = useState({});
  const [showGuestForm, setShowGuestForm] = useState({});

  // ── 새 리그 추가 폼 ──
  const [showAddSession, setShowAddSession] = useState(false);
  const [addSessionForm, setAddSessionForm] = useState({ date: "", note: "" });

  // ── 스코어 입력 ──
  const [scoreInputs, setScoreInputs] = useState({});

  // ── 프로필 편집 ──
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNickname, setEditNickname] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [editAvatar, setEditAvatar] = useState("🔥");
  const [editPw, setEditPw] = useState("");
  const [editPw2, setEditPw2] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileSuc, setProfileSuc] = useState("");

  // ── 공지 폼 ──
  const [showAnnoForm, setShowAnnoForm] = useState(false);
  const [annoForm, setAnnoForm] = useState({ title: "", content: "" });

  // ── 토스트 ──
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Supabase 데이터 로딩 ──
  const loadUsers = useCallback(async () => {
    const { data } = await supabase.from("users").select("id, name, nickname, birthday, role, avatar, joined_at").order("joined_at");
    if (data) setUsers(data.map(u => ({ id: u.id, name: u.name, nickname: u.nickname || "", birthday: u.birthday || "", role: u.role, avatar: u.avatar, joinedAt: u.joined_at })));
  }, []);

  const loadSessions = useCallback(async () => {
    const [sessRes, partRes, scoreRes, cmtRes] = await Promise.all([
      supabase.from("sessions").select("*").order("date"),
      supabase.from("participants").select("*"),
      supabase.from("scores").select("*"),
      supabase.from("session_comments").select("*, users(name, avatar)").order("created_at"),
    ]);
    const guestRes = await supabase.from("session_guests").select("*").order("created_at");
    const list = (sessRes.data || []).map(s => {
      const parts = {};
      (partRes.data || []).filter(p => p.session_id === s.id).forEach(p => { parts[p.user_id] = p.status; });
      const scoresMap = {};
      (scoreRes.data || []).filter(sc => sc.session_id === s.id).forEach(sc => { scoresMap[sc.user_id] = { games: sc.games || [] }; });
      const comments = (cmtRes.data || []).filter(c => c.session_id === s.id).map(c => ({
        id: c.id, author: c.users?.name || "?", avatar: c.users?.avatar || "👤",
        text: c.text, date: fmtDt(c.created_at),
      }));
      const guests = (guestRes.data || []).filter(g => g.session_id === s.id).map(g => ({
        id: g.id, name: g.name, average: g.average, addedBy: g.added_by,
      }));
      return { id: s.id, date: new Date(s.date + "T12:00:00"), note: s.note || "", fee: s.fee || 0, participants: parts, scores: scoresMap, comments, guests };
    });
    setSessions(list);
  }, []);

  const loadGallery = useCallback(async () => {
    const { data } = await supabase.from("gallery").select("*, users(name, avatar)").order("created_at", { ascending: false });
    if (data) setGallery(data.map(g => ({
      id: g.id, sessionLabel: g.session_label || "자유 게시",
      author: g.users?.name || "?", authorAvatar: g.users?.avatar || "👤",
      date: (g.created_at || "").slice(0, 10), url: g.url, caption: g.caption,
    })));
  }, []);

  const loadPosts = useCallback(async () => {
    const [postRes, likeRes, cmtRes] = await Promise.all([
      supabase.from("posts").select("*, users(name, avatar)").order("created_at", { ascending: false }),
      supabase.from("post_likes").select("*"),
      supabase.from("post_comments").select("*, users(name, avatar)").order("created_at"),
    ]);
    const list = (postRes.data || []).map(p => {
      const likedBy = (likeRes.data || []).filter(l => l.post_id === p.id).map(l => l.user_id);
      const comments = (cmtRes.data || []).filter(c => c.post_id === p.id).map(c => ({
        id: c.id, author: c.users?.name || "?", avatar: c.users?.avatar || "👤",
        text: c.text, date: fmtDt(c.created_at),
      }));
      return {
        id: p.id, author: p.users?.name || "?", avatar: p.users?.avatar || "👤",
        date: fmtDt(p.created_at), title: p.title, content: p.content,
        likes: likedBy.length, likedBy, comments,
      };
    });
    setPosts(list);
  }, []);

  const loadAnnouncements = useCallback(async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (data) setAnnouncements(data.map(a => ({ id: a.id, title: a.title, content: a.content, date: fmtDt(a.created_at) })));
  }, []);

  const loadRules = useCallback(async () => {
    const { data } = await supabase.from("rules").select("*").order("order_index");
    if (data) setRules(data.map(r => ({ id: r.id, icon: r.icon, title: r.title, content: r.content })));
  }, []);

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data.map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stock, description: p.description || "" })));
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([loadUsers(), loadSessions(), loadGallery(), loadPosts(), loadAnnouncements(), loadRules(), loadProducts()]);
      setLoading(false);
    })();
  }, [loadUsers, loadSessions, loadGallery, loadPosts, loadAnnouncements, loadRules, loadProducts]);

  // ログイン済みユーザーの nickname/birthday を DB から同期（localStorage 復元時に欠ける場合の対策）
  useEffect(() => {
    if (!user || users.length === 0) return;
    const fresh = users.find(u => u.id === user.id);
    if (!fresh) return;
    if (fresh.nickname !== (user.nickname ?? "") || fresh.birthday !== (user.birthday ?? "")) {
      const updated = { ...user, nickname: fresh.nickname || "", birthday: fresh.birthday || "" };
      setUser(updated);
      localStorage.setItem("bjf_session", JSON.stringify(updated));
    }
  }, [users]);

  useEffect(() => {
    const chan = supabase.channel("bjf-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, loadSessions)
      .on("postgres_changes", { event: "*", schema: "public", table: "scores" }, loadSessions)
      .on("postgres_changes", { event: "*", schema: "public", table: "session_guests" }, loadSessions)
      .subscribe();
    return () => supabase.removeChannel(chan);
  }, [loadSessions]);

  // ── Auth ──
  const handleAdminLogin = async () => {
    setLErr("");
    const { data: d } = await supabase.from("users")
      .select("id, name, nickname, birthday, role, avatar, joined_at")
      .eq("name", ADMIN_NAME).maybeSingle();
    const data = d || { id: 0, name: ADMIN_NAME, nickname: "", birthday: "", role: "admin", avatar: "👑", joined_at: null };
    const u = { id: data.id, name: data.name, nickname: data.nickname || "", birthday: data.birthday || "", role: data.role, avatar: data.avatar, joinedAt: data.joined_at };
    localStorage.setItem("bjf_session", JSON.stringify(u));
    setUser(u);
  };

  const handleLogin = async () => {
    setLErr("");
    let data = null;

    if (lName.trim() === ADMIN_NAME) {
      // 관리자: 고정 비밀번호로만 인증
      if (lPw !== ADMIN_PW) return setLErr("이름 또는 비밀번호가 틀렸습니다.");
      const { data: d } = await supabase.from("users")
        .select("id, name, nickname, birthday, role, avatar, joined_at")
        .eq("name", ADMIN_NAME).maybeSingle();
      // DB에 관리자 레코드가 없어도 가상 객체로 로그인
      data = d || { id: 0, name: ADMIN_NAME, nickname: "", birthday: "", role: "admin", avatar: "👑", joined_at: null };
    } else {
      // 일반 회원: DB 비밀번호로 인증
      const { data: d } = await supabase.from("users")
        .select("id, name, nickname, birthday, role, avatar, joined_at")
        .eq("name", lName).eq("password", lPw).maybeSingle();
      data = d;
    }

    if (data) {
      const u = { id: data.id, name: data.name, nickname: data.nickname || "", birthday: data.birthday || "", role: data.role, avatar: data.avatar, joinedAt: data.joined_at };
      if (rememberMe) {
        localStorage.setItem("bjf_saved_name", lName);
        localStorage.setItem("bjf_remember", "1");
      } else {
        localStorage.removeItem("bjf_saved_name");
        localStorage.setItem("bjf_remember", "0");
      }
      localStorage.setItem("bjf_session", JSON.stringify(u));
      setUser(u);
    } else {
      setLErr("이름 또는 비밀번호가 틀렸습니다.");
    }
  };

  const handleSignup = async () => {
    setSErr(""); setSSuc("");
    if (!sName.trim()) return setSErr("이름을 입력해 주세요.");
    if (sName.trim().length < 2) return setSErr("이름은 2글자 이상이어야 합니다.");
    if (sPw.length < 4) return setSErr("비밀번호는 4자 이상이어야 합니다.");
    if (sPw !== sPw2) return setSErr("비밀번호가 일치하지 않습니다.");
    const { error } = await supabase.from("users").insert({ name: sName.trim(), password: sPw, avatar: sAvatar, role: "member" });
    if (error) return setSErr(error.code === "23505" ? "이미 사용 중인 이름입니다." : "가입 중 오류가 발생했습니다.");
    await loadUsers();
    setSSuc("가입 완료! 로그인해 주세요 🎉");
    setSName(""); setSPw(""); setSPw2("");
    setTimeout(() => { setAuthMode("login"); setSSuc(""); }, 1500);
  };

  const saveProfile = async () => {
    setProfileErr(""); setProfileSuc("");
    if (!editName.trim()) return setProfileErr("이름을 입력해 주세요.");
    if (editName.trim().length < 2) return setProfileErr("이름은 2글자 이상이어야 합니다.");
    if (editPw && editPw.length < 4) return setProfileErr("비밀번호는 4자 이상이어야 합니다.");
    if (editPw && editPw !== editPw2) return setProfileErr("비밀번호가 일치하지 않습니다.");
    const updates = { name: editName.trim(), nickname: editNickname.trim(), birthday: editBirthday || null, avatar: editAvatar };
    if (editPw) updates.password = editPw;
    const { error } = await supabase.from("users").update(updates).eq("id", user.id);
    if (error) return setProfileErr(error.code === "23505" ? "이미 사용 중인 이름입니다." : "저장 중 오류가 발생했습니다.");
    const updated = { ...user, name: editName.trim(), nickname: editNickname.trim(), birthday: editBirthday || "", avatar: editAvatar };
    setUser(updated);
    localStorage.setItem("bjf_session", JSON.stringify(updated));
    await loadUsers();
    setProfileSuc("프로필이 저장되었습니다 ✓");
    setEditPw(""); setEditPw2("");
    setTimeout(() => { setEditingProfile(false); setProfileSuc(""); }, 1200);
  };

  const isDeadlinePassed = (date) => {
    const d = new Date(date); d.setHours(17, 0, 0, 0); return new Date() > d;
  };

  const toggleParticipant = async (sid, status) => {
    const s = sessions.find(x => x.id === sid);
    if (!s || isDeadlinePassed(s.date)) return;
    const cur = s.participants[user.id];
    let err;
    if (cur === status) {
      ({ error: err } = await supabase.from("participants").delete().eq("session_id", sid).eq("user_id", user.id));
    } else {
      ({ error: err } = await supabase.from("participants").upsert({ session_id: sid, user_id: user.id, status }));
    }
    if (err) return showToast("참가 신청 중 오류가 발생했습니다.");
    await loadSessions();
  };

  const submitGallery = async () => {
    if (!galForm.caption || !galForm.url) return;
    await supabase.from("gallery").insert({ user_id: user.id, session_label: galForm.sessionLabel || "자유 게시", url: galForm.url, caption: galForm.caption });
    setGalForm({ sessionLabel: "", caption: "", url: "" }); setShowGalForm(false);
    await loadGallery();
  };

  const submitPost = async () => {
    if (!postForm.title || !postForm.content) return;
    const { error } = await supabase.from("posts").insert({ user_id: user.id, title: postForm.title, content: postForm.content });
    if (error) return showToast("게시글 작성 중 오류가 발생했습니다.");
    setPostForm({ title: "", content: "" }); setShowPostForm(false);
    await loadPosts();
  };

  const submitComment = async (pid) => {
    const txt = cmtInputs[pid];
    if (!txt?.trim()) return;
    await supabase.from("post_comments").insert({ post_id: pid, user_id: user.id, text: txt.trim() });
    setCmtInputs(prev => ({ ...prev, [pid]: "" }));
    await loadPosts();
  };

  const toggleLike = async (pid) => {
    const post = posts.find(p => p.id === pid);
    if (!post) return;
    if ((post.likedBy || []).includes(user.id)) {
      await supabase.from("post_likes").delete().eq("post_id", pid).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: pid, user_id: user.id });
    }
    await loadPosts();
  };

  const updateFee = async (sid) => {
    const val = parseInt(feeInputs[sid]) || 0;
    await supabase.from("sessions").update({ fee: val }).eq("id", sid);
    setFeeInputs(prev => ({ ...prev, [sid]: String(val) }));
    await loadSessions();
  };

  const submitSessionComment = async (sid) => {
    const txt = sessionCmtInputs[sid];
    if (!txt?.trim()) return;
    const { error } = await supabase.from("session_comments").insert({ session_id: sid, user_id: user.id, text: txt.trim() });
    if (error) return showToast("댓글 작성 중 오류가 발생했습니다.");
    setSessionCmtInputs(prev => ({ ...prev, [sid]: "" }));
    await loadSessions();
  };

  const deleteSessionComment = async (sid, cid) => {
    await supabase.from("session_comments").delete().eq("id", cid);
    await loadSessions();
  };

  const addGuest = async (sid) => {
    const inp = guestInputs[sid] || {};
    const name = (inp.name || "").trim();
    if (!name) return showToast("게스트 이름을 입력해주세요.");
    const average = inp.average ? parseInt(inp.average) : null;
    const { error } = await supabase.from("session_guests").insert({ session_id: sid, name, average, added_by: user.id });
    if (error) return showToast("게스트 추가 중 오류가 발생했습니다.");
    setGuestInputs(prev => ({ ...prev, [sid]: { name: "", average: "" } }));
    setShowGuestForm(prev => ({ ...prev, [sid]: false }));
    await loadSessions();
  };

  const deleteGuest = async (gid) => {
    await supabase.from("session_guests").delete().eq("id", gid);
    await loadSessions();
  };

  const deleteSession = async (sid) => {
    if (confirmDeleteId === sid) {
      await supabase.from("sessions").delete().eq("id", sid);
      setConfirmDeleteId(null);
      await loadSessions();
    } else {
      setConfirmDeleteId(sid);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const deleteUser = async (uid) => {
    await supabase.from("users").delete().eq("id", uid);
    await loadUsers();
  };

  const addSession = async () => {
    if (!addSessionForm.date) return;
    await supabase.from("sessions").insert({ date: addSessionForm.date, note: addSessionForm.note.trim() || null, fee: 0 });
    setAddSessionForm({ date: "", note: "" }); setShowAddSession(false);
    await loadSessions();
  };

  const saveScore = async (sid, uid) => {
    const key = `${sid}_${uid}`;
    const inp = scoreInputs[key] || {};
    const s = sessions.find(x => x.id === sid);
    if (!s) return;
    const prevGames = ((s.scores || {})[uid] || {}).games || [null,null,null,null,null];
    const games = [1,2,3,4,5].map(i => {
      const v = inp[`g${i}`];
      if (v !== undefined) return v === "" ? null : (parseInt(v) >= 0 ? parseInt(v) : null);
      return prevGames[i-1] !== undefined ? prevGames[i-1] : null;
    });
    const { error } = await supabase.from("scores").upsert({ session_id: sid, user_id: uid, games });
    if (error) return showToast("스코어 저장 중 오류가 발생했습니다.");
    await loadSessions();
  };

  const chev = (open) => (
    <svg style={{transition:"transform .2s",transform:open?"rotate(180deg)":"none",color:"var(--mu)"}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
  );

  // ── 로딩 화면 ──
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="auth-wrap">
        <div style={{textAlign:"center"}}>
          <div className="logo-float"><LogoMark size={220}/></div>
          <div style={{color:"var(--mu)",fontSize:13,marginTop:20,letterSpacing:"0.06em"}}>데이터 불러오는 중...</div>
        </div>
      </div>
    </>
  );

  // ── 인증 화면 ──
  if (!user) return (
    <>
      <style>{CSS}</style>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="logo-area">
            <div className="logo-float"><LogoMark size={220}/></div>
            <div className="logo-sub">매주 금요일 20:30 킥오프</div>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${authMode==="login"?"on":""}`} onClick={()=>{setAuthMode("login");setLErr("");}}>로그인</button>
            <button className={`auth-tab ${authMode==="signup"?"on":""}`} onClick={()=>{setAuthMode("signup");setSErr("");setSSuc("");}}>회원가입</button>
          </div>

          {authMode === "login" ? (
            <>
              <div className="field">
                <label>이름</label>
                <input placeholder="등록한 이름 입력" value={lName} onChange={e=>setLName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
              </div>
              <div className="field">
                <label>비밀번호</label>
                <div className="pw-wrap">
                  <input type={showLPw?"text":"password"} placeholder="비밀번호 입력" value={lPw} onChange={e=>setLPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                  <button className="pw-eye" onClick={()=>setShowLPw(v=>!v)}><Ic n="eye" s={16}/></button>
                </div>
              </div>
              {lErr && <p className="err">{lErr}</p>}
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{width:16,height:16,accentColor:"var(--ac)",cursor:"pointer"}}
                />
                <label htmlFor="remember" style={{fontSize:12,color:"var(--mu)",cursor:"pointer",userSelect:"none"}}>로그인 정보 저장</label>
              </div>
              <button className="btn-primary" onClick={handleLogin}>로그인</button>
              <button
                onClick={()=>{ const pw = prompt("관리자 비밀번호를 입력하세요"); if(pw===ADMIN_PW) handleAdminLogin(); else if(pw!==null) setLErr("비밀번호가 틀렸습니다."); }}
                style={{background:"rgba(245,197,66,0.1)",border:"1px solid rgba(245,197,66,0.3)",color:"var(--yw)",borderRadius:12,padding:"12px",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}
              >👑 관리자로 로그인</button>
            </>
          ) : (
            <>
              <div className="field">
                <label>이름 (닉네임)</label>
                <input placeholder="사용할 이름 입력" value={sName} onChange={e=>setSName(e.target.value)}/>
              </div>
              <div className="field">
                <label>아바타 선택</label>
                <div className="avatar-grid">
                  {AVATARS.map(av => (
                    <button key={av} className={`avatar-btn ${sAvatar===av?"sel":""}`} onClick={()=>setSAvatar(av)}>{av}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>비밀번호 (4자 이상)</label>
                <div className="pw-wrap">
                  <input type={showSPw?"text":"password"} placeholder="비밀번호 입력" value={sPw} onChange={e=>setSPw(e.target.value)}/>
                  <button className="pw-eye" onClick={()=>setShowSPw(v=>!v)}><Ic n="eye" s={16}/></button>
                </div>
              </div>
              <div className="field">
                <label>비밀번호 확인</label>
                <input type="password" placeholder="비밀번호 재입력" value={sPw2} onChange={e=>setSPw2(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
              </div>
              {sErr && <p className="err">{sErr}</p>}
              {sSuc && <p className="suc">{sSuc}</p>}
              <button className="btn-primary" onClick={handleSignup}>가입하기</button>
            </>
          )}
        </div>
      </div>
    </>
  );

  const isAdmin = user.role === "admin";
  const members = users.filter(u => u.role === "member");
  const totalJoins = sessions.reduce((a,s) => a + Object.values(s.participants).filter(v=>v==="join").length, 0);
  const totalSkips = sessions.reduce((a,s) => a + Object.values(s.participants).filter(v=>v==="skip").length, 0);
  const totalPend = sessions.length * members.length - totalJoins - totalSkips;

  const tabs = [
    { id:"schedule", label:"출결 신청", icon:"cal" },
    { id:"gallery",  label:"갤러리",   icon:"img" },
    { id:"rules",    label:"규칙/방법",  icon:"book" },
    { id:"board",    label:"자유게시판",icon:"msg" },
    { id:"mypage",   label:"내 정보",   icon:"trophy" },
    ...(isAdmin ? [{ id:"admin", label:"관리", icon:"admin" }] : []),
  ];

  return (
    <>
      <style>{CSS}</style>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      <div className="app">
        <header className="hdr">
          <div className="hdr-l">
            <div className="hdr-logo"><LogoMark size={58}/></div>
            <span className="hdr-name">배짱 Friday</span>
          </div>
          <div className="hdr-r">
            <div className="hdr-user"><span>{user.avatar}</span><span>{user.name}</span></div>
            <button className="ibtn" onClick={()=>{localStorage.removeItem("bjf_session");setUser(null);}}><Ic n="logout" s={16}/></button>
          </div>
        </header>

        <nav className="nav">
          {tabs.map(t => (
            <button key={t.id} className={`ntab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
              <Ic n={t.icon} s={14}/>{t.label}
            </button>
          ))}
        </nav>

        <main className="main">

          {/* ── 출결 신청 ── */}
          {tab==="schedule" && (
            <div className="slist">
              {/* 공지사항 배너 */}
              {announcements.length > 0 && (
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:4}}>
                  {announcements.map(a => (
                    <div key={a.id} style={{background:"rgba(245,197,66,0.07)",border:"1px solid rgba(245,197,66,0.3)",borderRadius:"var(--r)",padding:"14px 18px",display:"flex",gap:12,alignItems:"flex-start"}}>
                      <span style={{fontSize:20,flexShrink:0}}>📢</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:"var(--yw)",marginBottom:4}}>{a.title}</div>
                        <div style={{fontSize:13,color:"#c8c0a0",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{a.content}</div>
                        <div style={{fontSize:10,color:"var(--mu)",marginTop:6}}>{a.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {sessions.length === 0 && (
                <div style={{textAlign:"center",padding:"48px 0",color:"var(--mu)",fontSize:14}}>
                  등록된 리그전이 없습니다
                </div>
              )}
              {sessions.map((s,i) => {
                const myStatus = s.participants[user.id];
                const guestList = s.guests || [];
                const joinCount = Object.values(s.participants).filter(v=>v==="join").length + guestList.length;
                const closed = isDeadlinePassed(s.date);
                return (
                  <div className="scard" key={s.id}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <span className="snum">#{String(i+1).padStart(2,"0")}</span>
                        <div>
                          <div className="sdate">{fmtDate(s.date)}</div>
                          <div className="stime">⏰ 20:30 시작</div>
                          <div className="sdead">🔔 마감: 당일 17:00</div>
                          {s.note && <div style={{fontSize:11,color:"var(--ac)",marginTop:2}}>📌 {s.note}</div>}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",justifyContent:"flex-end"}}>
                        {s.fee > 0 && (
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:10,color:"var(--mu)",fontWeight:600,letterSpacing:"0.06em"}}>참가비</div>
                            <div style={{fontSize:22,fontWeight:900,color:"var(--yw)",lineHeight:1.1}}>₩{s.fee.toLocaleString()}</div>
                          </div>
                        )}
                        {closed && <span className="sbadge closed">마감됨</span>}
                        {isAdmin && (
                          confirmDeleteId === s.id
                            ? <div style={{display:"flex",gap:6,alignItems:"center"}}>
                                <span style={{fontSize:11,color:"var(--rd)",fontWeight:700}}>정말요?</span>
                                <button onClick={()=>deleteSession(s.id)} style={{background:"var(--rd)",border:"none",color:"#fff",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>확인</button>
                                <button onClick={()=>setConfirmDeleteId(null)} style={{background:"var(--s2)",border:"1px solid var(--bd)",color:"var(--mu)",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>취소</button>
                              </div>
                            : <button
                                onClick={()=>setConfirmDeleteId(s.id)}
                                style={{background:"rgba(255,79,107,0.12)",border:"1px solid rgba(255,79,107,0.3)",color:"var(--rd)",borderRadius:8,padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:700,fontFamily:"inherit"}}
                              ><Ic n="trash" s={13}/>삭제</button>
                        )}
                      </div>
                    </div>

                    <div style={{padding:"0 18px 16px",borderTop:"1px solid var(--bd)"}}>
                      <div className="arow" style={{marginTop:14}}>
                        {closed
                          ? <div className="btn-disabled">🔒 신청 마감 (17:00)</div>
                          : <>
                              <button className={`bjoin ${myStatus==="join"?"on":""}`} onClick={()=>toggleParticipant(s.id,"join")}><Ic n="check" s={15}/>참가</button>
                              <button className={`bskip ${myStatus==="skip"?"on":""}`} onClick={()=>toggleParticipant(s.id,"skip")}><Ic n="x" s={15}/>불참</button>
                            </>
                        }
                      </div>
                      <div className="pcnt" style={{marginTop:10}}><Ic n="users" s={13}/>현재 참가 예정: <strong style={{color:"var(--tx)",marginLeft:4}}>{joinCount}명</strong></div>
                      {joinCount > 0 && (
                        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
                          {users.filter(u => s.participants[u.id] === "join").map(u => (
                            <span key={u.id} style={{display:"inline-flex",alignItems:"center",gap:4,background:u.id===user.id?"rgba(79,124,255,0.15)":"var(--s2)",border:`1px solid ${u.id===user.id?"rgba(79,124,255,0.4)":"var(--bd)"}`,borderRadius:99,padding:"3px 10px",fontSize:12,color:u.id===user.id?"var(--ac)":"var(--tx)",fontWeight:u.id===user.id?700:400}}>
                              {u.avatar} {u.name}
                            </span>
                          ))}
                          {guestList.map(g => (
                            <span key={g.id} style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(245,197,66,0.1)",border:"1px solid rgba(245,197,66,0.3)",borderRadius:99,padding:"3px 10px",fontSize:12,color:"var(--yw)"}}>
                              🎳 {g.name}{g.average ? ` (ave ${g.average})` : ""}
                              {(isAdmin || g.addedBy === user.id) && (
                                <button onClick={()=>deleteGuest(g.id)} style={{background:"none",border:"none",color:"rgba(245,197,66,0.6)",cursor:"pointer",padding:0,marginLeft:2,display:"flex",alignItems:"center"}}>
                                  <Ic n="x" s={11}/>
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* ── 게스트 추가 ── */}
                      {!closed && (
                        <div style={{marginTop:10}}>
                          {showGuestForm[s.id] ? (
                            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                              <input
                                style={{flex:"1 1 100px",minWidth:80,background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:8,padding:"6px 10px",color:"var(--tx)",fontSize:12,fontFamily:"inherit",outline:"none"}}
                                placeholder="게스트 이름"
                                value={(guestInputs[s.id]||{}).name||""}
                                onChange={e=>setGuestInputs(prev=>({...prev,[s.id]:{...(prev[s.id]||{}),name:e.target.value}}))}
                                onKeyDown={e=>e.key==="Enter"&&addGuest(s.id)}
                              />
                              <input
                                type="number" min="0" max="300"
                                style={{width:70,background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:8,padding:"6px 8px",color:"var(--tx)",fontSize:12,fontFamily:"inherit",outline:"none"}}
                                placeholder="アベ"
                                value={(guestInputs[s.id]||{}).average||""}
                                onChange={e=>setGuestInputs(prev=>({...prev,[s.id]:{...(prev[s.id]||{}),average:e.target.value}}))}
                                onKeyDown={e=>e.key==="Enter"&&addGuest(s.id)}
                              />
                              <button onClick={()=>addGuest(s.id)} style={{background:"rgba(245,197,66,0.15)",border:"1px solid rgba(245,197,66,0.35)",color:"var(--yw)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>추가</button>
                              <button onClick={()=>setShowGuestForm(prev=>({...prev,[s.id]:false}))} style={{background:"var(--s2)",border:"1px solid var(--bd)",color:"var(--mu)",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>취소</button>
                            </div>
                          ) : (
                            <button onClick={()=>setShowGuestForm(prev=>({...prev,[s.id]:true}))} style={{background:"rgba(245,197,66,0.08)",border:"1px dashed rgba(245,197,66,0.35)",color:"var(--yw)",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:5}}>
                              <Ic n="plus" s={11}/>게스트 추가
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 회차별 자유 게시판 */}
                    <div style={{borderTop:"1px solid var(--bd)"}}>
                      {(s.comments||[]).length > 0 && (
                        <div style={{padding:"12px 18px",display:"flex",flexDirection:"column",gap:10}}>
                          {(s.comments||[]).map(c => (
                            <div key={c.id} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                              <span style={{fontSize:18,lineHeight:1}}>{c.avatar}</span>
                              <div style={{flex:1,background:"var(--s2)",borderRadius:10,padding:"8px 12px"}}>
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                                  <span style={{fontSize:12,fontWeight:700}}>{c.author}</span>
                                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                                    <span style={{fontSize:10,color:"var(--mu)"}}>{c.date}</span>
                                    {(isAdmin || c.author === user.name) && (
                                      <button onClick={()=>deleteSessionComment(s.id,c.id)} style={{background:"none",border:"none",color:"var(--mu)",cursor:"pointer",padding:0,display:"flex",alignItems:"center"}}>
                                        <Ic n="x" s={13}/>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div style={{fontSize:13,color:"#c0c8e0",lineHeight:1.5}}>{c.text}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{display:"flex",gap:8,padding:"10px 18px",borderTop:(s.comments||[]).length>0?"1px solid var(--bd)":"none"}}>
                        <span style={{fontSize:20,lineHeight:"36px"}}>{user.avatar}</span>
                        <input
                          style={{flex:1,background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:20,padding:"8px 14px",color:"var(--tx)",fontSize:13,fontFamily:"inherit",outline:"none"}}
                          placeholder="이 회차에 한마디..."
                          value={sessionCmtInputs[s.id]||""}
                          onChange={e=>setSessionCmtInputs(prev=>({...prev,[s.id]:e.target.value}))}
                          onKeyDown={e=>e.key==="Enter"&&submitSessionComment(s.id)}
                        />
                        <button
                          onClick={()=>submitSessionComment(s.id)}
                          style={{background:"var(--ac)",color:"#fff",border:"none",borderRadius:20,padding:"8px 14px",cursor:"pointer",display:"flex",alignItems:"center"}}
                        ><Ic n="send" s={15}/></button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* ── 갤러리 ── */}
          {tab==="gallery" && (
            <>
              <div className="sec-hdr"><div className="sec-ttl"><Ic n="img" s={18}/>사진 · 동영상</div></div>
              {showGalForm ? (
                <div className="form-box">
                  <div className="form-title">📸 새 게시물 업로드</div>
                  <div className="frow"><label>회차 (선택)</label><input placeholder="예: 4월 18일 리그전" value={galForm.sessionLabel} onChange={e=>setGalForm(p=>({...p,sessionLabel:e.target.value}))}/></div>
                  <div className="frow"><label>이미지 URL *</label><input placeholder="https://..." value={galForm.url} onChange={e=>setGalForm(p=>({...p,url:e.target.value}))}/></div>
                  <div className="frow"><label>설명 *</label><textarea rows={3} placeholder="사진 설명 입력" value={galForm.caption} onChange={e=>setGalForm(p=>({...p,caption:e.target.value}))}/></div>
                  <div className="fbtns"><button className="btn-ac" onClick={submitGallery}>업로드</button><button className="btn-ghost" onClick={()=>setShowGalForm(false)}>취소</button></div>
                </div>
              ) : (
                <button className="fab" onClick={()=>setShowGalForm(true)}><Ic n="plus" s={15}/>사진 · 동영상 올리기</button>
              )}
              <div className="gal-grid">
                {gallery.map(g=>(
                  <div className="gal-card" key={g.id}>
                    <img className="gal-img" src={g.url} alt={g.caption} loading="lazy"/>
                    <div className="gal-info">
                      <div className="gal-session">{g.sessionLabel}</div>
                      <div className="gal-caption">{g.caption}</div>
                      <div className="gal-meta"><span>{g.authorAvatar}</span><span>{g.author}</span><span style={{marginLeft:"auto"}}>{g.date}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── 규칙/방법 ── */}
          {tab==="rules" && (
            <>
              <div className="sec-hdr">
                <div className="sec-ttl"><Ic n="book" s={18}/>게임 방법 &amp; 규칙</div>
                {isAdmin && !showRuleForm && (
                  <button className="fab" style={{margin:0,padding:"8px 14px",fontSize:12}} onClick={()=>{setEditingRule(null);setRuleForm({icon:"📌",title:"",content:""});setShowRuleForm(true);}}>
                    <Ic n="plus" s={14}/>추가
                  </button>
                )}
              </div>

              {isAdmin && showRuleForm && (
                <div className="form-box" style={{marginBottom:16}}>
                  <div className="form-title">{editingRule ? "✏️ 항목 편집" : "➕ 새 항목 추가"}</div>
                  <div style={{display:"flex",gap:8,marginBottom:12}}>
                    {["⚽","📋","💰","🚫","📍","🏆","⏰","📢","🎯","💡","🔥","⚡"].map(em=>(
                      <button key={em} onClick={()=>setRuleForm(p=>({...p,icon:em}))}
                        style={{fontSize:20,background:ruleForm.icon===em?"rgba(79,124,255,0.2)":"var(--s2)",border:ruleForm.icon===em?"1px solid var(--ac)":"1px solid var(--bd)",borderRadius:8,padding:"4px 8px",cursor:"pointer"}}>
                        {em}
                      </button>
                    ))}
                  </div>
                  <div className="frow"><label>제목</label><input placeholder="예: 게임 방식" value={ruleForm.title} onChange={e=>setRuleForm(p=>({...p,title:e.target.value}))}/></div>
                  <div className="frow"><label>내용</label><textarea rows={3} placeholder="내용을 입력하세요" value={ruleForm.content} onChange={e=>setRuleForm(p=>({...p,content:e.target.value}))}/></div>
                  <div className="fbtns">
                    <button className="btn-ac" onClick={async ()=>{
                      if (!ruleForm.title || !ruleForm.content) return;
                      if (editingRule) {
                        await supabase.from("rules").update({ icon: ruleForm.icon, title: ruleForm.title, content: ruleForm.content }).eq("id", editingRule);
                      } else {
                        await supabase.from("rules").insert({ icon: ruleForm.icon, title: ruleForm.title, content: ruleForm.content, order_index: rules.length });
                      }
                      await loadRules();
                      setShowRuleForm(false); setEditingRule(null);
                    }}>저장</button>
                    <button className="btn-ghost" onClick={()=>{setShowRuleForm(false);setEditingRule(null);}}>취소</button>
                  </div>
                </div>
              )}

              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {rules.map(r=>(
                  <div key={r.id} style={{background:"var(--s1)",border:"1px solid var(--bd)",borderRadius:"var(--r)",overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 18px"}}>
                      <span style={{fontSize:28,lineHeight:1,flexShrink:0}}>{r.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{r.title}</div>
                        <div style={{fontSize:13,color:"#b0b8d0",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{r.content}</div>
                      </div>
                      {isAdmin && (
                        <div style={{display:"flex",gap:6,flexShrink:0}}>
                          <button onClick={()=>{setEditingRule(r.id);setRuleForm({icon:r.icon,title:r.title,content:r.content});setShowRuleForm(true);}}
                            style={{background:"rgba(79,124,255,0.1)",border:"1px solid rgba(79,124,255,0.25)",color:"var(--ac)",borderRadius:8,padding:"4px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}>
                            <Ic n="edit2" s={13}/>
                          </button>
                          <button onClick={async ()=>{ await supabase.from("rules").delete().eq("id", r.id); await loadRules(); }}
                            style={{background:"rgba(255,79,107,0.1)",border:"1px solid rgba(255,79,107,0.25)",color:"var(--rd)",borderRadius:8,padding:"4px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}>
                            <Ic n="trash" s={13}/>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {rules.length === 0 && (
                  <div style={{textAlign:"center",padding:"48px 0",color:"var(--mu)",fontSize:14}}>등록된 규칙이 없습니다</div>
                )}
              </div>
            </>
          )}

          {/* ── 자유게시판 ── */}
          {tab==="board" && (
            <>
              <div className="sec-hdr"><div className="sec-ttl"><Ic n="msg" s={18}/>자유게시판</div></div>
              {showPostForm ? (
                <div className="form-box">
                  <div className="form-title">✏️ 새 글 작성</div>
                  <div className="frow"><label>제목</label><input placeholder="제목 입력" value={postForm.title} onChange={e=>setPostForm(p=>({...p,title:e.target.value}))}/></div>
                  <div className="frow"><label>내용</label><textarea rows={4} placeholder="내용 입력" value={postForm.content} onChange={e=>setPostForm(p=>({...p,content:e.target.value}))}/></div>
                  <div className="fbtns"><button className="btn-ac" onClick={submitPost}>게시</button><button className="btn-ghost" onClick={()=>setShowPostForm(false)}>취소</button></div>
                </div>
              ) : (
                <button className="fab" onClick={()=>setShowPostForm(true)}><Ic n="plus" s={15}/>새 글 쓰기</button>
              )}
              <div className="post-list">
                {posts.map(p=>{
                  const isExpP = expandedPost===p.id;
                  const liked = (p.likedBy||[]).includes(user.id);
                  return (
                    <div className="post-card" key={p.id}>
                      <div className="post-hdr" onClick={()=>setExpandedPost(isExpP?null:p.id)}>
                        <div className="post-author"><span className="p-av">{p.avatar}</span><div><div className="p-name">{p.author}</div><div className="p-date">{p.date}</div></div></div>
                        <div className="post-title">{p.title}</div>
                        <div className="post-body-txt" style={{display:isExpP?"block":"-webkit-box",WebkitLineClamp:isExpP?"unset":2,WebkitBoxOrient:"vertical",overflow:isExpP?"visible":"hidden"}}>{p.content}</div>
                        <div className="post-foot">
                          <button className={`like-btn ${liked?"liked":""}`} onClick={e=>{e.stopPropagation();toggleLike(p.id);}}><Ic n="heart" s={13}/>{p.likes}</button>
                          <div className="cmt-cnt"><Ic n="msg" s={13}/>{p.comments.length}개의 댓글</div>
                        </div>
                      </div>
                      {isExpP && (
                        <div className="post-cmts">
                          {p.comments.map(c=>(
                            <div className="cmt" key={c.id}>
                              <div className="cmt-av">{c.avatar}</div>
                              <div className="cmt-body">
                                <div className="cmt-meta"><span className="cmt-name">{c.author}</span><span className="cmt-date">{c.date}</span></div>
                                <div className="cmt-txt">{c.text}</div>
                              </div>
                            </div>
                          ))}
                          <div className="cmt-form">
                            <input className="cmt-input" placeholder="댓글 입력..." value={cmtInputs[p.id]||""} onChange={e=>setCmtInputs(prev=>({...prev,[p.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&submitComment(p.id)}/>
                            <button className="cmt-send" onClick={()=>submitComment(p.id)}><Ic n="send" s={15}/></button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── 내 정보 ── */}
          {tab==="mypage" && (() => {
            const mySessions = sessions.map(s => ({
              ...s,
              status: s.participants[user.id],
              myScore: ((s.scores || {})[user.id]) || { games: [null,null,null,null,null] },
            }));
            const played = mySessions.filter(s => s.status === "join");
            const allScores = played.flatMap(s => (s.myScore.games || []).filter(g => g !== null && g !== undefined));
            const totalGames = allScores.length;
            const bestScore = totalGames > 0 ? Math.max(...allScores) : "—";
            const statBox = (label, val, color) => (
              <div style={{background:"var(--s1)",border:"1px solid var(--bd)",borderRadius:"var(--r)",padding:"16px",textAlign:"center"}}>
                <div style={{fontSize:11,color:"var(--mu)",marginBottom:8,fontWeight:600}}>{label}</div>
                <div style={{fontSize:28,fontWeight:900,color:color||"var(--tx)"}}>{val}</div>
              </div>
            );
            return (
              <>
                <div style={{background:"var(--s1)",border:"1px solid var(--bd)",borderRadius:"var(--r)",padding:"24px 20px",marginBottom:16}}>
                  {!editingProfile ? (
                    <div style={{display:"flex",alignItems:"center",gap:16}}>
                      <div style={{fontSize:52,lineHeight:1}}>{user.avatar}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:20,fontWeight:900}}>{user.name}</div>
                        <div style={{fontSize:12,color:"var(--mu)",marginTop:4}}>
                          {user.role === "admin" ? "👑 관리자" : "⚽ 멤버"}
                          {user.joinedAt && <span style={{marginLeft:10}}>가입일 {user.joinedAt}</span>}
                        </div>
                        {user.nickname && <div style={{fontSize:13,color:"var(--ac)",marginTop:4}}>닉네임: {user.nickname}</div>}
                        {user.birthday && <div style={{fontSize:12,color:"var(--mu)",marginTop:2}}>생년월일: {user.birthday}</div>}
                      </div>
                      <button className="ibtn" onClick={()=>{ setEditName(user.name); setEditNickname(user.nickname||""); setEditBirthday(user.birthday||""); setEditAvatar(user.avatar); setEditPw(""); setEditPw2(""); setProfileErr(""); setProfileSuc(""); setEditingProfile(true); }} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",fontSize:12,fontWeight:600}}>
                        <Ic n="edit2" s={14}/> 편집
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>프로필 편집</div>
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:11,color:"var(--mu)",marginBottom:6,fontWeight:600}}>아바타</div>
                        <div className="avatar-grid">
                          {AVATARS.map(a => (
                            <button key={a} className={`avatar-btn${editAvatar===a?" sel":""}`} onClick={()=>setEditAvatar(a)}>{a}</button>
                          ))}
                        </div>
                      </div>
                      {user.role !== "admin" && (
                        <div style={{marginBottom:10}}>
                          <div style={{fontSize:11,color:"var(--mu)",marginBottom:6,fontWeight:600}}>이름</div>
                          <input style={{width:"100%",background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:10,padding:"10px 12px",color:"var(--tx)",fontSize:14,fontFamily:"inherit",outline:"none"}} value={editName} onChange={e=>setEditName(e.target.value)} placeholder="이름"/>
                        </div>
                      )}
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:11,color:"var(--mu)",marginBottom:6,fontWeight:600}}>닉네임 (선택)</div>
                        <input style={{width:"100%",background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:10,padding:"10px 12px",color:"var(--tx)",fontSize:14,fontFamily:"inherit",outline:"none"}} value={editNickname} onChange={e=>setEditNickname(e.target.value)} placeholder="닉네임"/>
                      </div>
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:11,color:"var(--mu)",marginBottom:6,fontWeight:600}}>생년월일 (선택)</div>
                        <input type="date" style={{width:"100%",background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:10,padding:"10px 12px",color:"var(--tx)",fontSize:14,fontFamily:"inherit",outline:"none"}} value={editBirthday} onChange={e=>setEditBirthday(e.target.value)}/>
                      </div>
                      {user.role !== "admin" && (
                        <>
                          <div style={{marginBottom:10}}>
                            <div style={{fontSize:11,color:"var(--mu)",marginBottom:6,fontWeight:600}}>새 비밀번호 (변경 시에만 입력)</div>
                            <input type="password" style={{width:"100%",background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:10,padding:"10px 12px",color:"var(--tx)",fontSize:14,fontFamily:"inherit",outline:"none"}} value={editPw} onChange={e=>setEditPw(e.target.value)} placeholder="새 비밀번호"/>
                          </div>
                          <div style={{marginBottom:14}}>
                            <div style={{fontSize:11,color:"var(--mu)",marginBottom:6,fontWeight:600}}>비밀번호 확인</div>
                            <input type="password" style={{width:"100%",background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:10,padding:"10px 12px",color:"var(--tx)",fontSize:14,fontFamily:"inherit",outline:"none"}} value={editPw2} onChange={e=>setEditPw2(e.target.value)} placeholder="비밀번호 확인"/>
                          </div>
                        </>
                      )}
                      {profileErr && <div className="err" style={{marginBottom:8}}>{profileErr}</div>}
                      {profileSuc && <div className="suc" style={{marginBottom:8}}>{profileSuc}</div>}
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn-primary" style={{flex:1,margin:0}} onClick={saveProfile}>저장</button>
                        <button style={{background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:12,padding:"12px 18px",color:"var(--mu)",fontFamily:"inherit",fontSize:14,fontWeight:600,cursor:"pointer"}} onClick={()=>setEditingProfile(false)}>취소</button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                  {statBox("출전", played.length, "var(--ac)")}
                  {statBox("총 게임", totalGames, "var(--yw)")}
                  {statBox("최고 점수", bestScore, "var(--gn)")}
                </div>

                <div style={{background:"var(--s1)",border:"1px solid var(--bd)",borderRadius:"var(--r)",overflow:"hidden",marginBottom:16}}>
                  <div style={{padding:"14px 18px",borderBottom:"1px solid var(--bd)",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
                    <Ic n="users" s={15}/>출결 현황
                  </div>
                  <div style={{display:"flex",flexDirection:"column"}}>
                    {mySessions.map((s,i) => {
                      const joiners = users.filter(u => s.participants[u.id] === "join");
                      return (
                        <div key={s.id} style={{padding:"12px 18px",borderTop:i===0?"none":"1px solid var(--bd)",display:"flex",alignItems:"flex-start",gap:12}}>
                          <div style={{minWidth:110}}>
                            <div style={{fontSize:13,fontWeight:700}}>{fmtDate(s.date)}</div>
                            {s.note && <div style={{fontSize:10,color:"var(--ac)",marginTop:2}}>📌{s.note}</div>}
                          </div>
                          <div style={{flex:1}}>
                            {joiners.length === 0
                              ? <span style={{fontSize:12,color:"var(--mu)"}}>참가자 없음</span>
                              : <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                                  {joiners.map(u => (
                                    <span key={u.id} style={{display:"inline-flex",alignItems:"center",gap:4,background:u.id===user.id?"rgba(79,124,255,0.15)":"var(--s2)",border:`1px solid ${u.id===user.id?"rgba(79,124,255,0.4)":"var(--bd)"}`,borderRadius:99,padding:"3px 10px",fontSize:12,color:u.id===user.id?"var(--ac)":"var(--tx)",fontWeight:u.id===user.id?700:400}}>
                                      {u.avatar} {u.name}
                                    </span>
                                  ))}
                                </div>
                            }
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:s.status==="join"?"var(--gn)":s.status==="skip"?"var(--rd)":"var(--mu)",whiteSpace:"nowrap"}}>
                            {s.status==="join"?"✓ 참가":s.status==="skip"?"✕ 불참":"미정"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{background:"var(--s1)",border:"1px solid var(--bd)",borderRadius:"var(--r)",overflow:"hidden"}}>
                  <div style={{padding:"14px 18px",borderBottom:"1px solid var(--bd)",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
                    <Ic n="trophy" s={15}/>스코어카드 <span style={{fontSize:11,color:"var(--mu)",fontWeight:400,marginLeft:4}}>참가한 경기에 점수를 입력하세요</span>
                  </div>
                  <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
                    <thead>
                      <tr style={{background:"var(--s2)"}}>
                        <th style={{padding:"10px 14px",fontSize:11,color:"var(--mu)",textAlign:"left",fontWeight:600}}>날짜</th>
                        <th style={{padding:"10px 10px",fontSize:11,color:"var(--mu)",textAlign:"center",fontWeight:600}}>출결</th>
                        {[1,2,3,4,5].map(i=>(
                          <th key={i} style={{padding:"10px 8px",fontSize:11,color:"var(--mu)",textAlign:"center",fontWeight:600}}>G{i}</th>
                        ))}
                        <th style={{padding:"10px 10px",fontSize:11,color:"var(--gn)",textAlign:"center",fontWeight:600}}>토탈</th>
                        <th style={{padding:"10px 10px",fontSize:11,color:"var(--mu)",textAlign:"center",fontWeight:600}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mySessions.map(s => {
                        const key = `${s.id}_${user.id}`;
                        const inp = scoreInputs[key] || {};
                        const saved = s.myScore.games || [null,null,null,null,null];
                        const inpSt = {width:44,background:"var(--s2)",border:"1px solid var(--bd)",borderRadius:6,padding:"4px 4px",color:"var(--tx)",fontSize:13,fontWeight:700,fontFamily:"inherit",outline:"none",textAlign:"center"};
                        const rowScores = [1,2,3,4,5].map(i => {
                          const v = inp[`g${i}`];
                          return v !== undefined ? v : (saved[i-1] !== null && saved[i-1] !== undefined ? String(saved[i-1]) : "");
                        });
                        const validScores = rowScores.filter(v => v !== "" && !isNaN(parseInt(v))).map(Number);
                        const rowTotal = validScores.length > 0 ? validScores.reduce((a,b)=>a+b,0) : "—";
                        return (
                          <tr key={s.id} style={{borderTop:"1px solid var(--bd)"}}>
                            <td style={{padding:"8px 14px",fontSize:12}}>
                              {fmtDate(s.date)}
                              {s.note && <div style={{fontSize:10,color:"var(--ac)"}}>📌{s.note}</div>}
                            </td>
                            <td style={{padding:"8px 10px",textAlign:"center"}}>
                              <span style={{fontSize:11,fontWeight:700,color:s.status==="join"?"var(--gn)":s.status==="skip"?"var(--rd)":"var(--mu)"}}>
                                {s.status==="join"?"✓":s.status==="skip"?"✕":"—"}
                              </span>
                            </td>
                            {[1,2,3,4,5].map(i => (
                              <td key={i} style={{padding:"6px 6px",textAlign:"center"}}>
                                {s.status==="join"
                                  ? <input type="number" min="0" max="300" style={inpSt} value={rowScores[i-1]}
                                      onChange={e=>setScoreInputs(prev=>({...prev,[key]:{...(prev[key]||{}), [`g${i}`]:e.target.value}}))}
                                      onKeyDown={e=>e.key==="Enter"&&saveScore(s.id,user.id)}/>
                                  : <span style={{color:"var(--mu)",fontSize:12}}>—</span>}
                              </td>
                            ))}
                            <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,fontWeight:800,color:"var(--gn)"}}>{s.status==="join"?rowTotal:"—"}</td>
                            <td style={{padding:"6px 10px",textAlign:"center"}}>
                              {s.status==="join" && (
                                <button onClick={()=>saveScore(s.id,user.id)}
                                  style={{background:"rgba(79,124,255,0.15)",border:"1px solid rgba(79,124,255,0.35)",color:"var(--ac)",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>
                                  저장
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {mySessions.length === 0 && (
                        <tr><td colSpan={10} style={{padding:"32px",textAlign:"center",color:"var(--mu)",fontSize:13}}>아직 리그전이 없습니다</td></tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </>
            );
          })()}

          {/* ── 관리자 ── */}
          {tab==="admin" && isAdmin && (
            <>
              {/* ── 상품 관리 ── */}
              <div style={{marginBottom:24}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                    🛍️ 상품 관리 <span style={{fontSize:11,color:"var(--mu)",fontWeight:400}}>({products.length}개)</span>
                  </div>
                  {!showProductForm && !editingProduct && (
                    <button className="fab" style={{margin:0,padding:"7px 14px",fontSize:12}} onClick={()=>{ setProductForm({name:"",price:"",stock:"",description:""}); setShowProductForm(true); }}>
                      <Ic n="plus" s={13}/>상품 추가
                    </button>
                  )}
                </div>

                {(showProductForm || editingProduct) && (
                  <div className="form-box" style={{marginBottom:12}}>
                    <div className="form-title">{editingProduct ? "✏️ 상품 편집" : "🛍️ 새 상품 추가"}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div className="frow" style={{margin:0}}>
                        <label>상품명 *</label>
                        <input placeholder="예: 볼링공 클리너" value={productForm.name} onChange={e=>setProductForm(p=>({...p,name:e.target.value}))}/>
                      </div>
                      <div className="frow" style={{margin:0}}>
                        <label>가격 (원) *</label>
                        <input type="number" min="0" placeholder="0" value={productForm.price} onChange={e=>setProductForm(p=>({...p,price:e.target.value}))}/>
                      </div>
                      <div className="frow" style={{margin:0}}>
                        <label>재고 수량 *</label>
                        <input type="number" min="0" placeholder="0" value={productForm.stock} onChange={e=>setProductForm(p=>({...p,stock:e.target.value}))}/>
                      </div>
                      <div className="frow" style={{margin:0}}>
                        <label>설명 (선택)</label>
                        <input placeholder="상품 설명" value={productForm.description} onChange={e=>setProductForm(p=>({...p,description:e.target.value}))}/>
                      </div>
                    </div>
                    <div className="fbtns" style={{marginTop:12}}>
                      <button className="btn-ac" onClick={async ()=>{
                        if (!productForm.name.trim() || productForm.price === "" || productForm.stock === "") return;
                        const payload = { name: productForm.name.trim(), price: parseInt(productForm.price)||0, stock: parseInt(productForm.stock)||0, description: productForm.description.trim()||null };
                        if (editingProduct) {
                          await supabase.from("products").update(payload).eq("id", editingProduct.id);
                          setEditingProduct(null);
                        } else {
                          await supabase.from("products").insert(payload);
                          setShowProductForm(false);
                        }
                        setProductForm({name:"",price:"",stock:"",description:""});
                        await loadProducts();
                      }}>{editingProduct ? "저장" : "등록"}</button>
                      <button className="btn-ghost" onClick={()=>{ setShowProductForm(false); setEditingProduct(null); setProductForm({name:"",price:"",stock:"",description:""}); }}>취소</button>
                    </div>
                  </div>
                )}

                {products.length === 0 && !showProductForm && (
                  <div style={{fontSize:12,color:"var(--mu)",padding:"8px 0"}}>등록된 상품이 없습니다</div>
                )}

                <div className="product-grid">
                  {products.map(p => {
                    const stockClass = p.stock === 0 ? "stock-zero" : p.stock <= 3 ? "stock-low" : "stock-ok";
                    const stockLabel = p.stock === 0 ? "품절" : p.stock <= 3 ? `잔여 ${p.stock}개` : `재고 ${p.stock}개`;
                    const isDeleting = productDeleteId === p.id;
                    return (
                      <div className="product-card" key={p.id}>
                        <div className="product-card-top">
                          <div>
                            <div className="product-name">{p.name}</div>
                            {p.description && <div className="product-desc">{p.description}</div>}
                          </div>
                          <span className={`stock-badge ${stockClass}`}>{stockLabel}</span>
                        </div>
                        <div className="product-price">{p.price.toLocaleString()}<span>원</span></div>
                        <div className="product-actions">
                          <button className="btn-edit-sm" onClick={()=>{ setEditingProduct(p); setProductForm({name:p.name,price:String(p.price),stock:String(p.stock),description:p.description||""}); setShowProductForm(false); }}>
                            <Ic n="edit2" s={11}/>편집
                          </button>
                          {isDeleting ? (
                            <>
                              <button onClick={async ()=>{ await supabase.from("products").delete().eq("id",p.id); setProductDeleteId(null); await loadProducts(); }}
                                style={{background:"var(--rd)",border:"none",color:"#fff",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>확인</button>
                              <button onClick={()=>setProductDeleteId(null)}
                                style={{background:"var(--s2)",border:"1px solid var(--bd)",color:"var(--mu)",borderRadius:7,padding:"5px 8px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>취소</button>
                            </>
                          ) : (
                            <button className="del-btn" style={{padding:"5px 10px",fontSize:11}} onClick={()=>{ setProductDeleteId(p.id); setTimeout(()=>setProductDeleteId(null),4000); }}>
                              <Ic n="trash" s={11}/>삭제
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 공지사항 관리 ── */}
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>📢 공지사항 <span style={{fontSize:11,color:"var(--mu)",fontWeight:400}}>({announcements.length}건)</span></div>
                  {!showAnnoForm && (
                    <button className="fab" style={{margin:0,padding:"7px 14px",fontSize:12}} onClick={()=>setShowAnnoForm(true)}>
                      <Ic n="plus" s={13}/>공지 작성
                    </button>
                  )}
                </div>
                {showAnnoForm && (
                  <div className="form-box" style={{marginBottom:10}}>
                    <div className="form-title">📢 새 공지 작성</div>
                    <div className="frow"><label>제목 *</label><input placeholder="공지 제목" value={annoForm.title} onChange={e=>setAnnoForm(p=>({...p,title:e.target.value}))}/></div>
                    <div className="frow"><label>내용 *</label><textarea rows={3} placeholder="공지 내용을 입력하세요" value={annoForm.content} onChange={e=>setAnnoForm(p=>({...p,content:e.target.value}))}/></div>
                    <div className="fbtns">
                      <button className="btn-ac" onClick={async ()=>{
                        if (!annoForm.title.trim() || !annoForm.content.trim()) return;
                        await supabase.from("announcements").insert({ title: annoForm.title.trim(), content: annoForm.content.trim() });
                        setAnnoForm({title:"",content:""}); setShowAnnoForm(false);
                        await loadAnnouncements();
                      }}>등록</button>
                      <button className="btn-ghost" onClick={()=>{setShowAnnoForm(false);setAnnoForm({title:"",content:""});}}>취소</button>
                    </div>
                  </div>
                )}
                {announcements.length > 0 && (
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {announcements.map(a=>(
                      <div key={a.id} style={{background:"var(--s1)",border:"1px solid rgba(245,197,66,0.25)",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:10}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:"var(--yw)"}}>{a.title}</div>
                          <div style={{fontSize:12,color:"#b0a880",marginTop:3,whiteSpace:"pre-wrap"}}>{a.content}</div>
                          <div style={{fontSize:10,color:"var(--mu)",marginTop:4}}>{a.date}</div>
                        </div>
                        <button onClick={async ()=>{ await supabase.from("announcements").delete().eq("id", a.id); await loadAnnouncements(); }}
                          style={{background:"none",border:"none",color:"var(--mu)",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",padding:4}}>
                          <Ic n="trash" s={14}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {announcements.length === 0 && !showAnnoForm && (
                  <div style={{fontSize:12,color:"var(--mu)",padding:"8px 0"}}>등록된 공지가 없습니다</div>
                )}
              </div>

              {/* ── 새 리그 추가 ── */}
              <div style={{marginBottom:20}}>
                {showAddSession ? (
                  <div className="form-box" style={{marginBottom:0}}>
                    <div className="form-title">📅 새 리그전 추가</div>
                    <div className="frow">
                      <label>날짜 *</label>
                      <input
                        type="date"
                        value={addSessionForm.date}
                        onChange={e => setAddSessionForm(p => ({...p, date: e.target.value}))}
                        style={{colorScheme:"dark"}}
                      />
                    </div>
                    <div className="frow">
                      <label>메모 (선택)</label>
                      <input
                        placeholder="예: 특별 이벤트, 장소 변경 등"
                        value={addSessionForm.note}
                        onChange={e => setAddSessionForm(p => ({...p, note: e.target.value}))}
                      />
                    </div>
                    <div className="fbtns">
                      <button className="btn-ac" onClick={addSession}>추가하기</button>
                      <button className="btn-ghost" onClick={() => { setShowAddSession(false); setAddSessionForm({ date: "", note: "" }); }}>취소</button>
                    </div>
                  </div>
                ) : (
                  <button className="fab" onClick={() => setShowAddSession(true)}>
                    <Ic n="plus" s={15}/>새 리그전 추가
                  </button>
                )}
              </div>

              <div className="sgrid">
                <div className="sbox"><div className="slbl">참가</div><div className="sval g">{totalJoins}</div></div>
                <div className="sbox"><div className="slbl">불참</div><div className="sval r">{totalSkips}</div></div>
                <div className="sbox"><div className="slbl">미응답</div><div className="sval">{totalPend}</div></div>
              </div>

              <div className="section-label">MEMBER LIST ({members.length}명)</div>
              <div className="member-list">
                {members.length === 0 && <div style={{color:"var(--mu)",fontSize:13,padding:"12px 0"}}>아직 가입한 멤버가 없습니다.</div>}
                {members.map(m => {
                  const mySessions = sessions.map(s => ({ status: s.participants[m.id] }));
                  const joinCount = mySessions.filter(s => s.status === "join").length;
                  const skipCount = mySessions.filter(s => s.status === "skip").length;
                  const isConfirming = confirmDeleteUserId === m.id;
                  return (
                    <div className="member-row" key={m.id}>
                      <div className="member-row-top">
                        <div className="member-info">
                          <div className="member-av">{m.avatar}</div>
                          <div style={{minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                              <span className="member-name">{m.name}</span>
                              {m.nickname && <span style={{fontSize:12,color:"var(--ac)",fontWeight:600}}>「{m.nickname}」</span>}
                            </div>
                            <div className="member-meta">
                              <span>📅 가입 {m.joinedAt || "—"}</span>
                              {m.birthday && <span>🎂 {m.birthday}</span>}
                            </div>
                          </div>
                        </div>
                        {isConfirming ? (
                          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                            <span style={{fontSize:11,color:"var(--rd)",fontWeight:700,whiteSpace:"nowrap"}}>정말요?</span>
                            <button onClick={async ()=>{ await deleteUser(m.id); setConfirmDeleteUserId(null); }}
                              style={{background:"var(--rd)",border:"none",color:"#fff",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>확인</button>
                            <button onClick={()=>setConfirmDeleteUserId(null)}
                              style={{background:"var(--s2)",border:"1px solid var(--bd)",color:"var(--mu)",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>취소</button>
                          </div>
                        ) : (
                          <button className="del-btn" onClick={()=>{ setConfirmDeleteUserId(m.id); setTimeout(()=>setConfirmDeleteUserId(null),4000); }}><Ic n="trash" s={13}/>삭제</button>
                        )}
                      </div>
                      <div className="member-extra">
                        <div className="member-tag">출전 <b style={{color:"var(--gn)"}}>{joinCount}회</b></div>
                        <div className="member-tag">불참 <b style={{color:"var(--rd)"}}>{skipCount}회</b></div>
                        <div className="member-tag">미응답 <b>{sessions.length - joinCount - skipCount}회</b></div>
                        {m.birthday && (() => {
                          const diff = Math.floor((new Date() - new Date(m.birthday)) / (365.25 * 24 * 3600 * 1000));
                          return <div className="member-tag">나이 <b>{diff}세</b></div>;
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="section-label">출결 현황 / 참가비 설정</div>
              {sessions.map((s,i)=>{
                const joinCnt = Object.values(s.participants).filter(v=>v==="join").length;
                const skipCnt = Object.values(s.participants).filter(v=>v==="skip").length;
                const isExp = expanded===s.id;
                return (
                  <div className="acard" key={s.id}>
                    <div style={{padding:"14px 18px",borderBottom:"1px solid var(--bd)"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span className="snum">#{String(i+1).padStart(2,"0")}</span>
                          <div>
                            <div className="sdate" style={{fontSize:14}}>{fmtDate(s.date)}</div>
                            <div className="stime">20:30〜 / 마감 17:00</div>
                            {s.note && <div style={{fontSize:11,color:"var(--ac)",marginTop:2}}>📌 {s.note}</div>}
                          </div>
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span className="spill g">참가 {joinCnt}명</span>
                          <span className="spill r">불참 {skipCnt}명</span>
                          {confirmDeleteId === s.id
                            ? <div style={{display:"flex",gap:6,alignItems:"center"}}>
                                <span style={{fontSize:11,color:"var(--rd)",fontWeight:700}}>정말요?</span>
                                <button onClick={()=>deleteSession(s.id)} style={{background:"var(--rd)",border:"none",color:"#fff",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>확인</button>
                                <button onClick={()=>setConfirmDeleteId(null)} style={{background:"var(--s2)",border:"1px solid var(--bd)",color:"var(--mu)",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>취소</button>
                              </div>
                            : <button
                                onClick={()=>setConfirmDeleteId(s.id)}
                                style={{background:"rgba(255,79,107,0.1)",border:"1px solid rgba(255,79,107,0.25)",color:"var(--rd)",borderRadius:8,padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:700,fontFamily:"inherit"}}
                              ><Ic n="trash" s={13}/>삭제</button>
                          }
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(245,197,66,0.06)",border:"1px solid rgba(245,197,66,0.2)",borderRadius:10,padding:"10px 14px"}}>
                        <span style={{fontSize:18}}>💰</span>
                        <span style={{fontSize:12,color:"var(--mu)",fontWeight:600,whiteSpace:"nowrap"}}>참가비</span>
                        <input
                          className="fee-input"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={feeInputs[s.id] !== undefined ? feeInputs[s.id] : String(s.fee || 0)}
                          onChange={e => setFeeInputs(prev => ({...prev, [s.id]: e.target.value}))}
                          onKeyDown={e => e.key === "Enter" && updateFee(s.id)}
                          style={{flex:1,minWidth:0}}
                        />
                        <span style={{fontSize:13,color:"var(--mu)",fontWeight:700}}>₩</span>
                        <button className="fee-save" onClick={() => updateFee(s.id)}>저장</button>
                        {s.fee > 0 && (
                          <span style={{fontSize:11,color:"var(--yw)",whiteSpace:"nowrap"}}>현재: ₩{s.fee.toLocaleString()}</span>
                        )}
                      </div>
                      {s.fee > 0 && joinCnt > 0 && (
                        <div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}>
                          <span style={{color:"var(--mu)"}}>예상 총액 ({joinCnt}명 × ₩{s.fee.toLocaleString()})</span>
                          <span style={{color:"var(--gn)",fontWeight:800,fontSize:14}}>₩{(s.fee * joinCnt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    {/* 🎳 스코어 입력 */}
                    <div style={{borderTop:"1px solid var(--bd)",padding:"14px 18px"}}>
                      <div style={{fontSize:12,color:"var(--tx)",fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
                        🎳 스코어 입력
                        {members.filter(m=>s.participants[m.id]==="join").length===0 && (
                          <span style={{fontSize:11,color:"var(--mu)",fontWeight:400}}>— 참가 신청한 멤버가 없습니다</span>
                        )}
                      </div>
                      {members.filter(m => s.participants[m.id] === "join").map(m => {
                        const key = `${s.id}_${m.id}`;
                        const savedGames = (((s.scores || {})[m.id]) || {}).games || [null,null,null,null,null];
                        const inp = scoreInputs[key] || {};
                        const inputSt = {width:48,background:"var(--bg)",border:"1px solid var(--bd)",borderRadius:8,padding:"5px 6px",color:"var(--tx)",fontSize:13,fontWeight:700,fontFamily:"inherit",outline:"none",textAlign:"center"};
                        return (
                          <div key={m.id} style={{marginBottom:10,padding:"10px 12px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bd)"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                              <span style={{fontSize:18}}>{m.avatar}</span>
                              <span style={{fontSize:13,fontWeight:700}}>{m.name}</span>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                              {[1,2,3,4,5].map(i => {
                                const v = inp[`g${i}`];
                                const val = v !== undefined ? v : (savedGames[i-1] !== null && savedGames[i-1] !== undefined ? String(savedGames[i-1]) : "");
                                return (
                                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                                    <span style={{fontSize:10,color:"var(--mu)",fontWeight:600}}>G{i}</span>
                                    <input type="number" min="0" max="300" style={inputSt} value={val}
                                      onChange={e=>setScoreInputs(prev=>({...prev,[key]:{...(prev[key]||{}), [`g${i}`]:e.target.value}}))}/>
                                  </div>
                                );
                              })}
                              <button onClick={()=>saveScore(s.id,m.id)}
                                style={{background:"linear-gradient(135deg,var(--ac),var(--ac2))",border:"none",color:"#fff",borderRadius:8,padding:"6px 16px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",marginTop:16,alignSelf:"flex-end",boxShadow:"0 4px 12px rgba(79,124,255,0.3)"}}>
                                저장
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 출결 명단 */}
                    <div className="acard-hdr" onClick={()=>setExpanded(isExp?null:s.id)} style={{padding:"10px 18px",borderTop:"1px solid var(--bd)"}}>
                      <span style={{fontSize:12,color:"var(--mu)",fontWeight:600}}>출결 명단 보기</span>
                      {chev(isExp)}
                    </div>
                    {isExp && (
                      <div className="abody">
                        <table className="ptbl">
                          <thead><tr><th>멤버</th><th>출결</th></tr></thead>
                          <tbody>
                            {members.map(m=>{
                              const st = s.participants[m.id];
                              return (
                                <tr key={m.id}>
                                  <td><span style={{marginRight:6}}>{m.avatar}</span>{m.name}</td>
                                  <td><span className={st==="join"?"sj":st==="skip"?"ss":"sn"}>{st==="join"?"✓ 참가":st==="skip"?"✕ 불참":"—"}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

        </main>
      </div>
    </>
  );
}
