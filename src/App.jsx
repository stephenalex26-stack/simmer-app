import { useState, useRef } from "react";

/*  SIMMER v5.2 — simmer-app.netlify.app
    New in v5:
    • Custom stores per user (onboarding + settings)
    • Receipt/purchase scanner — photo, manual text, paste email
    • Purchase history with AI learning
    • Shopping list split by store
    • Restock store dropdown uses user's custom stores
    v5.1 fixes:
    • Ingredient accountability — every ingredient named in steps
    • Adventure suggestion — one fun cuisine-stretch recipe per plan
    v5.2 additions:
    • PDF receipt support (Costco + any text PDF) via PDF.js client-side extraction  */

const LS={r:"sm4-recipes",p:"sm4-prefs",pl:"sm4-plan",s:"sm4-supplies",ck:"sm4-checked",rt:"sm4-ratings",pa:"sm4-pantry",hi:"sm4-history",ph:"sm5-purchases"};
const ld=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};

const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const RECIPES=[
{id:"1",name:"Sheet Pan Chicken Fajitas",time:25,servings:4,favorite:true,ingredients:"1.5 lb chicken thighs (sliced thin), 3 bell peppers (sliced), 1 large onion (sliced), 2 tbsp olive oil, 2 tbsp fajita seasoning, 8 flour tortillas, 1 lime (juiced), 1/4 cup cilantro, 1/2 cup sour cream, 1/2 cup salsa",prep:"Toss chicken with 2 tbsp oil + 2 tbsp fajita seasoning. Slice peppers and onion. Store separately.",finish:"Preheat 400°F. Sheet pan, single layer, 20 min. Squeeze lime. Warm tortillas 30 sec. Serve with toppings.",source:""},
{id:"2",name:"One-Pot Bolognese",time:30,servings:6,favorite:false,ingredients:"1 lb ground beef, 1 onion (diced), 3 garlic cloves, 28oz crushed tomatoes, 2 tbsp tomato paste, 1 lb spaghetti, 2 tbsp olive oil, 1.5 tsp Italian seasoning, 1/2 tsp salt, 2 tbsp parsley, 1/2 cup parmesan",prep:"Brown beef 5 min. Add onion 3 min, garlic 1 min. Stir in tomatoes, paste, seasoning. Simmer 10 min. Refrigerate.",finish:"Reheat sauce. Boil pasta 8-10 min. Toss. Top with parsley + parmesan.",source:""},
{id:"3",name:"Teriyaki Salmon Bowls",time:20,servings:4,favorite:true,ingredients:"4 salmon fillets (6oz), 3 cups rice, 1/4 cup soy sauce, 2 tbsp honey, 1 tbsp rice vinegar, 1 tsp sesame oil, 1 tsp cornstarch + 1 tbsp water, 1 cucumber, 2 avocados, sesame seeds, green onion",prep:"Glaze: whisk soy sauce + honey + rice vinegar + sesame oil, simmer, add cornstarch slurry 2 min. Cook rice. Slice cucumber.",finish:"Sear salmon 4 min/side, baste with glaze. Assemble bowls: rice, salmon, cucumber, avocado, sesame seeds, green onion.",source:""},
{id:"4",name:"Chicken Stir-Fry",time:20,servings:4,favorite:false,ingredients:"1.5 lb chicken breast (cubed), 2 bell peppers, 1 broccoli crown, 2 carrots, 3 garlic cloves, 1/4 cup soy sauce, 1 tbsp cornstarch, 1 tbsp sesame oil, 1 tbsp vegetable oil, 3 cups rice, sesame seeds",prep:"Cube chicken. Chop veggies. Sauce: 1/4 cup soy + 1 tbsp cornstarch + 1 tbsp sesame oil + garlic. Cook rice.",finish:"High heat wok: chicken 5 min, veggies 4 min, sauce 2 min. Serve over rice.",source:""},
{id:"5",name:"Black Bean Taco Bowls",time:15,servings:4,favorite:false,ingredients:"2 cans black beans, 2 cups rice, 1 cup corn, 2 bell peppers (diced), 1 avocado, 1/4 cup cilantro, 1 lime, 1 tsp cumin, 1 tsp chili powder, salsa, sour cream, cheese",prep:"Cook rice. Season beans: cumin + chili powder + 2 tbsp water, warm 5 min. Dice peppers.",finish:"Reheat rice + beans. Assemble: rice, beans, corn, peppers, avocado, cilantro, salsa, cheese, lime.",source:""},
{id:"6",name:"Pesto Chicken & Potatoes",time:30,servings:4,favorite:false,ingredients:"4 chicken thighs, 1.5 lb baby potatoes (halved), 1/2 cup pesto, 3 tbsp olive oil, cherry tomatoes, 3/4 tsp salt, 1/2 tsp pepper, basil, parmesan",prep:"Halve potatoes. Coat chicken with pesto.",finish:"400°F. Potatoes + oil + salt + pepper on pan. Add chicken + tomatoes. 25-30 min until 165°F. Top basil + parm.",source:""},
];
const SUPPLIES=[
{id:"s1",name:"Paper Towels",where:"Costco",weeks:4,last:null},{id:"s2",name:"Toilet Paper",where:"Costco",weeks:5,last:null},{id:"s3",name:"Trash Bags",where:"Costco",weeks:6,last:null},{id:"s4",name:"Dishwasher Pods",where:"Costco",weeks:5,last:null},{id:"s5",name:"Goldfish Crackers",where:"Costco",weeks:3,last:null},{id:"s6",name:"Granola Bars",where:"Costco",weeks:3,last:null},{id:"s7",name:"String Cheese",where:"Costco",weeks:2,last:null},{id:"s8",name:"Laundry Detergent",where:"Costco",weeks:8,last:null},
];
const DEF_PREFS={meals:5,time:30,prepDays:["Sunday"],adults:2,kids:3,diet:"",proteinPriority:"medium",maxPastaPerWeek:2,maxRedMeatPerWeek:2,stores:["Wegmans","Costco"]};

/* ── icons ── */
const I={
spark:<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41Z"/></svg>,
plus:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
check:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
x:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
chev:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
copy:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
trash:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
refresh:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
edit:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
swap:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
heart:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
heartOn:<svg width="18" height="18" viewBox="0 0 24 24" fill="#e25555" stroke="#e25555" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
up:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
down:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>,
gear:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
camera:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
receipt:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>,
store:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
history:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
split:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="M21 3l-7.828 7.828A4 4 0 0 0 12 13.7V22"/></svg>,
};

/* ── CSS ── */
const css=`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,700&family=Nunito+Sans:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#FFFCF7;--card:#FFF;--sand:#F0EBDF;--sd:#DDD6C6;--ink:#201C14;--i2:#5E5646;--i3:#9A917E;--i4:#C4BAA8;--ru:#C04E28;--ruh:#A8421F;--rub:#FEF0EB;--sa:#3F7A52;--sab:#EDF6F0;--am:#B07D10;--amb:#FFF8E7;--rb:#FEF2F0;--rd:#C23A2A;--bl:#1E6FB0;--blb:#EEF5FC;--r:14px;--sh:0 1px 4px rgba(32,28,20,.06);--s2:0 6px 24px rgba(32,28,20,.1);--hd:'Fraunces',Georgia,serif;--bd:'Nunito Sans',-apple-system,sans-serif}
html,body{font-family:var(--bd);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;min-height:100dvh}
.shell{min-height:100dvh;display:flex;flex-direction:column;padding-bottom:72px}
.page{flex:1;max-width:560px;margin:0 auto;padding:20px 16px;width:100%}
.bnav{position:fixed;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid var(--sd);display:flex;z-index:100;padding:6px 0 env(safe-area-inset-bottom,8px)}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border:none;background:none;color:var(--i3);font-family:var(--bd);font-size:10.5px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent}.nb.on{color:var(--ru)}.nb.on svg{stroke:var(--ru)}
.hd{font-family:var(--hd)}.pg-t{font-family:var(--hd);font-size:28px;font-weight:500;letter-spacing:-.5px}.pg-s{color:var(--i2);font-size:14px;margin-top:4px;margin-bottom:20px}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:16px;border:none;border-radius:var(--r);font-family:var(--bd);font-size:15px;font-weight:700;cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent}
.bg{background:var(--ru);color:#fff}.bg:hover{background:var(--ruh)}.bg:active{transform:scale(.98)}.bg:disabled{opacity:.4;cursor:default;transform:none}
.bs{background:var(--sand);color:var(--ink)}.bs:active{background:var(--sd)}
.bo{background:none;border:1.5px solid var(--sd);color:var(--i2);width:auto;padding:10px 16px;font-size:13px}.bo:active{background:var(--sand)}
.bsm{width:auto;padding:10px 18px;font-size:13px}
.bbl{background:var(--blb);color:var(--bl);border:1.5px solid #B8D4EE}
.cd{background:var(--card);border:1px solid var(--sand);border-radius:var(--r);padding:20px;box-shadow:var(--sh);margin-bottom:12px}
.hcard{background:var(--card);border:1px solid var(--sand);border-radius:16px;padding:20px;margin-bottom:12px;box-shadow:var(--sh);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:box-shadow .15s}.hcard:active{box-shadow:var(--s2)}
.hcard-icon{font-size:28px;margin-bottom:8px}.hcard-title{font-family:var(--hd);font-size:17px;font-weight:500;margin-bottom:4px}.hcard-desc{font-size:13px;color:var(--i2);line-height:1.45}
.tonight{background:linear-gradient(135deg,var(--rub) 0%,#FFF 60%,var(--sab) 100%);border:1.5px solid var(--sd);border-radius:18px;padding:24px 20px;margin-bottom:16px}
.tonight-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--i3);margin-bottom:6px}
.tonight-meal{font-family:var(--hd);font-size:22px;font-weight:500;margin-bottom:4px}
.tonight-time{font-size:13px;color:var(--ru);font-weight:600}
.tonight-steps{margin-top:12px;font-size:13.5px;color:var(--i2);line-height:1.55}
.tonight-sub{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--i3);margin-top:10px;margin-bottom:3px}
.nudge{display:flex;align-items:flex-start;gap:10px;padding:14px;border-radius:var(--r);margin-bottom:12px;font-size:13px;line-height:1.45}
.nudge-am{background:var(--amb);color:#7A5A08}.nudge-sa{background:var(--sab);color:var(--sa)}.nudge-ru{background:var(--rub);color:var(--ru)}.nudge-bl{background:var(--blb);color:var(--bl)}
.dots{display:flex;gap:6px;justify-content:center;padding:16px}.dots span{width:8px;height:8px;background:var(--ru);border-radius:50%;animation:pop 1.4s ease infinite}.dots span:nth-child(2){animation-delay:.2s}.dots span:nth-child(3){animation-delay:.4s}
@keyframes pop{0%,80%,100%{transform:scale(.5);opacity:.3}40%{transform:scale(1);opacity:1}}
.prb{background:var(--sab);border:1px solid #C5DEC9;border-radius:var(--r);padding:16px;margin-bottom:16px}
.prb-t{font-family:var(--hd);font-size:16px;font-weight:500;color:var(--sa);margin-bottom:10px}
.prb ol{list-style:none;counter-reset:p;padding:0}.prb li{counter-increment:p;font-size:13.5px;color:#2B5E3B;padding:5px 0 5px 28px;position:relative;line-height:1.45}.prb li::before{content:counter(p);position:absolute;left:0;width:20px;height:20px;background:#C5DEC9;color:var(--sa);border-radius:50%;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;top:6px}
.dc{background:var(--card);border:1px solid var(--sand);border-radius:var(--r);margin-bottom:8px;overflow:hidden;box-shadow:var(--sh)}
.dc-top{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent}.dc-top:active{background:var(--sand)}
.dc-day{font-family:var(--hd);font-size:15px;font-weight:500}.dc-meal{font-size:13px;color:var(--i2);margin-top:1px}
.dc-time{font-size:12px;font-weight:600;color:var(--ru);background:var(--rub);padding:3px 10px;border-radius:20px}
.dc-body{padding:4px 16px 14px;border-top:1px solid var(--sand)}
.dc-lb{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--i3);margin-top:10px;margin-bottom:3px}
.dc-tx{font-size:13.5px;line-height:1.5;color:var(--i2)}
.sp{font-size:11px;padding:2px 8px;background:var(--sab);color:var(--sa);border-radius:12px;font-weight:600;display:inline-block;margin:2px 2px 0 0}
.rate-row{display:flex;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--sand)}
.rate-btn{display:flex;align-items:center;gap:4px;padding:6px 12px;border:1.5px solid var(--sd);border-radius:8px;background:none;font-family:var(--bd);font-size:12px;font-weight:600;color:var(--i3);cursor:pointer}.rate-btn:active{background:var(--sand)}.rate-btn.loved{border-color:var(--sa);color:var(--sa);background:var(--sab)}.rate-btn.skip{border-color:var(--rd);color:var(--rd);background:var(--rb)}
.swbtn{display:flex;align-items:center;gap:5px;margin-top:10px;padding:8px 14px;border:1.5px solid var(--sd);border-radius:10px;background:none;font-family:var(--bd);font-size:12px;font-weight:600;color:var(--i3);cursor:pointer}.swbtn:active{background:var(--sand)}
.swpick{margin-top:10px;padding-top:10px;border-top:1px solid var(--sand)}
.swopt{display:flex;justify-content:space-between;align-items:center;padding:10px;border:1.5px solid var(--sd);border-radius:10px;margin-bottom:6px;cursor:pointer}.swopt:active{background:var(--sand)}
.shcat{margin-bottom:14px}.shcat-t{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--i3);padding-bottom:6px;border-bottom:1px solid var(--sand);margin-bottom:4px}
.shrow{display:flex;align-items:center;gap:12px;padding:10px 4px;cursor:pointer;border-radius:8px;-webkit-tap-highlight-color:transparent}.shrow:active{background:var(--sand)}.shrow.ck{opacity:.35;text-decoration:line-through}
.shchk{width:22px;height:22px;border:2px solid var(--sd);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:transparent}.shrow.ck .shchk{background:var(--sa);border-color:var(--sa);color:#fff}
.store-section{margin-bottom:20px}
.store-header{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--sand);border-radius:10px 10px 0 0;border:1px solid var(--sd);border-bottom:none}
.store-header-name{font-family:var(--hd);font-size:15px;font-weight:500}
.store-body{border:1px solid var(--sd);border-radius:0 0 10px 10px;padding:4px 8px 8px;background:var(--card)}
.rc{background:var(--card);border:1px solid var(--sand);border-radius:var(--r);padding:16px;margin-bottom:10px;box-shadow:var(--sh)}
.rc-top{display:flex;justify-content:space-between;align-items:flex-start}
.rc-name{font-family:var(--hd);font-size:16px;font-weight:500}
.rc-meta{display:flex;gap:6px;margin-top:5px;flex-wrap:wrap}
.pill{font-size:11px;font-weight:600;padding:2px 9px;border-radius:12px}
.fav-btn{border:none;background:none;cursor:pointer;padding:4px;color:var(--i4)}.fav-btn.on{color:#e25555}
.rx{padding:12px 0 0;border-top:1px solid var(--sand);margin-top:10px;font-size:13px;color:var(--i2);line-height:1.55}
.rx-lb{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--i3);margin-top:8px;margin-bottom:3px}
.scard{background:var(--card);border:1px solid var(--sand);border-radius:var(--r);padding:14px 16px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;box-shadow:var(--sh)}
.badge{padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}.badge-r{background:var(--rb);color:var(--rd)}.badge-a{background:var(--amb);color:var(--am)}.badge-g{background:var(--sab);color:var(--sa)}
.ib{width:36px;height:36px;border:none;background:none;color:var(--i4);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer}.ib:active{background:var(--sand)}.ib.dng:active{background:var(--rb);color:var(--rd)}
.ov{position:fixed;inset:0;background:rgba(32,28,20,.35);backdrop-filter:blur(3px);z-index:200;display:flex;align-items:flex-end;justify-content:center;animation:fi .15s}@media(min-width:600px){.ov{align-items:center}}
.mdl{background:var(--card);width:100%;max-width:500px;max-height:90dvh;overflow-y:auto;box-shadow:var(--s2);animation:su .25s;border-radius:20px 20px 0 0}@media(min-width:600px){.mdl{border-radius:20px}}
.mdl-hd{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--sand);position:sticky;top:0;background:var(--card);z-index:1;border-radius:20px 20px 0 0}
.mdl-hd h3{font-family:var(--hd);font-size:18px;font-weight:500}
.mdl-bd{padding:20px}.mdl-ft{padding:14px 20px;border-top:1px solid var(--sand);display:flex;gap:8px}.mdl-ft .btn{flex:1}
.fg{margin-bottom:14px}.fl{display:block;font-size:12.5px;font-weight:700;margin-bottom:5px}.fl small{color:var(--i3);font-weight:400}
.fi{width:100%;padding:12px 14px;border:1.5px solid var(--sd);border-radius:10px;font-family:var(--bd);font-size:15px;color:var(--ink);background:var(--card);outline:none;-webkit-appearance:none}.fi:focus{border-color:var(--ru);box-shadow:0 0 0 3px rgba(192,78,40,.1)}
.fta{width:100%;padding:12px 14px;border:1.5px solid var(--sd);border-radius:10px;font-family:var(--bd);font-size:15px;color:var(--ink);background:var(--card);outline:none;min-height:80px;resize:vertical;line-height:1.5}.fta:focus{border-color:var(--ru);box-shadow:0 0 0 3px rgba(192,78,40,.1)}
.fsel{width:100%;padding:12px 14px;border:1.5px solid var(--sd);border-radius:10px;font-family:var(--bd);font-size:15px;color:var(--ink);background:var(--card);outline:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='12' height='8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239A917E' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.dpick{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.dchip{padding:8px 14px;border:1.5px solid var(--sd);border-radius:20px;background:none;font-family:var(--bd);font-size:13px;font-weight:600;color:var(--i3);cursor:pointer}.dchip:active{transform:scale(.95)}.dchip.on{background:var(--ru);border-color:var(--ru);color:#fff}
.toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:var(--s2);animation:su .15s;z-index:300;white-space:nowrap}
.err-bar{background:var(--rb);color:var(--rd);padding:12px 16px;border-radius:var(--r);margin-bottom:14px;font-size:13px}
.ob{max-width:420px;margin:0 auto;padding:48px 20px;text-align:center}
.ob-logo{width:56px;height:56px;background:var(--rub);border:2px solid #EAC4B8;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:30px}
.ob h2{font-family:var(--hd);font-size:26px;margin-bottom:8px}.ob>p{color:var(--i2);font-size:14px;margin-bottom:32px;line-height:1.55}.ob .fg{text-align:left}
/* upload zone */
.upload-zone{border:2px dashed var(--sd);border-radius:var(--r);padding:28px 20px;text-align:center;cursor:pointer;background:var(--bg);transition:border-color .15s}.upload-zone:hover,.upload-zone.drag{border-color:var(--ru);background:var(--rub)}.upload-zone input{display:none}
/* purchase history */
.ph-card{background:var(--card);border:1px solid var(--sand);border-radius:var(--r);padding:14px 16px;margin-bottom:8px;box-shadow:var(--sh)}
.ph-store-badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;background:var(--blb);color:var(--bl);margin-right:6px}
/* store tag chips */
.store-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:20px;font-size:12px;font-weight:600;margin:3px;cursor:default}
.store-chip-rm{border:none;background:none;cursor:pointer;color:inherit;opacity:.6;font-size:14px;line-height:1;padding:0 0 0 2px}.store-chip-rm:hover{opacity:1}
/* tabs strip */
.tab-strip{display:flex;gap:4px;margin-bottom:16px;overflow-x:auto;padding-bottom:2px}
.tab-btn{padding:7px 14px;border-radius:20px;border:1.5px solid var(--sd);background:none;font-family:var(--bd);font-size:12.5px;font-weight:600;color:var(--i3);cursor:pointer;white-space:nowrap}.tab-btn.on{background:var(--ru);border-color:var(--ru);color:#fff}
@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
`;

export default function App(){
  const[recipes,setRecipes]=useState(()=>ld(LS.r,RECIPES));
  const[prefs,setPrefs]=useState(()=>ld(LS.p,DEF_PREFS));
  const[plan,setPlan]=useState(()=>ld(LS.pl,null));
  const[supplies,setSupplies]=useState(()=>ld(LS.s,SUPPLIES));
  const[checked,setChecked]=useState(()=>ld(LS.ck,{}));
  const[ratings,setRatings]=useState(()=>ld(LS.rt,{}));
  const[tab,setTab]=useState("home");
  const[modal,setModal]=useState(null);
  const[loading,setLoading]=useState(false);
  const[swapping,setSwapping]=useState(null);
  const[swapPicker,setSwapPicker]=useState(null);
  const[expanded,setExpanded]=useState({});
  const[recExp,setRecExp]=useState({});
  const[toast,setToast]=useState(null);
  const[error,setError]=useState(null);
  const[onboarded,setOnboarded]=useState(()=>!!ld(LS.p,null));
  const[importText,setImportText]=useState("");
  const[importing,setImporting]=useState(false);
  const[pantry,setPantry]=useState(()=>ld(LS.pa,["salt","black pepper","olive oil","garlic","butter"]));
  const[history,setHistory]=useState(()=>ld(LS.hi,[]));
  const[purchases,setPurchases]=useState(()=>ld(LS.ph,[]));
  const[extraItems,setExtraItems]=useState([]);
  const[addingItem,setAddingItem]=useState("");
  const[shopFilter,setShopFilter]=useState("all");
  const[shopView,setShopView]=useState("combined"); // "combined" | "by-store"
  const[scanText,setScanText]=useState("");
  const[scanning,setScanning]=useState(false);
  const[scannedResult,setScannedResult]=useState(null);
  const[storeInput,setStoreInput]=useState("");
  const[adventureExpanded,setAdventureExpanded]=useState(false);
  const[adventureLoading,setAdventureLoading]=useState(false);
  const[adventureSwapMode,setAdventureSwapMode]=useState(false);
  const fileRef=useRef();

  // derived: user's stores
  const userStores=prefs.stores||["Wegmans","Costco"];

  const sR=v=>{setRecipes(v);sv(LS.r,v)};
  const sP=v=>{setPrefs(v);sv(LS.p,v)};
  const sPl=v=>{setPlan(v);sv(LS.pl,v)};
  const sS=v=>{setSupplies(v);sv(LS.s,v)};
  const sC=v=>{setChecked(v);sv(LS.ck,v)};
  const sRt=v=>{setRatings(v);sv(LS.rt,v)};
  const sPa=v=>{setPantry(v);sv(LS.pa,v)};
  const sHi=v=>{setHistory(v);sv(LS.hi,v)};
  const sPh=v=>{setPurchases(v);sv(LS.ph,v)};

  const flash=m=>{setToast(m);setTimeout(()=>setToast(null),2200)};
  const toggleFav=id=>sR(recipes.map(r=>r.id===id?{...r,favorite:!r.favorite}:r));
  const rateMeal=(n,r)=>{sRt({...ratings,[n]:r});flash(r==="loved"?"Added to favorites!":"Will avoid next time")};

  const ai=async(msgs)=>{
    const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:msgs})});
    const d=await r.json();
    if(d.error)throw new Error(typeof d.error==="string"?d.error:d.error.message||"Error");
    return d.content.map(i=>i.text||"").join("")
  };

  const aiVision=async(payload)=>{
    const r=await fetch("/api/vision",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const d=await r.json();
    if(d.error)throw new Error(typeof d.error==="string"?d.error:d.error.message||"Error");
    return d.content.map(i=>i.text||"").join("")
  };

  const fmt=(txt)=>{
    if(!txt)return[];
    if(Array.isArray(txt))return txt;
    return txt.split(/(?:\.\s+|\n+|(?=\d+[\.\)]\s))/).map(s=>s.replace(/^\d+[\.\)]\s*/,"").trim()).filter(s=>s.length>2)
  };

  const supStat=s=>{
    if(!s.last)return{t:"No date set",c:"badge-a"};
    const l=Math.round((new Date(s.last).getTime()+s.weeks*7*864e5-Date.now())/864e5);
    if(l<0)return{t:`${Math.abs(l)}d overdue`,c:"badge-r"};
    if(l<=7)return{t:`${l}d left`,c:"badge-a"};
    return{t:`${l}d`,c:"badge-g"}
  };
  const dueSoon=supplies.filter(s=>{if(!s.last)return true;return(new Date(s.last).getTime()+s.weeks*7*864e5-Date.now())/864e5<10});
  const overdue=supplies.filter(s=>{if(!s.last)return false;return(new Date(s.last).getTime()+s.weeks*7*864e5-Date.now())/864e5<0});

  const today=DAYS[new Date().getDay()===0?6:new Date().getDay()-1];
  const todayMeal=plan?.meals?.find(m=>m.day===today);

  // ── Store helpers ──
  const addStore=(name)=>{
    const trimmed=name.trim();
    if(!trimmed)return;
    if(userStores.map(s=>s.toLowerCase()).includes(trimmed.toLowerCase())){flash("Store already added");return;}
    sP({...prefs,stores:[...userStores,trimmed]});
    setStoreInput("");
  };
  const removeStore=(name)=>{
    const updated=userStores.filter(s=>s!==name);
    sP({...prefs,stores:updated.length?updated:["My Store"]});
  };

  // ── Receipt scanner ──
  const scanImage=async(file)=>{
    setScanning(true);setScannedResult(null);
    try{
      const base64=await new Promise((res,rej)=>{
        const reader=new FileReader();
        reader.onload=()=>res(reader.result.split(",")[1]);
        reader.onerror=()=>rej(new Error("File read failed"));
        reader.readAsDataURL(file);
      });
      const t=await aiVision({imageBase64:base64,mimeType:file.type||"image/jpeg"});
      const parsed=JSON.parse(t.replace(/```json|```/g,"").trim());
      setScannedResult(parsed);
    }catch(e){flash("Couldn't read receipt — try pasting the text instead");}
    setScanning(false);
  };

  // ── Smart receipt text parser ─────────────────────────────────────────────
  const parseReceiptText=(text)=>{
    // normalize — handle both newline-separated and space-separated (PDF binary extract)
    const normalized=text.replace(/\r/g,'\n').replace(/[ \t]+/g,' ');
    const lower=normalized.toLowerCase();

    // detect store
    let storeName=null;
    if(lower.includes('costco'))storeName='Costco';
    else if(lower.includes('wegmans'))storeName='Wegmans';
    else if(lower.includes('whole foods'))storeName='Whole Foods';
    else if(lower.includes('trader joe'))storeName="Trader Joe's";
    else if(lower.includes('target'))storeName='Target';
    else if(lower.includes('walmart'))storeName='Walmart';
    else if(lower.includes('amazon fresh'))storeName='Amazon Fresh';

    // detect total — match "Total: $172.53" but NOT "Items Subtotal"
    let total=null;
    const totalM=normalized.match(/(?<!Sub)Total[:\s]+\$?([\d,]+\.\d{2})/i);
    if(totalM)total='$'+totalM[1];

    // detect date
    let date=null;
    const dateM=normalized.match(/(\d{4}-\d{2}-\d{2})|(\w+ \d{1,2},? \d{4})|(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    if(dateM){try{const d=new Date(dateM[0]);if(!isNaN(d))date=d.toISOString().split('T')[0];}catch{}}

    // ── Costco/Instacart PDF format ──────────────────────────────────────────
    // These PDFs dump sale prices at the TOP before the item list, in pairs:
    // sale_price original_price sale_price original_price ...
    // Then items appear as "N x Product Name\nItem CODE\nsize\n[✓ Save $X]\n[$price if no sale]"
    const itemsStart=normalized.search(/Items Found|\d+\s+x\s+[A-Za-z]/);
    const headerText=itemsStart>0?normalized.slice(0,itemsStart):'';
    const bodyText=itemsStart>0?normalized.slice(itemsStart):normalized;

    // Extract header prices in order — pairs of (sale, original)
    // Every even-index price (0,2,4...) is the paid/sale price
    const headerPrices=(headerText.match(/\$([\d]+\.[\d]{2})/g)||[]).map(p=>p);
    const saleQueue=[];
    for(let i=0;i<headerPrices.length;i+=2)saleQueue.push(headerPrices[i]);
    let saleIdx=0;

    // Split body into item segments on "N x ProductName" pattern
    const segSplit=bodyText.split(/(?=\d+\s+x\s+[A-Za-z])/);
    const items=[];

    for(const seg of segSplit){
      const itemM=seg.match(/^(\d+)\s+x\s+(.+)/s);
      if(!itemM)continue;
      const qty=parseInt(itemM[1]);
      let rest=itemM[2];

      // extract name: everything before "Item NNNNN"
      const nameM=rest.match(/^(.+?)\s+Item\s+\d/);
      let name=nameM?nameM[1].trim():rest.split(/\n/)[0].trim();
      // clean trailing size descriptors from name
      name=name.replace(/,?\s*\d+(\.\d+)?\s*(oz|lb|gal|ct|count)\s*,?\s*\d*\s*(pack|count)?\s*$/i,'').trim();
      name=name.replace(/,\s*$/,'').trim();

      // skip size-only false positives like "4 x 8 oz"
      if(!name||!/[a-zA-Z]{4,}/.test(name))continue;
      // skip totals/subtotals
      if(/subtotal|tip|credit|discount|total/i.test(name))continue;

      // find price in this segment (items without sale have price directly)
      const segPrices=(seg.match(/\$([\d]+\.[\d]{2})/g)||[])
        .filter(p=>{
          // exclude prices that look like they're in "Save $X" context
          const idx=seg.indexOf(p);
          const before=seg.slice(Math.max(0,idx-10),idx);
          return !/save|credit|tip|subtotal|total/i.test(before);
        });

      let price=null;
      if(segPrices.length>0){
        // use first non-discount price in segment
        price=segPrices[0];
      } else if(saleIdx<saleQueue.length){
        // no price in segment = this item had a sale, use next from header queue
        price=saleQueue[saleIdx++];
      }

      items.push({name,quantity:qty,price:price||null,category:'Other'});
    }

    if(items.length>=2)return{storeName,date,total,items,_parsed:true};
    return null;
  };

  const scanTextContent=async()=>{
    if(!scanText.trim())return;
    setScanning(true);setScannedResult(null);
    try{
      const text=scanText.trim();
      // try client-side parser first
      const clientResult=parseReceiptText(text);
      if(clientResult&&clientResult.items.length>0){
        try{
          const nameList=clientResult.items.map((it,i)=>`${i}|${it.name}`).join('\n');
          const catRaw=await ai([{role:'user',content:`Categorize these grocery items. Return ONLY a JSON array of categories in order. Categories: Produce, Meat & Seafood, Dairy & Eggs, Bakery, Frozen, Canned & Dry, Snacks, Beverages, Household, Personal Care, Other.\n\n${nameList}`}]);
          const cats=JSON.parse(catRaw.replace(/```json|```/g,'').trim());
          if(Array.isArray(cats))clientResult.items=clientResult.items.map((it,i)=>({...it,category:cats[i]||'Other'}));
        }catch(e){/* categories optional */}
        setScannedResult(clientResult);
        setScanning(false);return;
      }
      // fallback to AI for unknown formats
      const raw=await aiVision({textContent:text});
      const cleaned=raw.replace(/```json|```/g,'').trim();
      const s=cleaned.indexOf('{');const e=cleaned.lastIndexOf('}');
      if(s===-1||e===-1)throw new Error('No JSON');
      const parsed=JSON.parse(cleaned.slice(s,e+1));
      if(!parsed.items?.length)throw new Error('No items');
      if(!parsed.storeName){
        const l=text.toLowerCase();
        if(l.includes('costco'))parsed.storeName='Costco';
        else if(l.includes('wegmans'))parsed.storeName='Wegmans';
      }
      setScannedResult(parsed);
    }catch(e){
      console.error('Text scan error:',e);
      flash("Couldn't read that — make sure you copied the full receipt text");
    }
    setScanning(false);
  };



  const getPurchaseContext=()=>{
    if(!purchases.length)return"";
    const recent=purchases.slice(0,10);
    const storeFreq={};
    const itemFreq={};
    recent.forEach(p=>{
      storeFreq[p.storeName]=(storeFreq[p.storeName]||0)+1;
      p.items.forEach(i=>{
        const key=i.name.toLowerCase();
        itemFreq[key]=(itemFreq[key]||0)+1;
      });
    });
    const topStores=Object.entries(storeFreq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
    const topItems=Object.entries(itemFreq).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k])=>k);
    return `\nSHOPPING HISTORY (frequent stores: ${topStores.join(", ")}; items she buys regularly: ${topItems.join(", ")})`;
  };

  // ── Import recipe ──
  const importRecipe=async()=>{
    if(!importText.trim())return;
    setImporting(true);
    const input=importText.trim();
    const isUrl=/^https?:\/\//i.test(input);
    try{
      const t=await ai([{role:"user",content:`${isUrl?`Extract the recipe from: ${input}`:`Organize this recipe:\n\n${input}`}\n\nReturn ONLY valid JSON:\n{"name":"Name","time":25,"servings":4,"ingredients":"EXACT measurements, comma separated","prep":"detailed prep-ahead steps","finish":"detailed day-of with temps and times","source":"${isUrl?"site name":"user recipe"}"}\n\nInclude EXACT measurements for every ingredient. Include all temperatures and times.`}]);
      const p=JSON.parse(t.replace(/```json|```/g,"").trim());
      sR([...recipes,{...p,id:"r"+Date.now(),favorite:false,source:p.source||""}]);
      setImportText("");flash(`Added: ${p.name}`);
    }catch(e){flash("Couldn't read that — try pasting the full recipe");}
    setImporting(false)
  };

  // ── Generate plan ──
  const generate=async()=>{
    if(recipes.length<3){flash("Add at least 3 recipes first");setTab("recipes");return;}
    setLoading(true);setError(null);
    const favs=recipes.filter(r=>r.favorite).map(r=>r.name);
    const loved=Object.entries(ratings).filter(([,v])=>v==="loved").map(([k])=>k);
    const skip=Object.entries(ratings).filter(([,v])=>v==="skip").map(([k])=>k);
    const shuffled=[...recipes].sort(()=>Math.random()-.5);
    const rb=shuffled.map(r=>`"${r.name}"${r.favorite?" ⭐":""} (${r.time}min, serves ${r.servings})`).join("\n");
    const sb=dueSoon.length?`\nSUPPLIES DUE: ${dueSoon.map(s=>s.name).join(", ")}. Include "supplyReminders" array.`:"";
    const prevMeals=plan?.meals?.map(m=>m.name)||[];
    const prevNote=prevMeals.length?`\nLAST PLAN HAD: ${prevMeals.join(", ")}. You MUST pick a DIFFERENT combination this time.`:"";
    const pantryNote=pantry.length?`\nALWAYS IN PANTRY (exclude from shopping list): ${pantry.join(", ")}`:"";
    const histNote=history.length>1?`\nRECENT WEEKS: ${history.slice(-4).map(h=>h.meals.join(", ")).join(" | ")}`:"";
    const purchaseNote=getPurchaseContext();
    const storeNote=userStores.length?`\nUSER'S STORES: ${userStores.join(", ")}. In the shoppingList, tag each item with the best store using "store" field. Bulk/household items go to ${userStores.find(s=>/costco|sam/i.test(s))||userStores[userStores.length-1]}, fresh produce/meat to ${userStores[0]}.`:"";
    const allNames=recipes.map(r=>r.name).join(" ").toLowerCase();
    const cuisineHints=[];
    if(allNames.match(/taco|fajita|burrito|mexican|salsa/))cuisineHints.push("Mexican");
    if(allNames.match(/stir.?fry|teriyaki|asian|soy|sesame/))cuisineHints.push("Asian");
    if(allNames.match(/pasta|bolognese|pesto|italian|parmesan/))cuisineHints.push("Italian");
    if(allNames.match(/salmon|fish|shrimp/))cuisineHints.push("Seafood");
    const seed=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    try{
      const t=await ai([{role:"user",content:`Plan ${prefs.meals} dinners. Seed:${seed}

HOUSEHOLD: ${prefs.adults} adults + ${prefs.kids} kids
MAX ACTIVE COOK TIME: ${prefs.time} min
PREP DAYS: ${(prefs.prepDays||["Sunday"]).join(", ")}
PROTEIN: ${prefs.proteinPriority||"medium"}
MAX PASTA: ${prefs.maxPastaPerWeek??2}/week
MAX RED MEAT: ${prefs.maxRedMeatPerWeek??2}/week
${prefs.diet?`RESTRICTIONS: ${prefs.diet}`:""}
${favs.length?`FAVORITES: ${favs.join(", ")}`:""}\
${loved.length?`\nFAMILY LOVED: ${loved.join(", ")}`:""}\
${skip.length?`\nAVOID: ${skip.join(", ")}`:""}\
${cuisineHints.length?`\nFAMILY LIKES: ${cuisineHints.join(", ")} cuisine`:""}\
${prevNote}${pantryNote}${histNote}${purchaseNote}${storeNote}
${sb}

USER'S SAVED RECIPES (use some, also suggest 1-2 NEW that fit this family):
${rb}

CRITICAL FORMATTING RULES:
- "ingredients" must be ARRAY of strings
- "prep" must be ARRAY of SHORT steps
- "finish" must be ARRAY of SHORT steps
- shoppingList items: each item is a string, but ALSO include a "storeMap" object that maps item names to store names
- Each meal needs "noPrepFinish" array

INGREDIENT ACCOUNTABILITY (most important rule):
- Every single ingredient listed in "ingredients" MUST appear by name in either the prep steps or the finish steps — no exceptions.
- Example: if ingredients include "1 lb Italian chicken sausage", then a prep or finish step must say "...add Italian chicken sausage..." or "...slice chicken sausage...". 
- NEVER write finish steps that only mention the sauce or the dish in general — always call out the protein, the vegetables, and the key ingredients by name.
- Bad finish step: "Reheat sauce, add spinach, toss with pasta" — missing the protein entirely.
- Good finish step: "Reheat chicken sausage and tomato sauce over medium heat, add 2 cups spinach, wilt 2 min, toss with pasta, top with parmesan."
- Before finalizing each meal, mentally check: does every ingredient show up in a step? If not, add it.

ADVENTURE SUGGESTION:
- Include exactly one "adventureSuggestion" object in the response — a fun recipe from a cuisine this family has NOT been eating (look at their history and pick something totally different).
- This is presented as a gentle "maybe try this sometime?" not a scheduled meal.
- Keep it achievable: under 35 min, family-friendly, easy to find ingredients.
- Format: {"name":"dish name","cuisine":"e.g. Thai","why":"one warm sentence on why they might love it","time":25,"teaser":"one vivid sentence describing the dish"}

Return valid JSON:
{"title":"creative theme","cost":"$XX-$XX","savings":"tip",
"meals":[{"day":"Monday","name":"Recipe Name","time":15,
"ingredients":["1 lb Italian chicken sausage","1 onion (diced)","12 oz penne","2 cups spinach","1/2 cup parmesan"],
"prep":["Slice 1 lb Italian chicken sausage into rounds","Brown sausage in skillet 5 min, set aside","Dice 1 onion, cook in same pan 3 min","Add crushed tomatoes and seasoning, simmer 10 min","Stir sausage back into sauce, refrigerate"],
"finish":["Boil 12 oz penne per package directions","Reheat chicken sausage and tomato sauce over medium","Add 2 cups spinach, stir until wilted 2 min","Drain pasta, toss with sausage sauce","Top with 1/2 cup parmesan and serve"],
"noPrepFinish":["Slice sausage, brown 5 min","Dice onion, cook 3 min","Add tomatoes + seasoning, simmer 10 min","Boil pasta while sauce simmers","Toss pasta with sauce + spinach + parmesan"],
"shared":["rice"]}],
"prepGuide":{"minutes":75,"summary":["Cooked rice","Browned beef"],"steps":["Cook 6 cups rice","Slice peppers"]},
"shoppingList":{"Vegetables":["3 bell peppers","2 onions"],"Fruits":[],"Meat & Seafood":["1.5 lb chicken thighs"],"Dairy & Eggs":["1/2 cup parmesan"],"Herbs & Spices":["fresh cilantro"],"Grains & Pasta":["1 lb spaghetti"],"Canned & Dry":["28oz crushed tomatoes"],"Condiments & Oils":["soy sauce"],"Frozen":[],"Bakery & Bread":["8 flour tortillas"],"Other":[]},
"storeMap":{"3 bell peppers":"${userStores[0]||"Wegmans"}","8 flour tortillas":"${userStores[0]||"Wegmans"}","28oz crushed tomatoes":"${userStores.find(s=>/costco|sam/i.test(s))||userStores[userStores.length-1]||"Costco"}"},
"reused":{"rice":["Stir-Fry","Taco Bowls"]},
"adventureSuggestion":{"name":"Chicken Larb","cuisine":"Thai","why":"Your family loves bold flavors and this is bright, herby, and totally different from anything on your usual rotation.","time":25,"teaser":"Ground chicken tossed with toasted rice, lime juice, fish sauce, and fresh herbs — served over lettuce cups.","ingredients":["1 lb ground chicken","3 tbsp fish sauce","2 tbsp lime juice","1 tbsp toasted rice powder","2 shallots sliced","fresh mint and cilantro","1 tsp chili flakes","butter lettuce cups"],"prepSteps":["Toast 2 tbsp raw rice in dry pan until golden, grind to powder"],"steps":["Cook ground chicken in pan over high heat, breaking apart, 5 min","Remove from heat, add fish sauce, lime juice, rice powder, chili","Toss with shallots, mint, cilantro","Serve in lettuce cups with extra lime"]},
"supplyReminders":[]}`}]);
      const parsed=JSON.parse(t.replace(/```json|```/g,"").trim());
      sPl(parsed);sC({});setExpanded({});setSwapPicker(null);
      const newHist=[...history,{date:new Date().toISOString().split("T")[0],meals:parsed.meals?.map(m=>m.name)||[]}].slice(-12);
      sHi(newHist);
      flash("New plan ready!");
    }catch(e){console.error("Generate error:",e);setError(e.message||"Couldn't generate — try again");}
    setLoading(false)
  };

  // ── Fetch a fresh adventure suggestion without regenerating the whole plan ──
  const fetchNewAdventure=async()=>{
    if(adventureLoading)return;
    setAdventureLoading(true);
    const cuisineHints=[];
    const allNames=(recipes.map(r=>r.name).join(" ")+" "+(plan?.meals?.map(m=>m.name).join(" ")||"")).toLowerCase();
    if(allNames.match(/taco|fajita|burrito|mexican/))cuisineHints.push("Mexican");
    if(allNames.match(/stir.?fry|teriyaki|asian|soy/))cuisineHints.push("Asian");
    if(allNames.match(/pasta|bolognese|pesto|italian/))cuisineHints.push("Italian");
    if(allNames.match(/salmon|fish|shrimp/))cuisineHints.push("Seafood");
    const seed=Date.now().toString(36);
    try{
      const t=await ai([{role:"user",content:`Suggest ONE fun adventure recipe for a family that usually eats: ${cuisineHints.join(", ")||"American/Italian/Mexican"} food. Pick a cuisine they have NOT been eating. Seed:${seed}

Rules: under 35 min, family-friendly, easy grocery ingredients, different from their usual rotation.

Return ONLY valid JSON:
{"name":"dish name","cuisine":"cuisine type","why":"one warm sentence why they'd love it","time":25,"teaser":"one vivid appetizing sentence describing the dish","ingredients":["ingredient 1","ingredient 2","ingredient 3","ingredient 4","ingredient 5","ingredient 6"],"prepSteps":["one prep step if needed"],"steps":["Step 1 with specifics","Step 2 with specifics","Step 3 with specifics","Step 4 with specifics"]}`}]);
      const parsed=JSON.parse(t.replace(/```json|```/g,"").trim());
      sPl({...plan,adventureSuggestion:parsed});
      setAdventureExpanded(true);
    }catch(e){flash("Couldn't fetch a new suggestion — try again");}
    setAdventureLoading(false);
  };

    // ── Swap meal ──
  const swapMeal=async(i,name)=>{
    setSwapping(i);
    const day=plan.meals[i].day;
    const r=recipes.find(x=>x.name===name);
    try{
      const t=await ai([{role:"user",content:`Write prep + finish for "${name}" for ${day}.\nIngredients: ${r?.ingredients||"use your knowledge"}\nPrep: ${r?.prep||"n/a"}\nFinish: ${r?.finish||"n/a"}\n\nJSON only:\n{"name":"${name}","time":${r?.time||25},"prep":"detailed prep","finish":"detailed finish","shared":[]}`}]);
      const m=JSON.parse(t.replace(/```json|```/g,"").trim());
      m.day=day;
      const nm=[...plan.meals];nm[i]=m;
      sPl({...plan,meals:nm});setSwapPicker(null);flash(`Swapped to ${name}`);
    }catch{flash("Try again");}
    setSwapping(null)
  };

  // ── Copy + Print ──
  const copyList=()=>{
    if(!plan?.shoppingList)return;
    let t=`🍲 ${plan.title}\n\n`;
    Object.entries(plan.shoppingList).filter(([,v])=>v?.length).forEach(([c,its])=>{
      t+=`${c}:\n${its.map(i=>`  □ ${i}`).join("\n")}\n\n`
    });
    navigator.clipboard.writeText(t);flash("Copied!")
  };

  const copyByStore=()=>{
    if(!plan?.shoppingList)return;
    const storeMap=plan.storeMap||{};
    const byStore={};
    Object.entries(plan.shoppingList).filter(([,v])=>v?.length).forEach(([cat,its])=>{
      its.forEach(item=>{
        const store=storeMap[item]||userStores[0]||"Other";
        if(!byStore[store])byStore[store]={};
        if(!byStore[store][cat])byStore[store][cat]=[];
        byStore[store][cat].push(item);
      });
    });
    let t="";
    Object.entries(byStore).forEach(([store,cats])=>{
      t+=`🏪 ${store}\n`;
      Object.entries(cats).forEach(([cat,its])=>{
        t+=`  ${cat}:\n${its.map(i=>`    □ ${i}`).join("\n")}\n`
      });
      t+="\n";
    });
    navigator.clipboard.writeText(t);flash("Copied by store!")
  };

  const printPlan=()=>{
    if(!plan)return;
    let h=`<html><head><title>${plan.title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;padding:24px;font-size:13px;line-height:1.5}h1{font-size:22px;margin-bottom:16px}h2{font-size:16px;margin:18px 0 6px;border-bottom:1.5px solid #ddd;padding-bottom:4px}h3{font-size:13px;margin:12px 0 3px;text-transform:uppercase;letter-spacing:.5px;color:#888}.meal{margin-bottom:10px;padding:8px 0;border-bottom:1px solid #eee}.meal b{font-size:14px}.item{padding:3px 0 3px 20px;position:relative}.item::before{content:"☐";position:absolute;left:0}ol{padding-left:20px}ol li{margin-bottom:4px}@media print{body{padding:16px}}</style></head><body>`;
    h+=`<h1>🍲 ${plan.title}</h1>`;
    if(plan.prepGuide){h+=`<h2>Prep Day — ~${plan.prepGuide.minutes} min</h2><ol>`;plan.prepGuide.steps.forEach(s=>h+=`<li>${s}</li>`);h+=`</ol>`}
    h+=`<h2>Meals</h2>`;
    plan.meals?.forEach(m=>{h+=`<div class="meal"><b>${m.day}: ${m.name}</b> (${m.time}m)`;if(m.prep)h+=`<h3>Prepped</h3><div>${m.prep}</div>`;if(m.finish)h+=`<h3>Tonight</h3><div>${m.finish}</div>`;h+=`</div>`});
    h+=`<h2>Shopping List</h2>`;
    Object.entries(plan.shoppingList).filter(([,v])=>v?.length).forEach(([c,its])=>{h+=`<h3>${c}</h3>`;its.forEach(i=>h+=`<div class="item">${i}</div>`)});
    h+=`</body></html>`;
    const w=window.open("","_blank");w.document.write(h);w.document.close();w.print()
  };

  // ── Build store-split shopping view ──
  const buildStoreMap=()=>{
    if(!plan?.shoppingList)return{};
    const sm=plan.storeMap||{};
    const byStore={};
    // initialize with user stores + "Other"
    userStores.forEach(s=>{byStore[s]={}});
    byStore["Other"]={};
    Object.entries(plan.shoppingList).filter(([,v])=>v?.length).forEach(([cat,its])=>{
      its.forEach(item=>{
        const inPantry=pantry.some(p=>item.toLowerCase().includes(p.toLowerCase()));
        if(inPantry)return;
        const store=sm[item]||(userStores.length?userStores[0]:"Other");
        if(!byStore[store])byStore[store]={};
        if(!byStore[store][cat])byStore[store][cat]=[];
        byStore[store][cat].push(item);
      });
    });
    // remove empty stores
    Object.keys(byStore).forEach(s=>{if(!Object.values(byStore[s]).flat().length)delete byStore[s]});
    return byStore
  };

  /* ═══ ONBOARDING ═══ */
  if(!onboarded){
    const obStores=prefs.stores||["Wegmans","Costco"];
    return(<><style>{css}</style><div className="ob">
      <div className="ob-logo">🍲</div>
      <h2>Simmer</h2>
      <p>Dinner's handled. Tell us about your family and we'll take care of the rest.</p>
      <div className="frow" style={{marginBottom:14,textAlign:"left"}}>
        <div className="fg"><label className="fl">Adults</label><select className="fsel" value={prefs.adults} onChange={e=>setPrefs({...prefs,adults:+e.target.value})}>{[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
        <div className="fg"><label className="fl">Kids</label><select className="fsel" value={prefs.kids} onChange={e=>setPrefs({...prefs,kids:+e.target.value})}>{[0,1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
      </div>
      <div className="frow" style={{marginBottom:14,textAlign:"left"}}>
        <div className="fg"><label className="fl">Dinners/week</label><select className="fsel" value={prefs.meals} onChange={e=>setPrefs({...prefs,meals:+e.target.value})}>{[3,4,5,6,7].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
        <div className="fg"><label className="fl">Max cook time</label><select className="fsel" value={prefs.time} onChange={e=>setPrefs({...prefs,time:+e.target.value})}>{[15,20,25,30,45].map(n=><option key={n} value={n}>{n} min</option>)}</select></div>
      </div>
      <div className="fg" style={{textAlign:"left"}}>
        <label className="fl">Prep days</label>
        <div className="dpick">{DAYS.map(d=><button key={d} className={`dchip ${(prefs.prepDays||[]).includes(d)?"on":""}`} onClick={()=>{const ds=prefs.prepDays||["Sunday"];const n=ds.includes(d)?ds.filter(x=>x!==d):[...ds,d];if(n.length)setPrefs({...prefs,prepDays:n})}}>{d.slice(0,3)}</button>)}</div>
      </div>
      <div className="fg" style={{textAlign:"left"}}>
        <label className="fl">Protein priority</label>
        <select className="fsel" value={prefs.proteinPriority} onChange={e=>setPrefs({...prefs,proteinPriority:e.target.value})}><option value="high">High protein</option><option value="medium">Balanced</option><option value="low">Lighter / plant-based</option></select>
      </div>
      {/* ── NEW: Where do you shop? ── */}
      <div className="fg" style={{textAlign:"left"}}>
        <label className="fl">Where do you shop? <small>(your stores)</small></label>
        <p style={{fontSize:12,color:"var(--i3)",marginBottom:8}}>Add your grocery and bulk stores — we'll use these to split your shopping lists.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
          {obStores.map(s=><span key={s} className="store-chip" style={{background:"var(--rub)",color:"var(--ru)"}}>
            {s}<button className="store-chip-rm" onClick={()=>{const u=obStores.filter(x=>x!==s);setPrefs({...prefs,stores:u.length?u:[]});}}>×</button>
          </span>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input className="fi" style={{flex:1}} placeholder="e.g. Trader Joe's, Whole Foods..." value={storeInput} onChange={e=>setStoreInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&storeInput.trim()){const u=[...obStores,storeInput.trim()];setPrefs({...prefs,stores:u});setStoreInput("");}}}/>
          <button className="btn bs bsm" onClick={()=>{if(storeInput.trim()){const u=[...obStores,storeInput.trim()];setPrefs({...prefs,stores:u});setStoreInput("");}}}>Add</button>
        </div>
      </div>
      <div className="fg" style={{textAlign:"left"}}>
        <label className="fl">Any dietary needs? <small>(optional)</small></label>
        <input className="fi" value={prefs.diet} onChange={e=>setPrefs({...prefs,diet:e.target.value})} placeholder="No shellfish, low carb, kids hate mushrooms..."/>
      </div>
      <button className="btn bg" style={{marginTop:12}} onClick={()=>{sP(prefs);setOnboarded(true);flash("Welcome! 🎉")}}>Let's Go</button>
    </div></>);
  }

  /* ═══ MAIN APP ═══ */
  return(<><style>{css}</style><div className="shell"><main className="page">

  {/* ── HOME ── */}
  {tab==="home"&&<>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <h1 className="pg-t">Hey there 🍲</h1>
      <button className="ib" onClick={()=>setTab("settings")} title="Settings">{I.gear}</button>
    </div>
    {todayMeal?(<div className="tonight">
      <div className="tonight-label">Tonight's Dinner</div>
      <div className="tonight-meal">{todayMeal.name}</div>
      <div className="tonight-time">{todayMeal.time} min active cooking</div>
      <div className="tonight-steps">
        <div className="tonight-sub">What to do</div>
        <ol style={{paddingLeft:18,margin:0}}>{fmt(todayMeal.finish).map((s,j)=><li key={j} style={{padding:"3px 0",lineHeight:1.5}}>{s}</li>)}</ol>
      </div>
    </div>):(
      <div className="tonight" style={{textAlign:"center",cursor:"pointer"}} onClick={()=>{if(!plan)generate();else setTab("plan")}}>
        <div style={{fontSize:32,marginBottom:8}}>🍽</div>
        <div className="tonight-meal">{plan?"View this week's plan":"Plan your week"}</div>
        <div className="tonight-time">{plan?"Tap to see what's cooking":"One tap and dinner's sorted"}</div>
      </div>
    )}
    {overdue.length>0&&<div className="nudge nudge-am"><b>🏠</b><span>Time to restock: {overdue.map(s=>s.name).join(", ")}</span></div>}
    {!plan&&recipes.length>=3&&<div className="nudge nudge-sa"><b>✨</b><span>You have {recipes.length} recipes ready. Tap "Plan your week" above!</span></div>}
    {recipes.length<3&&<div className="nudge nudge-ru"><b>📖</b><span>Add at least 3 recipes to start planning.</span></div>}
    {purchases.length>0&&<div className="nudge nudge-bl"><b>🧾</b><span>{purchases.length} receipt{purchases.length!==1?"s":""} scanned · AI is learning your shopping habits</span></div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
      <div className="hcard" onClick={()=>setTab("plan")}><div className="hcard-icon">📋</div><div className="hcard-title">This Week</div><div className="hcard-desc">{plan?`${plan.meals?.length} meals planned`:"Generate a plan"}</div></div>
      <div className="hcard" onClick={()=>setTab("shop")}><div className="hcard-icon">🛒</div><div className="hcard-title">Shopping</div><div className="hcard-desc">{plan?.shoppingList?"View & check off list":"List ready after planning"}</div></div>
      <div className="hcard" onClick={()=>setTab("recipes")}><div className="hcard-icon">📖</div><div className="hcard-title">Recipes</div><div className="hcard-desc">{recipes.length} meals · {recipes.filter(r=>r.favorite).length} favorites</div></div>
      <div className="hcard" onClick={()=>setTab("restock")}><div className="hcard-icon">🏠</div><div className="hcard-title">Restock</div><div className="hcard-desc">{dueSoon.length>0?<span style={{color:"var(--am)"}}>{dueSoon.length} items due</span>:"All stocked up"}</div></div>
    </div>
  </>}

  {/* ── PLAN ── */}
  {tab==="plan"&&<>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><button className="ib" onClick={()=>setTab("home")} style={{marginLeft:-8}}>←</button><h1 className="pg-t">This Week</h1></div>
    <p className="pg-s">{plan?plan.title:"Generate a plan to get started"}</p>
    {error&&<div className="err-bar">{error}</div>}
    <button className="btn bg" style={{marginBottom:16}} onClick={generate} disabled={loading}>{loading?<><div className="dots" style={{padding:0}}><span/><span/><span/></div> Planning...</>:plan?<>{I.refresh} New Plan</>:<>{I.spark} Plan My Week</>}</button>
    {plan&&<>
      {plan.savings&&<div className="nudge nudge-sa"><b>💡</b><span>{plan.savings}</span></div>}
      {plan.supplyReminders?.length>0&&<div className="nudge nudge-am"><b>🏠</b><div>{plan.supplyReminders.map((r,i)=><div key={i}>{r}</div>)}</div></div>}
      {plan.adventureSuggestion&&<div style={{background:"linear-gradient(135deg,#F5F0FF 0%,#FFF8EE 100%)",border:"1.5px solid #D8C8F0",borderRadius:14,marginBottom:14,overflow:"hidden"}}>
        {/* header row */}
        <div style={{padding:"14px 16px",cursor:"pointer"}} onClick={()=>setAdventureExpanded(e=>!e)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",color:"#7C5AB8"}}>✨ Maybe try this sometime?</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:"#9B7ED4",padding:"2px 6px",borderRadius:8,fontFamily:"var(--bd)",fontWeight:700}}
                onClick={e=>{e.stopPropagation();fetchNewAdventure();}}>{adventureLoading?"...":"↻ New idea"}</button>
              <span style={{color:"#9B7ED4",transform:adventureExpanded?"rotate(180deg)":"none",transition:"transform .2s"}}>{I.chev}</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontFamily:"var(--hd)",fontSize:16,fontWeight:500,color:"var(--ink)"}}>{plan.adventureSuggestion.name}</span>
            <span style={{fontSize:11,fontWeight:700,color:"#7C5AB8",background:"#EDE4FF",padding:"2px 8px",borderRadius:10,whiteSpace:"nowrap"}}>{plan.adventureSuggestion.cuisine}</span>
            <span style={{fontSize:11,color:"var(--i3)",marginLeft:"auto",whiteSpace:"nowrap"}}>⏱ {plan.adventureSuggestion.time}m</span>
          </div>
          <div style={{fontSize:13,color:"var(--i2)",lineHeight:1.45}}>{plan.adventureSuggestion.teaser}</div>
        </div>
        {/* expanded */}
        {adventureExpanded&&<div style={{borderTop:"1px solid #D8C8F0",padding:"12px 16px 16px"}}>
          <div style={{fontSize:12,color:"#6B4FA0",fontStyle:"italic",marginBottom:12}}>{plan.adventureSuggestion.why}</div>
          {plan.adventureSuggestion.ingredients?.length>0&&<>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".6px",color:"#9B7ED4",marginBottom:6}}>Ingredients</div>
            <ul style={{listStyle:"none",padding:0,margin:"0 0 14px"}}>
              {(Array.isArray(plan.adventureSuggestion.ingredients)?plan.adventureSuggestion.ingredients:[]).map((ing,i)=>
                <li key={i} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",paddingLeft:14,position:"relative",lineHeight:1.4}}>
                  <span style={{position:"absolute",left:0,color:"#C4AEE8"}}>•</span>{ing}
                </li>)}
            </ul>
          </>}
          {plan.adventureSuggestion.prepSteps?.length>0&&<>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".6px",color:"#9B7ED4",marginBottom:6}}>Prep ahead</div>
            <ol style={{paddingLeft:18,margin:"0 0 14px"}}>{plan.adventureSuggestion.prepSteps.map((s,i)=><li key={i} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",lineHeight:1.5}}>{s}</li>)}</ol>
          </>}
          {plan.adventureSuggestion.steps?.length>0&&<>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".6px",color:"#9B7ED4",marginBottom:6}}>How to make it</div>
            <ol style={{paddingLeft:18,margin:"0 0 16px"}}>{plan.adventureSuggestion.steps.map((s,i)=><li key={i} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",lineHeight:1.5}}>{s}</li>)}</ol>
          </>}
          {/* swap picker — shown when week is full */}
          {adventureSwapMode&&<div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".6px",color:"#9B7ED4",marginBottom:8}}>Which meal do you want to replace?</div>
            {(plan.meals||[]).map((m,i)=><div key={i}
              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",border:"1.5px solid #D8C8F0",borderRadius:10,marginBottom:6,cursor:"pointer",background:"#FDFAFF"}}
              onClick={()=>{
                const adv=plan.adventureSuggestion;
                const newMeal={day:m.day,name:adv.name,time:adv.time||30,
                  ingredients:Array.isArray(adv.ingredients)?adv.ingredients:[adv.teaser||""],
                  prep:Array.isArray(adv.prepSteps)?adv.prepSteps:[],
                  finish:Array.isArray(adv.steps)?adv.steps:[adv.teaser||"Cook and serve"],
                  noPrepFinish:Array.isArray(adv.steps)?adv.steps:[],shared:[]};
                const updated=[...(plan.meals||[])];
                updated[i]=newMeal;
                sPl({...plan,meals:updated});
                setAdventureSwapMode(false);setAdventureExpanded(false);
                flash(`${m.day} swapped to ${adv.name}!`);
              }}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{m.day}</div>
                <div style={{fontSize:12,color:"var(--i3)"}}>{m.name}</div>
              </div>
              <span style={{fontSize:12,color:"#9B7ED4",fontWeight:700}}>Replace →</span>
            </div>)}
            <button className="btn bo bsm" style={{width:"100%",marginTop:4,borderColor:"#D8C8F0",color:"#9B7ED4",fontSize:12}} onClick={()=>setAdventureSwapMode(false)}>Cancel</button>
          </div>}
          <div style={{display:"flex",gap:8}}>
            <button className="btn bg" style={{flex:1,padding:"11px 16px",fontSize:13,background:"#7C5AB8"}} onClick={()=>{
              const adv=plan.adventureSuggestion;
              const currentMeals=plan.meals||[];
              if(currentMeals.some(m=>m.name===adv.name)){flash("Already in this week's plan!");return;}
              const usedDays=currentMeals.map(m=>m.day);
              const freeDay=DAYS.find(d=>!usedDays.includes(d));
              if(freeDay){
                const newMeal={day:freeDay,name:adv.name,time:adv.time||30,
                  ingredients:Array.isArray(adv.ingredients)?adv.ingredients:[adv.teaser||""],
                  prep:Array.isArray(adv.prepSteps)?adv.prepSteps:[],
                  finish:Array.isArray(adv.steps)?adv.steps:[adv.teaser||"Cook and serve"],
                  noPrepFinish:Array.isArray(adv.steps)?adv.steps:[],shared:[]};
                sPl({...plan,meals:[...currentMeals,newMeal]});
                setAdventureExpanded(false);
                flash(`${adv.name} added to ${freeDay}!`);
              } else {
                // week is full — show swap picker
                setAdventureSwapMode(true);
              }
            }}>+ Add to This Week</button>
            <button className="btn bo bsm" style={{fontSize:13,borderColor:"#D8C8F0",color:"#7C5AB8",whiteSpace:"nowrap"}} onClick={()=>{
              const adv=plan.adventureSuggestion;
              const newRecipe={id:"r"+Date.now(),name:adv.name,time:adv.time||30,servings:4,favorite:false,
                ingredients:Array.isArray(adv.ingredients)?adv.ingredients.join(", "):adv.teaser||"",
                prep:Array.isArray(adv.prepSteps)?adv.prepSteps.join(". "):"",
                finish:Array.isArray(adv.steps)?adv.steps.join(". "):adv.teaser||"",
                source:adv.cuisine||""};
              sR([...recipes,newRecipe]);
              flash(`Saved to Recipes!`);
            }}>Save Recipe</button>
          </div>
        </div>}
      </div>}
      {plan.reused&&Object.keys(plan.reused).length>0&&<div style={{marginBottom:14}}><span style={{fontSize:12,fontWeight:700,color:"var(--i3)"}}>SHARED: </span>{Object.entries(plan.reused).map(([k,v])=><span key={k} className="sp">{k} ×{v.length}</span>)}</div>}
      {plan.prepGuide&&<div className="prb"><div className="prb-t">🔪 {(prefs.prepDays||["Sunday"]).join(" & ")} Prep — ~{plan.prepGuide.minutes} min</div>{plan.prepGuide.summary&&<div style={{marginBottom:12,padding:"10px 14px",background:"rgba(255,255,255,.6)",borderRadius:10}}><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"var(--sa)",marginBottom:6}}>After prep you'll have</div>{fmt(plan.prepGuide.summary).map((s,i)=><div key={i} style={{fontSize:13,color:"#2B5E3B",padding:"2px 0",paddingLeft:16,position:"relative"}}><span style={{position:"absolute",left:0}}>✓</span>{s}</div>)}</div>}<ol>{plan.prepGuide.steps.map((s,i)=><li key={i}>{s}</li>)}</ol></div>}
      {plan.meals?.map((m,i)=>{const isToday=m.day===today;return<div className="dc" key={i} style={isToday?{border:"1.5px solid var(--ru)",boxShadow:"0 2px 12px rgba(192,78,40,.10)"}:{}}>
        <div className="dc-top" onClick={()=>setExpanded(e=>({...e,[i]:!e[i]}))}>
          <div>
            <div className="dc-day" style={isToday?{color:"var(--ru)"}:{}}>
              {m.day}{isToday&&<span style={{fontSize:10,fontWeight:700,background:"var(--ru)",color:"#fff",padding:"1px 7px",borderRadius:10,marginLeft:7,letterSpacing:".3px",verticalAlign:"middle"}}>TONIGHT</span>}
            </div>
            <div className="dc-meal">{m.name}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span className="dc-time">{m.time}m</span><span style={{transform:expanded[i]?"rotate(180deg)":"none",transition:"transform .2s",color:"var(--i4)"}}>{I.chev}</span></div>
        </div>
        {expanded[i]&&<div className="dc-body">
          {m.ingredients&&<><div className="dc-lb">Ingredients</div><ul style={{listStyle:"none",padding:0,margin:0}}>{(Array.isArray(m.ingredients)?m.ingredients:m.ingredients.split(/,\s*/)).map((g,j)=><li key={j} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",paddingLeft:16,position:"relative"}}><span style={{position:"absolute",left:0,color:"var(--i4)"}}>•</span>{g.trim()}</li>)}</ul></>}
          <div className="dc-lb">Prep (done ahead)</div><ol style={{paddingLeft:20,margin:0}}>{fmt(m.prep).map((s,j)=><li key={j} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",lineHeight:1.5}}>{s}</li>)}</ol>
          <div className="dc-lb">Tonight</div><ol style={{paddingLeft:20,margin:0}}>{fmt(m.finish).map((s,j)=><li key={j} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",lineHeight:1.5}}>{s}</li>)}</ol>
          {m.noPrepFinish&&<details style={{marginTop:8}}><summary style={{fontSize:12,color:"var(--ru)",fontWeight:600,cursor:"pointer"}}>Didn't get to prep? Full instructions here</summary><ol style={{paddingLeft:20,margin:"8px 0 0"}}>{fmt(m.noPrepFinish).map((s,j)=><li key={j} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",lineHeight:1.5}}>{s}</li>)}</ol></details>}
          {m.shared?.length>0&&<><div className="dc-lb">Shared ingredients</div><div>{m.shared.map((s,j)=><span key={j} className="sp">{s}</span>)}</div></>}
          <div className="rate-row">
            <button className={`rate-btn ${ratings[m.name]==="loved"?"loved":""}`} onClick={e=>{e.stopPropagation();rateMeal(m.name,"loved")}}>{I.up} Loved it</button>
            <button className={`rate-btn ${ratings[m.name]==="skip"?"skip":""}`} onClick={e=>{e.stopPropagation();rateMeal(m.name,"skip")}}>{I.down} Skip</button>
          </div>
          {swapPicker===i?<div className="swpick">
            <div style={{fontSize:12,fontWeight:700,color:"var(--i3)",marginBottom:6}}>PICK REPLACEMENT</div>
            {recipes.filter(r=>!plan.meals.some(mm=>mm.name===r.name)).map(r=><div key={r.id} className="swopt" onClick={e=>{e.stopPropagation();swapMeal(i,r.name)}}><div><span style={{fontWeight:600,fontSize:13.5}}>{r.favorite?"❤️ ":""}{r.name}</span></div><span style={{fontSize:12,color:"var(--i3)"}}>{r.time}m</span></div>)}
            {swapping===i&&<div style={{textAlign:"center",padding:8,color:"var(--ru)",fontSize:13}}>Swapping...</div>}
            <button className="swbtn" onClick={e=>{e.stopPropagation();setSwapPicker(null)}}>Cancel</button>
          </div>:<button className="swbtn" onClick={e=>{e.stopPropagation();setSwapPicker(i)}}>{I.swap} Swap this meal</button>}
        </div>}
      </div>})}
    </>}
  </>}

  {/* ── SHOP ── */}
  {tab==="shop"&&<>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><button className="ib" onClick={()=>setTab("home")} style={{marginLeft:-8}}>←</button><h1 className="pg-t">Shopping</h1></div>
    {plan?.shoppingList?<>
      {/* actions bar */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        <button className="btn bo bsm" onClick={copyList}>{I.copy} Copy</button>
        <button className="btn bo bsm" onClick={copyByStore}>{I.split} By Store</button>
        <button className="btn bo bsm" onClick={printPlan}>🖨 Print</button>
        <button className="btn bo bsm" style={{marginLeft:"auto"}} onClick={()=>setModal({type:"scanner"})}>{I.receipt} Scan Receipt</button>
      </div>

      {/* add custom item */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <input className="fi" style={{flex:1}} value={addingItem} onChange={e=>setAddingItem(e.target.value)} placeholder="Add an item..."
          onKeyDown={e=>{if(e.key==="Enter"&&addingItem.trim()){setExtraItems([...extraItems,{name:addingItem.trim(),cat:"Other"}]);setAddingItem("");flash("Added")}}}/>
        <button className="btn bg bsm" disabled={!addingItem.trim()} onClick={()=>{setExtraItems([...extraItems,{name:addingItem.trim(),cat:"Other"}]);setAddingItem("");flash("Added")}}>Add</button>
      </div>

      {/* view toggle */}
      <div className="tab-strip">
        <button className={`tab-btn ${shopView==="combined"?"on":""}`} onClick={()=>setShopView("combined")}>All Items</button>
        {userStores.map(s=><button key={s} className={`tab-btn ${shopView===s?"on":""}`} onClick={()=>setShopView(s)}>{s}</button>)}
      </div>

      {/* filter tabs */}
      <div style={{display:"flex",gap:4,marginBottom:14}}>
        {["all","unchecked","checked"].map(f=><button key={f} className={`dchip ${shopFilter===f?"on":""}`} onClick={()=>setShopFilter(f)} style={{fontSize:12,padding:"6px 12px"}}>{f==="all"?"All":f==="unchecked"?"Need":"Done"}</button>)}
      </div>

      {/* ── COMBINED VIEW ── */}
      {shopView==="combined"&&Object.entries(plan.shoppingList).filter(([,v])=>v?.length).map(([cat,its])=>{
        const visItems=its.filter((item,i)=>{
          const inPantry=pantry.some(p=>item.toLowerCase().includes(p.toLowerCase()));
          if(inPantry)return false;
          const k=`${cat}-${i}`;const isChecked=!!checked[k];
          if(shopFilter==="unchecked")return !isChecked;
          if(shopFilter==="checked")return isChecked;
          return true;
        });
        if(!visItems.length)return null;
        return <div className="shcat" key={cat}>
          <div className="shcat-t">{cat}</div>
          {its.map((item,i)=>{
            const inPantry=pantry.some(p=>item.toLowerCase().includes(p.toLowerCase()));if(inPantry)return null;
            const k=`${cat}-${i}`;const isChecked=!!checked[k];
            if(shopFilter==="unchecked"&&isChecked)return null;
            if(shopFilter==="checked"&&!isChecked)return null;
            const storeTag=plan.storeMap?.[item];
            return <div key={k} className={`shrow ${isChecked?"ck":""}`}>
              <div className="shchk" onClick={()=>sC({...checked,[k]:!checked[k]})}>{isChecked&&I.check}</div>
              <span style={{fontSize:14,flex:1}} onClick={()=>sC({...checked,[k]:!checked[k]})}>{item}</span>
              {storeTag&&<span style={{fontSize:10,fontWeight:700,color:"var(--bl)",background:"var(--blb)",padding:"2px 6px",borderRadius:8,marginRight:4,whiteSpace:"nowrap"}}>{storeTag}</span>}
              <button className="ib" style={{width:28,height:28}} title="Got it" onClick={()=>sC({...checked,[k]:true,})}><span style={{fontSize:11}}>✓</span></button>
            </div>
          })}
        </div>
      })}

      {/* ── BY-STORE VIEW ── */}
      {shopView!=="combined"&&(()=>{
        const sm=buildStoreMap();
        const storeCats=sm[shopView]||{};
        const allEmpty=Object.values(storeCats).flat().length===0;
        if(allEmpty)return <div style={{textAlign:"center",padding:"32px 20px",color:"var(--i3)"}}><p>No items assigned to {shopView} yet.</p><p style={{marginTop:8,fontSize:12}}>Generate a new plan to get store-tagged items.</p></div>;
        return Object.entries(storeCats).map(([cat,its])=>{
          if(!its.length)return null;
          return <div className="shcat" key={cat}>
            <div className="shcat-t">{cat}</div>
            {its.map((item,idx)=>{
              const k=`store-${shopView}-${cat}-${idx}`;
              const isChecked=!!checked[k];
              if(shopFilter==="unchecked"&&isChecked)return null;
              if(shopFilter==="checked"&&!isChecked)return null;
              return <div key={k} className={`shrow ${isChecked?"ck":""}`} onClick={()=>sC({...checked,[k]:!checked[k]})}>
                <div className="shchk">{isChecked&&I.check}</div>
                <span style={{fontSize:14,flex:1}}>{item}</span>
              </div>
            })}
          </div>
        });
      })()}

      {/* extra items */}
      {extraItems.length>0&&shopView==="combined"&&<div className="shcat"><div className="shcat-t">Added Items</div>{extraItems.map((item,i)=>{
        const k=`extra-${i}`;
        return <div key={k} className={`shrow ${checked[k]?"ck":""}`} onClick={()=>sC({...checked,[k]:!checked[k]})}>
          <div className="shchk">{checked[k]&&I.check}</div>
          <span style={{fontSize:14,flex:1}}>{item.name}</span>
          <button className="ib dng" style={{width:28,height:28}} onClick={e=>{e.stopPropagation();setExtraItems(extraItems.filter((_,j)=>j!==i))}}>{I.trash}</button>
        </div>})}
      </div>}

      {plan.cost&&<p style={{fontSize:13,color:"var(--i3)",textAlign:"center",marginTop:12}}>Estimated: {plan.cost}</p>}

      {/* pantry */}
      <div style={{marginTop:24,paddingTop:16,borderTop:"1px solid var(--sd)"}}>
        <div style={{marginBottom:8}}><div style={{fontFamily:"var(--hd)",fontSize:16,fontWeight:500}}>My Pantry</div><div style={{fontSize:12,color:"var(--i3)"}}>Items here are auto-excluded from shopping lists</div></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
          {pantry.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",background:"var(--sand)",borderRadius:20,fontSize:12,fontWeight:600,color:"var(--i2)"}}>
            {item}<button style={{border:"none",background:"none",cursor:"pointer",color:"var(--i4)",fontSize:14,padding:0,lineHeight:1}} onClick={()=>sPa(pantry.filter((_,j)=>j!==i))}>×</button>
          </div>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input className="fi" style={{flex:1,padding:"8px 12px",fontSize:13}} placeholder="Add pantry staple..." id="pantry-input"
            onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){sPa([...pantry,e.target.value.trim()]);e.target.value="";flash("Added to pantry")}}}/>
          <button className="btn bs bsm" onClick={()=>{const el=document.getElementById("pantry-input");if(el?.value.trim()){sPa([...pantry,el.value.trim()]);el.value="";flash("Added to pantry")}}}>Add</button>
        </div>
      </div>
    </>:<div style={{textAlign:"center",padding:"40px 20px",color:"var(--i3)"}}>
      <p>Generate a meal plan first to see your shopping list here.</p>
      <button className="btn bg" style={{marginTop:16}} onClick={()=>setTab("plan")}>{I.spark} Go to Plan</button>
    </div>}
  </>}

  {/* ── RECIPES ── */}
  {tab==="recipes"&&<>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><button className="ib" onClick={()=>setTab("home")} style={{marginLeft:-8}}>←</button><h1 className="pg-t">Recipes</h1></div>
    <p className="pg-s">{recipes.length} meals · tap ❤️ to favorite</p>
    <div className="cd" style={{marginBottom:14}}>
      <label className="fl">Add a recipe</label>
      <textarea className="fta" style={{minHeight:60,marginBottom:8}} value={importText} onChange={e=>setImportText(e.target.value)} placeholder="Paste a recipe URL or the full recipe text..."/>
      <button className="btn bg" disabled={!importText.trim()||importing} onClick={importRecipe}>{importing?"Reading recipe...":importText.trim()&&/^https?:\/\//i.test(importText.trim())?"Import from Link":"Add This Recipe"}</button>
    </div>
    <button className="btn bo" style={{marginBottom:14,width:"100%"}} onClick={()=>setModal({type:"recipe"})}>{I.plus} Type it in manually</button>
    {recipes.map(r=><div className="rc" key={r.id}>
      <div className="rc-top">
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <button className={`fav-btn ${r.favorite?"on":""}`} onClick={()=>toggleFav(r.id)}>{r.favorite?I.heartOn:I.heart}</button>
          <div><div className="rc-name">{r.name}</div><div className="rc-meta"><span className="pill" style={{background:"var(--rub)",color:"var(--ru)"}}>{r.time}m</span><span className="pill" style={{background:"var(--sab)",color:"var(--sa)"}}>Serves {r.servings}</span>{r.source&&<span className="pill" style={{background:"var(--amb)",color:"var(--am)"}}>{r.source}</span>}</div></div>
        </div>
        <div style={{display:"flex",gap:2}}><button className="ib" onClick={()=>setModal({type:"recipe",data:r})}>{I.edit}</button><button className="ib dng" onClick={()=>{sR(recipes.filter(x=>x.id!==r.id));flash("Removed")}}>{I.trash}</button></div>
      </div>
      <div style={{cursor:"pointer",padding:"8px 0 0",fontSize:12,color:"var(--i3)",fontWeight:600}} onClick={()=>setRecExp(e=>({...e,[r.id]:!e[r.id]}))}>{recExp[r.id]?"Hide details ▲":"View details ▼"}</div>
      {recExp[r.id]&&<div className="rx"><div className="rx-lb">Ingredients</div><ul style={{listStyle:"none",padding:0,margin:0}}>{(r.ingredients||"").split(/,\s*|\n/).filter(g=>g.trim()).map((g,j)=><li key={j} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",paddingLeft:16,position:"relative"}}><span style={{position:"absolute",left:0,color:"var(--i4)"}}>•</span>{g.trim()}</li>)}</ul>{r.prep&&<><div className="rx-lb">Prep Ahead</div><ol style={{paddingLeft:20,margin:0}}>{fmt(r.prep).map((s,j)=><li key={j} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",lineHeight:1.5}}>{s}</li>)}</ol></>}{r.finish&&<><div className="rx-lb">Day-of</div><ol style={{paddingLeft:20,margin:0}}>{fmt(r.finish).map((s,j)=><li key={j} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",lineHeight:1.5}}>{s}</li>)}</ol></>}</div>}
    </div>)}
  </>}

  {/* ── RESTOCK ── */}
  {tab==="restock"&&<>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><button className="ib" onClick={()=>setTab("home")} style={{marginLeft:-8}}>←</button><h1 className="pg-t">Restock</h1></div>
    <p className="pg-s">Tap ↻ when you buy something</p>
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      <button className="btn bg" style={{flex:1}} onClick={()=>setModal({type:"supply"})}>{I.plus} Track Item</button>
      <button className="btn bo bsm" onClick={()=>setModal({type:"scanner"})}>{I.receipt} Scan Receipt</button>
    </div>
    {/* group by store */}
    {userStores.map(store=>{
      const storeItems=supplies.filter(s=>s.where===store);
      if(!storeItems.length)return null;
      return <div key={store} style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"var(--i3)"}}>{store}</span>
          <span style={{flex:1,height:1,background:"var(--sand)"}}/>
        </div>
        {storeItems.map(s=>{const st=supStat(s);return <div className="scard" key={s.id}>
          <div><h4 style={{fontSize:14.5,fontWeight:600}}>{s.name}</h4><p style={{fontSize:12,color:"var(--i3)",marginTop:1}}>every {s.weeks}wk</p></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span className={`badge ${st.c}`}>{st.t}</span>
            <button className="ib" onClick={()=>{sS(supplies.map(x=>x.id===s.id?{...x,last:new Date().toISOString().split("T")[0]}:x));flash("Marked ordered")}}>{I.refresh}</button>
            <button className="ib dng" onClick={()=>{sS(supplies.filter(x=>x.id!==s.id));flash("Removed")}}>{I.trash}</button>
          </div>
        </div>})}
      </div>
    })}
    {/* items with stores not in user's store list */}
    {supplies.filter(s=>!userStores.includes(s.where)).length>0&&<div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
        <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"var(--i3)"}}>Other</span>
        <span style={{flex:1,height:1,background:"var(--sand)"}}/>
      </div>
      {supplies.filter(s=>!userStores.includes(s.where)).map(s=>{const st=supStat(s);return <div className="scard" key={s.id}>
        <div><h4 style={{fontSize:14.5,fontWeight:600}}>{s.name}</h4><p style={{fontSize:12,color:"var(--i3)",marginTop:1}}>{s.where} · every {s.weeks}wk</p></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span className={`badge ${st.c}`}>{st.t}</span>
          <button className="ib" onClick={()=>{sS(supplies.map(x=>x.id===s.id?{...x,last:new Date().toISOString().split("T")[0]}:x));flash("Marked ordered")}}>{I.refresh}</button>
          <button className="ib dng" onClick={()=>{sS(supplies.filter(x=>x.id!==s.id));flash("Removed")}}>{I.trash}</button>
        </div>
      </div>})}
    </div>}
    {/* purchase history */}
    {purchases.length>0&&<div style={{marginTop:8,paddingTop:16,borderTop:"1px solid var(--sd)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontFamily:"var(--hd)",fontSize:16,fontWeight:500}}>Purchase History</div>
        <button className="btn bo bsm" style={{padding:"6px 12px",fontSize:12}} onClick={()=>setModal({type:"history"})}>View All</button>
      </div>
      {purchases.slice(0,3).map(p=><div className="ph-card" key={p.id}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <span className="ph-store-badge">{p.storeName}</span>
            {p.total&&<span style={{fontSize:12,color:"var(--i3)"}}>{p.total}</span>}
          </div>
          <span style={{fontSize:11,color:"var(--i3)"}}>{p.date}</span>
        </div>
        <div style={{fontSize:12,color:"var(--i2)",marginTop:4}}>{p.items.slice(0,4).map(i=>i.name).join(", ")}{p.items.length>4&&` +${p.items.length-4} more`}</div>
      </div>)}
    </div>}
  </>}

  {/* ── SETTINGS ── */}
  {tab==="settings"&&<>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><button className="ib" onClick={()=>setTab("home")} style={{marginLeft:-8}}>←</button><h1 className="pg-t">Settings</h1></div>
    <div className="cd">
      <div className="frow">
        <div className="fg"><label className="fl">Adults</label><select className="fsel" value={prefs.adults} onChange={e=>sP({...prefs,adults:+e.target.value})}>{[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
        <div className="fg"><label className="fl">Kids</label><select className="fsel" value={prefs.kids} onChange={e=>sP({...prefs,kids:+e.target.value})}>{[0,1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
      </div>
      <div className="frow">
        <div className="fg"><label className="fl">Dinners/week</label><select className="fsel" value={prefs.meals} onChange={e=>sP({...prefs,meals:+e.target.value})}>{[3,4,5,6,7].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
        <div className="fg"><label className="fl">Max cook time</label><select className="fsel" value={prefs.time} onChange={e=>sP({...prefs,time:+e.target.value})}>{[15,20,25,30,45].map(n=><option key={n} value={n}>{n} min</option>)}</select></div>
      </div>
      <div className="fg"><label className="fl">Prep days</label><div className="dpick">{DAYS.map(d=><button key={d} className={`dchip ${(prefs.prepDays||["Sunday"]).includes(d)?"on":""}`} onClick={()=>{const ds=prefs.prepDays||["Sunday"];const n=ds.includes(d)?ds.filter(x=>x!==d):[...ds,d];if(n.length)sP({...prefs,prepDays:n})}}>{d.slice(0,3)}</button>)}</div></div>
    </div>
    {/* My Stores */}
    <div className="cd">
      <div className="fl" style={{fontSize:15,marginBottom:4}}>My Stores</div>
      <p style={{fontSize:12,color:"var(--i3)",marginBottom:12}}>Used to split shopping lists and tag restock items. Each family member can have their own setup.</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
        {userStores.map(s=><span key={s} className="store-chip" style={{background:"var(--rub)",color:"var(--ru)",border:"1px solid #EAC4B8"}}>
          {I.store}&nbsp;{s}
          <button className="store-chip-rm" onClick={()=>removeStore(s)}>×</button>
        </span>)}
      </div>
      <div style={{display:"flex",gap:8}}>
        <input className="fi" style={{flex:1}} placeholder="Add a store..." value={storeInput} onChange={e=>setStoreInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")addStore(storeInput)}}/>
        <button className="btn bg bsm" onClick={()=>addStore(storeInput)}>Add</button>
      </div>
    </div>
    <div className="cd">
      <div className="fl" style={{fontSize:15,marginBottom:12}}>Meal Preferences</div>
      <div className="fg"><label className="fl">Protein</label><select className="fsel" value={prefs.proteinPriority||"medium"} onChange={e=>sP({...prefs,proteinPriority:e.target.value})}><option value="high">High protein</option><option value="medium">Balanced</option><option value="low">Lighter</option></select></div>
      <div className="frow">
        <div className="fg"><label className="fl">Max pasta/wk</label><select className="fsel" value={prefs.maxPastaPerWeek??2} onChange={e=>sP({...prefs,maxPastaPerWeek:+e.target.value})}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n||"None"}</option>)}</select></div>
        <div className="fg"><label className="fl">Max red meat/wk</label><select className="fsel" value={prefs.maxRedMeatPerWeek??2} onChange={e=>sP({...prefs,maxRedMeatPerWeek:+e.target.value})}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n||"None"}</option>)}</select></div>
      </div>
      <div className="fg"><label className="fl">Dietary notes</label><textarea className="fta" style={{minHeight:60}} value={prefs.diet} onChange={e=>sP({...prefs,diet:e.target.value})} placeholder="No shellfish, low carb weekdays, love Mediterranean..."/></div>
    </div>
  </>}
  </main>

  {/* ── NAV ── */}
  <nav className="bnav">{[
    {id:"home",label:"Home",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
    {id:"plan",label:"Plan",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>},
    {id:"shop",label:"Shop",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>},
    {id:"recipes",label:"Recipes",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>},
    {id:"restock",label:"Restock",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>},
  ].map(t=><button key={t.id} className={`nb ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}><div style={{width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.icon}</div>{t.label}</button>)}</nav>

  {/* ── MODALS ── */}

  {/* Recipe modal */}
  {modal?.type==="recipe"&&<div className="ov" onClick={e=>e.target===e.currentTarget&&setModal(null)}><div className="mdl">
    <div className="mdl-hd"><h3>{modal.data?"Edit":"Add Recipe"}</h3><button className="ib" onClick={()=>setModal(null)}>{I.x}</button></div>
    <RecipeForm r={modal.data} onSave={r=>{if(modal.data)sR(recipes.map(x=>x.id===modal.data.id?{...r,id:modal.data.id,favorite:modal.data.favorite}:x));else sR([...recipes,{...r,id:"r"+Date.now(),favorite:false}]);setModal(null);flash(modal.data?"Updated":"Added!")}}/>
  </div></div>}

  {/* Supply modal */}
  {modal?.type==="supply"&&<div className="ov" onClick={e=>e.target===e.currentTarget&&setModal(null)}><div className="mdl">
    <div className="mdl-hd"><h3>{modal.data?"Edit":"Track Item"}</h3><button className="ib" onClick={()=>setModal(null)}>{I.x}</button></div>
    <SupplyForm s={modal.data} stores={userStores} onSave={s=>{if(modal.data)sS(supplies.map(x=>x.id===modal.data.id?{...s,id:modal.data.id}:x));else sS([...supplies,{...s,id:"s"+Date.now()}]);setModal(null);flash(modal.data?"Updated":"Tracking!")}} onClose={()=>setModal(null)}/>
  </div></div>}

  {/* Receipt scanner modal */}
  {modal?.type==="scanner"&&<div className="ov" onClick={e=>e.target===e.currentTarget&&setModal(null)}><div className="mdl">
    <div className="mdl-hd"><h3>Add Receipt</h3><button className="ib" onClick={()=>setModal(null)}>{I.x}</button></div>
    <div className="mdl-bd">
      {!scannedResult?<>
        <input type="file" ref={fileRef} accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{if(e.target.files[0])scanImage(e.target.files[0])}}/>

        {/* paste is the primary path — every store sends email receipts */}
        <div style={{marginBottom:12}}>
          <label className="fl">Paste your receipt or order confirmation email</label>
          <div style={{position:"relative"}}>
            <textarea className="fta" style={{minHeight:140,fontSize:13,paddingBottom:48}}
              value={scanText} onChange={e=>setScanText(e.target.value)}
              placeholder={"Paste your Instacart, Costco, Wegmans, or any grocery confirmation email here..."}
              autoFocus/>
            {scanText.trim()&&<button className="btn bg"
              style={{position:"absolute",bottom:8,right:8,left:8,width:"auto",padding:"9px",fontSize:13}}
              disabled={scanning} onClick={scanTextContent}>
              {scanning?<><div className="dots" style={{padding:0,display:"inline-flex",gap:4}}><span/><span/><span/></div> Reading...</>:"Read Receipt"}
            </button>}
          </div>
        </div>

        {/* photo as secondary option */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
          <div style={{flex:1,height:1,background:"var(--sand)"}}/>
          <span style={{fontSize:11,color:"var(--i3)",fontWeight:600}}>OR</span>
          <div style={{flex:1,height:1,background:"var(--sand)"}}/>
        </div>
        <div className="upload-zone" style={{padding:"14px",marginTop:10,display:"flex",alignItems:"center",gap:12,textAlign:"left"}}
          onClick={()=>fileRef.current?.click()}>
          <div style={{fontSize:24}}>📷</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>Take or upload a photo</div>
            <div style={{fontSize:11,color:"var(--i3)"}}>Photo of a printed receipt</div>
          </div>
        </div>

        {scanning&&!scanText.trim()&&<div style={{textAlign:"center",marginTop:16}}>
          <div className="dots"><span/><span/><span/></div>
          <p style={{fontSize:13,color:"var(--i3)",marginTop:8}}>Reading receipt...</p>
        </div>}
      </>:<>
        {/* scanned result review */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontFamily:"var(--hd)",fontSize:18,fontWeight:500}}>{scannedResult.storeName||"Receipt"}</div>
              <div style={{fontSize:13,color:"var(--i3)"}}>{scannedResult.date||"Today"}{scannedResult.total?` · ${scannedResult.total}`:""}</div>
            </div>
            <button className="btn bs bsm" onClick={()=>setScannedResult(null)}>Re-scan</button>
          </div>
          <div className="fg">
            <label className="fl">Store</label>
            <select className="fsel" defaultValue={scannedResult.storeName||userStores[0]||""} id="scan-store-select">
              {userStores.map(s=><option key={s} value={s}>{s}</option>)}
              {scannedResult.storeName&&!userStores.includes(scannedResult.storeName)&&
                <option value={scannedResult.storeName}>{scannedResult.storeName}</option>}
            </select>
          </div>
          <div style={{fontSize:12,fontWeight:700,color:"var(--i3)",marginBottom:6}}>{scannedResult.items?.length||0} ITEMS FOUND</div>
          <div style={{maxHeight:300,overflowY:"auto",border:"1px solid var(--sand)",borderRadius:10}}>
            {(scannedResult.items||[]).map((item,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderBottom:i<scannedResult.items.length-1?"1px solid var(--sand)":"none"}}>
              <div>
                <div style={{fontSize:13.5,fontWeight:600}}>{item.name}</div>
                <div style={{fontSize:11,color:"var(--i3)"}}>{item.category}{item.quantity>1?` · qty ${item.quantity}`:""}</div>
              </div>
              {item.price&&<span style={{fontSize:13,color:"var(--i2)",whiteSpace:"nowrap",marginLeft:8}}>{item.price}</span>}
            </div>)}
          </div>
        </div>
      </>}
    </div>
    {scannedResult&&<div className="mdl-ft">
      <button className="btn bs" onClick={()=>setScannedResult(null)}>Back</button>
      <button className="btn bg" onClick={()=>{
        const sel=document.getElementById("scan-store-select");
        savePurchase(scannedResult,sel?.value);
      }}>Save to History</button>
    </div>}
  </div></div>}

  {/* Purchase history modal */}
  {modal?.type==="history"&&<div className="ov" onClick={e=>e.target===e.currentTarget&&setModal(null)}><div className="mdl">
    <div className="mdl-hd"><h3>Purchase History</h3><button className="ib" onClick={()=>setModal(null)}>{I.x}</button></div>
    <div className="mdl-bd">
      {purchases.length===0?<p style={{color:"var(--i3)",fontSize:14}}>No purchases scanned yet. Scan a receipt to get started.</p>
      :purchases.map(p=><div className="ph-card" key={p.id} style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div><span className="ph-store-badge">{p.storeName}</span>{p.total&&<span style={{fontSize:12,color:"var(--i3)"}}>{p.total}</span>}</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,color:"var(--i3)"}}>{p.date}</span>
            <button className="ib dng" style={{width:28,height:28}} onClick={()=>{sPh(purchases.filter(x=>x.id!==p.id));flash("Removed")}}>{I.trash}</button>
          </div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {p.items.slice(0,8).map((item,i)=><span key={i} style={{fontSize:11,padding:"2px 7px",background:"var(--sand)",borderRadius:10,color:"var(--i2)"}}>{item.name}</span>)}
          {p.items.length>8&&<span style={{fontSize:11,padding:"2px 7px",background:"var(--sand)",borderRadius:10,color:"var(--i3)"}}>+{p.items.length-8} more</span>}
        </div>
      </div>)}
    </div>
  </div></div>}

  {toast&&<div className="toast">{toast}</div>}
  </div></>);
}

function RecipeForm({r,onSave}){
  const[n,sN]=useState(r?.name||"");const[t,sT]=useState(r?.time||25);const[sv,sSv]=useState(r?.servings||4);
  const[ig,sIg]=useState(r?.ingredients||"");const[p,sP]=useState(r?.prep||"");const[f,sF]=useState(r?.finish||"");
  const[sr,sSr]=useState(r?.source||"");const[m,sM]=useState(!!(r?.prep||r?.finish));
  return<><div className="mdl-bd">
    <div className="fg"><label className="fl">What's the dish?</label><input className="fi" value={n} onChange={e=>sN(e.target.value)} placeholder="Chicken Fajitas" autoFocus/></div>
    <div className="frow"><div className="fg"><label className="fl">Time (min)</label><input className="fi" type="number" inputMode="numeric" value={t} onChange={e=>sT(e.target.value)}/></div><div className="fg"><label className="fl">Serves</label><input className="fi" type="number" inputMode="numeric" value={sv} onChange={e=>sSv(e.target.value)}/></div></div>
    <div className="fg"><label className="fl">Ingredients <small>(exact amounts)</small></label><textarea className="fta" value={ig} onChange={e=>sIg(e.target.value)} placeholder={"1.5 lb chicken thighs\n3 bell peppers\n2 tbsp olive oil"}/></div>
    {!m&&<button className="btn bo" style={{marginBottom:14,width:"100%"}} onClick={()=>sM(true)}>+ Add prep & cooking steps</button>}
    {m&&<><div className="fg"><label className="fl">Prep ahead</label><textarea className="fta" value={p} onChange={e=>sP(e.target.value)} placeholder="Slice veggies, marinate chicken..."/></div><div className="fg"><label className="fl">Day-of</label><textarea className="fta" value={f} onChange={e=>sF(e.target.value)} placeholder="400°F sheet pan, 20 min..."/></div></>}
    <div className="fg"><label className="fl">Source <small>(optional)</small></label><input className="fi" value={sr} onChange={e=>sSr(e.target.value)} placeholder="NYT Cooking, etc."/></div>
  </div>
  <div className="mdl-ft"><button className="btn bg" disabled={!n.trim()} onClick={()=>onSave({name:n.trim(),time:+t||25,servings:+sv||4,ingredients:ig.trim(),prep:p.trim(),finish:f.trim(),source:sr.trim()})}>{r?"Save":"Add Recipe"}</button></div></>
}

function SupplyForm({s,stores,onSave,onClose}){
  const[n,sN]=useState(s?.name||"");
  const[w,sW]=useState(s?.where||(stores?.[0]||""));
  const[wk,sWk]=useState(s?.weeks||4);
  const[l,sL]=useState(s?.last||"");
  const storeOpts=stores&&stores.length?stores:["My Store"];
  return<><div className="mdl-bd">
    <div className="fg"><label className="fl">Item</label><input className="fi" value={n} onChange={e=>sN(e.target.value)} placeholder="Paper Towels" autoFocus/></div>
    <div className="frow">
      <div className="fg"><label className="fl">Store</label>
        <select className="fsel" value={w} onChange={e=>sW(e.target.value)}>
          {storeOpts.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div className="fg"><label className="fl">Every __ weeks</label><input className="fi" type="number" inputMode="numeric" value={wk} onChange={e=>sWk(e.target.value)}/></div>
    </div>
    <div className="fg"><label className="fl">Last bought <small>(optional)</small></label><input className="fi" type="date" value={l} onChange={e=>sL(e.target.value)}/></div>
  </div>
  <div className="mdl-ft"><button className="btn bs" onClick={onClose}>Cancel</button><button className="btn bg" disabled={!n.trim()} onClick={()=>onSave({name:n.trim(),where:w,weeks:+wk||4,last:l||null})}>{s?"Save":"Track"}</button></div></>
}
  const savePurchase=(result,store)=>{
    const purchase={
      id:"p"+Date.now(),
      date:result.date||new Date().toISOString().split("T")[0],
      storeName:store||result.storeName||"Unknown Store",
      total:result.total||null,
      items:result.items||[],
    };
    const updated=[purchase,...purchases].slice(0,50);
    sPh(updated);
    setScannedResult(null);setScanText("");
    flash(`Saved ${purchase.items.length} items from ${purchase.storeName}!`);
    setModal(null);
  };
