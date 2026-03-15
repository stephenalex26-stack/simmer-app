import { useState } from "react";

/*  SIMMER v4 — simmer-app.netlify.app
    Complete rebuild: calm home dashboard for a working mom  */

const LS={r:"sm4-recipes",p:"sm4-prefs",pl:"sm4-plan",s:"sm4-supplies",ck:"sm4-checked",rt:"sm4-ratings",pa:"sm4-pantry",hi:"sm4-history"};
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
const DEF_PREFS={meals:5,time:30,prepDays:["Sunday"],adults:2,kids:3,diet:"",proteinPriority:"medium",maxPastaPerWeek:2,maxRedMeatPerWeek:2};

/* ── icons (compact) ── */
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
};

/* ── CSS ── */
const css=`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,700&family=Nunito+Sans:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#FFFCF7;--card:#FFF;--sand:#F0EBDF;--sd:#DDD6C6;--ink:#201C14;--i2:#5E5646;--i3:#9A917E;--i4:#C4BAA8;--ru:#C04E28;--ruh:#A8421F;--rub:#FEF0EB;--sa:#3F7A52;--sab:#EDF6F0;--am:#B07D10;--amb:#FFF8E7;--rb:#FEF2F0;--rd:#C23A2A;--r:14px;--sh:0 1px 4px rgba(32,28,20,.06);--s2:0 6px 24px rgba(32,28,20,.1);--hd:'Fraunces',Georgia,serif;--bd:'Nunito Sans',-apple-system,sans-serif}
html,body{font-family:var(--bd);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;min-height:100dvh}
.shell{min-height:100dvh;display:flex;flex-direction:column;padding-bottom:72px}
.page{flex:1;max-width:560px;margin:0 auto;padding:20px 16px;width:100%}

/* nav */
.bnav{position:fixed;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid var(--sd);display:flex;z-index:100;padding:6px 0 env(safe-area-inset-bottom,8px)}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border:none;background:none;color:var(--i3);font-family:var(--bd);font-size:10.5px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent}.nb.on{color:var(--ru)}.nb.on svg{stroke:var(--ru)}

/* typography */
.hd{font-family:var(--hd)}.pg-t{font-family:var(--hd);font-size:28px;font-weight:500;letter-spacing:-.5px}.pg-s{color:var(--i2);font-size:14px;margin-top:4px;margin-bottom:20px}

/* buttons */
.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:16px;border:none;border-radius:var(--r);font-family:var(--bd);font-size:15px;font-weight:700;cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent}
.bg{background:var(--ru);color:#fff}.bg:hover{background:var(--ruh)}.bg:active{transform:scale(.98)}.bg:disabled{opacity:.4;cursor:default;transform:none}
.bs{background:var(--sand);color:var(--ink)}.bs:active{background:var(--sd)}
.bo{background:none;border:1.5px solid var(--sd);color:var(--i2);width:auto;padding:10px 16px;font-size:13px}.bo:active{background:var(--sand)}
.bsm{width:auto;padding:10px 18px;font-size:13px}

/* cards */
.cd{background:var(--card);border:1px solid var(--sand);border-radius:var(--r);padding:20px;box-shadow:var(--sh);margin-bottom:12px}

/* home dashboard cards */
.hcard{background:var(--card);border:1px solid var(--sand);border-radius:16px;padding:20px;margin-bottom:12px;box-shadow:var(--sh);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:box-shadow .15s}
.hcard:active{box-shadow:var(--s2)}
.hcard-icon{font-size:28px;margin-bottom:8px}
.hcard-title{font-family:var(--hd);font-size:17px;font-weight:500;margin-bottom:4px}
.hcard-desc{font-size:13px;color:var(--i2);line-height:1.45}
.hcard-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;margin-top:8px}

/* tonight card (hero) */
.tonight{background:linear-gradient(135deg,var(--rub) 0%,#FFF 60%,var(--sab) 100%);border:1.5px solid var(--sd);border-radius:18px;padding:24px 20px;margin-bottom:16px}
.tonight-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--i3);margin-bottom:6px}
.tonight-meal{font-family:var(--hd);font-size:22px;font-weight:500;margin-bottom:4px}
.tonight-time{font-size:13px;color:var(--ru);font-weight:600}
.tonight-steps{margin-top:12px;font-size:13.5px;color:var(--i2);line-height:1.55}
.tonight-sub{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--i3);margin-top:10px;margin-bottom:3px}

/* nudge */
.nudge{display:flex;align-items:flex-start;gap:10px;padding:14px;border-radius:var(--r);margin-bottom:12px;font-size:13px;line-height:1.45}
.nudge-am{background:var(--amb);color:#7A5A08}
.nudge-sa{background:var(--sab);color:var(--sa)}
.nudge-ru{background:var(--rub);color:var(--ru)}

/* dots */
.dots{display:flex;gap:6px;justify-content:center;padding:16px}.dots span{width:8px;height:8px;background:var(--ru);border-radius:50%;animation:pop 1.4s ease infinite}.dots span:nth-child(2){animation-delay:.2s}.dots span:nth-child(3){animation-delay:.4s}
@keyframes pop{0%,80%,100%{transform:scale(.5);opacity:.3}40%{transform:scale(1);opacity:1}}

/* prep box */
.prb{background:var(--sab);border:1px solid #C5DEC9;border-radius:var(--r);padding:16px;margin-bottom:16px}
.prb-t{font-family:var(--hd);font-size:16px;font-weight:500;color:var(--sa);margin-bottom:10px}
.prb ol{list-style:none;counter-reset:p;padding:0}.prb li{counter-increment:p;font-size:13.5px;color:#2B5E3B;padding:5px 0 5px 28px;position:relative;line-height:1.45}.prb li::before{content:counter(p);position:absolute;left:0;width:20px;height:20px;background:#C5DEC9;color:var(--sa);border-radius:50%;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;top:6px}

/* day cards */
.dc{background:var(--card);border:1px solid var(--sand);border-radius:var(--r);margin-bottom:8px;overflow:hidden;box-shadow:var(--sh)}
.dc-top{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent}.dc-top:active{background:var(--sand)}
.dc-day{font-family:var(--hd);font-size:15px;font-weight:500}.dc-meal{font-size:13px;color:var(--i2);margin-top:1px}
.dc-time{font-size:12px;font-weight:600;color:var(--ru);background:var(--rub);padding:3px 10px;border-radius:20px}
.dc-body{padding:4px 16px 14px;border-top:1px solid var(--sand)}
.dc-lb{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--i3);margin-top:10px;margin-bottom:3px}
.dc-tx{font-size:13.5px;line-height:1.5;color:var(--i2)}
.sp{font-size:11px;padding:2px 8px;background:var(--sab);color:var(--sa);border-radius:12px;font-weight:600;display:inline-block;margin:2px 2px 0 0}

/* rate + swap */
.rate-row{display:flex;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--sand)}
.rate-btn{display:flex;align-items:center;gap:4px;padding:6px 12px;border:1.5px solid var(--sd);border-radius:8px;background:none;font-family:var(--bd);font-size:12px;font-weight:600;color:var(--i3);cursor:pointer}.rate-btn:active{background:var(--sand)}.rate-btn.loved{border-color:var(--sa);color:var(--sa);background:var(--sab)}.rate-btn.skip{border-color:var(--rd);color:var(--rd);background:var(--rb)}
.swbtn{display:flex;align-items:center;gap:5px;margin-top:10px;padding:8px 14px;border:1.5px solid var(--sd);border-radius:10px;background:none;font-family:var(--bd);font-size:12px;font-weight:600;color:var(--i3);cursor:pointer}.swbtn:active{background:var(--sand)}
.swpick{margin-top:10px;padding-top:10px;border-top:1px solid var(--sand)}
.swopt{display:flex;justify-content:space-between;align-items:center;padding:10px;border:1.5px solid var(--sd);border-radius:10px;margin-bottom:6px;cursor:pointer}.swopt:active{background:var(--sand)}

/* shop */
.shcat{margin-bottom:14px}.shcat-t{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--i3);padding-bottom:6px;border-bottom:1px solid var(--sand);margin-bottom:4px}
.shrow{display:flex;align-items:center;gap:12px;padding:10px 4px;cursor:pointer;border-radius:8px;-webkit-tap-highlight-color:transparent}.shrow:active{background:var(--sand)}.shrow.ck{opacity:.35;text-decoration:line-through}
.shchk{width:22px;height:22px;border:2px solid var(--sd);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:transparent}.shrow.ck .shchk{background:var(--sa);border-color:var(--sa);color:#fff}

/* recipes */
.rc{background:var(--card);border:1px solid var(--sand);border-radius:var(--r);padding:16px;margin-bottom:10px;box-shadow:var(--sh)}
.rc-top{display:flex;justify-content:space-between;align-items:flex-start}
.rc-name{font-family:var(--hd);font-size:16px;font-weight:500}
.rc-meta{display:flex;gap:6px;margin-top:5px;flex-wrap:wrap}
.pill{font-size:11px;font-weight:600;padding:2px 9px;border-radius:12px}
.fav-btn{border:none;background:none;cursor:pointer;padding:4px;color:var(--i4)}.fav-btn.on{color:#e25555}
.rx{padding:12px 0 0;border-top:1px solid var(--sand);margin-top:10px;font-size:13px;color:var(--i2);line-height:1.55}
.rx-lb{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--i3);margin-top:8px;margin-bottom:3px}

/* supplies */
.scard{background:var(--card);border:1px solid var(--sand);border-radius:var(--r);padding:14px 16px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;box-shadow:var(--sh)}
.badge{padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}.badge-r{background:var(--rb);color:var(--rd)}.badge-a{background:var(--amb);color:var(--am)}.badge-g{background:var(--sab);color:var(--sa)}
.ib{width:36px;height:36px;border:none;background:none;color:var(--i4);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer}.ib:active{background:var(--sand)}.ib.dng:active{background:var(--rb);color:var(--rd)}

/* modal */
.ov{position:fixed;inset:0;background:rgba(32,28,20,.35);backdrop-filter:blur(3px);z-index:200;display:flex;align-items:flex-end;justify-content:center;animation:fi .15s}@media(min-width:600px){.ov{align-items:center}}
.mdl{background:var(--card);width:100%;max-width:500px;max-height:90dvh;overflow-y:auto;box-shadow:var(--s2);animation:su .25s;border-radius:20px 20px 0 0}@media(min-width:600px){.mdl{border-radius:20px}}
.mdl-hd{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--sand);position:sticky;top:0;background:var(--card);z-index:1;border-radius:20px 20px 0 0}
.mdl-hd h3{font-family:var(--hd);font-size:18px;font-weight:500}
.mdl-bd{padding:20px}.mdl-ft{padding:14px 20px;border-top:1px solid var(--sand);display:flex;gap:8px}.mdl-ft .btn{flex:1}

/* form */
.fg{margin-bottom:14px}.fl{display:block;font-size:12.5px;font-weight:700;margin-bottom:5px}.fl small{color:var(--i3);font-weight:400}
.fi{width:100%;padding:12px 14px;border:1.5px solid var(--sd);border-radius:10px;font-family:var(--bd);font-size:15px;color:var(--ink);background:var(--card);outline:none;-webkit-appearance:none}.fi:focus{border-color:var(--ru);box-shadow:0 0 0 3px rgba(192,78,40,.1)}
.fta{width:100%;padding:12px 14px;border:1.5px solid var(--sd);border-radius:10px;font-family:var(--bd);font-size:15px;color:var(--ink);background:var(--card);outline:none;min-height:80px;resize:vertical;line-height:1.5}.fta:focus{border-color:var(--ru);box-shadow:0 0 0 3px rgba(192,78,40,.1)}
.fsel{width:100%;padding:12px 14px;border:1.5px solid var(--sd);border-radius:10px;font-family:var(--bd);font-size:15px;color:var(--ink);background:var(--card);outline:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='12' height='8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239A917E' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.dpick{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.dchip{padding:8px 14px;border:1.5px solid var(--sd);border-radius:20px;background:none;font-family:var(--bd);font-size:13px;font-weight:600;color:var(--i3);cursor:pointer}.dchip:active{transform:scale(.95)}.dchip.on{background:var(--ru);border-color:var(--ru);color:#fff}

.toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:var(--s2);animation:su .15s;z-index:300;white-space:nowrap}
.err-bar{background:var(--rb);color:var(--rd);padding:12px 16px;border-radius:var(--r);margin-bottom:14px;font-size:13px}

/* onboard */
.ob{max-width:420px;margin:0 auto;padding:48px 20px;text-align:center}
.ob-logo{width:56px;height:56px;background:var(--rub);border:2px solid #EAC4B8;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:30px}
.ob h2{font-family:var(--hd);font-size:26px;margin-bottom:8px}.ob>p{color:var(--i2);font-size:14px;margin-bottom:32px;line-height:1.55}.ob .fg{text-align:left}

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
  const[extraItems,setExtraItems]=useState([]);
  const[addingItem,setAddingItem]=useState("");
  const[shopFilter,setShopFilter]=useState("all");

  const sR=v=>{setRecipes(v);sv(LS.r,v)};const sP=v=>{setPrefs(v);sv(LS.p,v)};const sPl=v=>{setPlan(v);sv(LS.pl,v)};const sS=v=>{setSupplies(v);sv(LS.s,v)};const sC=v=>{setChecked(v);sv(LS.ck,v)};const sRt=v=>{setRatings(v);sv(LS.rt,v)};const sPa=v=>{setPantry(v);sv(LS.pa,v)};const sHi=v=>{setHistory(v);sv(LS.hi,v)};
  const flash=m=>{setToast(m);setTimeout(()=>setToast(null),2200)};
  const toggleFav=id=>sR(recipes.map(r=>r.id===id?{...r,favorite:!r.favorite}:r));
  const rateMeal=(n,r)=>{sRt({...ratings,[n]:r});flash(r==="loved"?"Added to favorites!":"Will avoid next time")};

  const ai=async(msgs)=>{const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:msgs})});const d=await r.json();if(d.error)throw new Error(typeof d.error==="string"?d.error:d.error.message||"Error");return d.content.map(i=>i.text||"").join("")};

  // format text into lines — splits on periods, newlines, or numbered patterns
  const fmt=(txt)=>{if(!txt)return[];if(Array.isArray(txt))return txt;return txt.split(/(?:\.\s+|\n+|(?=\d+[\.\)]\s))/).map(s=>s.replace(/^\d+[\.\)]\s*/,"").trim()).filter(s=>s.length>2)};

  const supStat=s=>{if(!s.last)return{t:"No date set",c:"badge-a"};const l=Math.round((new Date(s.last).getTime()+s.weeks*7*864e5-Date.now())/864e5);if(l<0)return{t:`${Math.abs(l)}d overdue`,c:"badge-r"};if(l<=7)return{t:`${l}d left`,c:"badge-a"};return{t:`${l}d`,c:"badge-g"}};
  const dueSoon=supplies.filter(s=>{if(!s.last)return true;return(new Date(s.last).getTime()+s.weeks*7*864e5-Date.now())/864e5<10});
  const overdue=supplies.filter(s=>{if(!s.last)return false;return(new Date(s.last).getTime()+s.weeks*7*864e5-Date.now())/864e5<0});

  // today's meal
  const today=DAYS[new Date().getDay()===0?6:new Date().getDay()-1];
  const todayMeal=plan?.meals?.find(m=>m.day===today);

  // import recipe
  const importRecipe=async()=>{if(!importText.trim())return;setImporting(true);const input=importText.trim();const isUrl=/^https?:\/\//i.test(input);try{const t=await ai([{role:"user",content:`${isUrl?`Extract the recipe from: ${input}`:`Organize this recipe:\n\n${input}`}\n\nReturn ONLY valid JSON:\n{"name":"Name","time":25,"servings":4,"ingredients":"EXACT measurements, comma separated","prep":"detailed prep-ahead steps","finish":"detailed day-of with temps and times","source":"${isUrl?"site name":"user recipe"}"}\n\nInclude EXACT measurements for every ingredient. Include all temperatures and times.`}]);const p=JSON.parse(t.replace(/```json|```/g,"").trim());sR([...recipes,{...p,id:"r"+Date.now(),favorite:false,source:p.source||""}]);setImportText("");flash(`Added: ${p.name}`);}catch(e){flash("Couldn't read that — try pasting the full recipe");}setImporting(false)};

  // generate plan
  const generate=async()=>{if(recipes.length<3){flash("Add at least 3 recipes first");setTab("recipes");return;}setLoading(true);setError(null);const favs=recipes.filter(r=>r.favorite).map(r=>r.name);const loved=Object.entries(ratings).filter(([,v])=>v==="loved").map(([k])=>k);const skip=Object.entries(ratings).filter(([,v])=>v==="skip").map(([k])=>k);
  const shuffled=[...recipes].sort(()=>Math.random()-.5);
  const rb=shuffled.map(r=>`"${r.name}"${r.favorite?" ⭐":""} (${r.time}min, serves ${r.servings})`).join("\n");
  const sb=dueSoon.length?`\nSUPPLIES DUE: ${dueSoon.map(s=>s.name).join(", ")}. Include "supplyReminders" array.`:"";
  const prevMeals=plan?.meals?.map(m=>m.name)||[];
  const prevNote=prevMeals.length?`\nLAST PLAN HAD: ${prevMeals.join(", ")}. You MUST pick a DIFFERENT combination this time. Rearrange days and swap at least 2 meals.`:"";
  const pantryNote=pantry.length?`\nALWAYS IN PANTRY (exclude from shopping list): ${pantry.join(", ")}`:"";
  const histNote=history.length>1?`\nRECENT WEEKS (don't repeat too much): ${history.slice(-4).map(h=>h.meals.join(", ")).join(" | ")}`:"";
  // detect cuisine preferences from recipe names
  const allNames=recipes.map(r=>r.name).join(" ").toLowerCase();
  const cuisineHints=[];
  if(allNames.match(/taco|fajita|burrito|mexican|salsa/))cuisineHints.push("Mexican");
  if(allNames.match(/stir.?fry|teriyaki|asian|soy|sesame/))cuisineHints.push("Asian");
  if(allNames.match(/pasta|bolognese|pesto|italian|parmesan/))cuisineHints.push("Italian");
  if(allNames.match(/salmon|fish|shrimp/))cuisineHints.push("Seafood");
  const seed=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  try{const t=await ai([{role:"user",content:`Plan ${prefs.meals} dinners. Seed:${seed}

HOUSEHOLD: ${prefs.adults} adults + ${prefs.kids} kids
MAX ACTIVE COOK TIME: ${prefs.time} min
PREP DAYS: ${(prefs.prepDays||["Sunday"]).join(", ")}
PROTEIN: ${prefs.proteinPriority||"medium"}
MAX PASTA: ${prefs.maxPastaPerWeek??2}/week
MAX RED MEAT: ${prefs.maxRedMeatPerWeek??2}/week
${prefs.diet?`RESTRICTIONS: ${prefs.diet}`:""}
${favs.length?`FAVORITES (use these more): ${favs.join(", ")}`:""}\
${loved.length?`\nFAMILY LOVED THESE: ${loved.join(", ")}`:""}\
${skip.length?`\nAVOID THESE: ${skip.join(", ")}`:""}\
${cuisineHints.length?`\nTHIS FAMILY LIKES: ${cuisineHints.join(", ")} cuisine`:""}\
${prevNote}\
${pantryNote}\
${histNote}
${sb}

USER'S SAVED RECIPES (use some of these, but also suggest 1-2 NEW recipes from your knowledge that fit this family's taste):
${rb}

CRITICAL FORMATTING RULES:
- "ingredients" must be an ARRAY of strings: ["1.5 lb chicken thighs", "3 bell peppers"]
- "prep" must be an ARRAY of SHORT steps: ["Slice 3 peppers into strips", "Toss chicken with 2 tbsp oil and seasoning"]  
- "finish" must be an ARRAY of SHORT steps: ["Preheat oven to 400°F", "Spread on sheet pan", "Bake 20 minutes"]
- "prepGuide.steps" must be SHORT individual steps — ONE task per step, never combine multiple recipes in one step
- Each prep step should be 1 sentence max, like: "Cook 6 cups rice in rice cooker"
- "prepGuide.summary" is a short list of what you'll have ready after prep
- Each meal needs "noPrepFinish" — full instructions for cooking from scratch if prep day was skipped
- For NEW recipes you suggest, include complete ingredients and instructions

Return valid JSON:
{"title":"creative theme","cost":"$XX-$XX","savings":"how this saves money",
"meals":[{"day":"Monday","name":"Recipe Name","time":15,
"ingredients":["1 lb ground beef","1 onion (diced)","3 garlic cloves"],
"prep":["Brown beef 5 min","Add diced onion, cook 3 min","Stir in sauce, simmer 10 min","Cool and refrigerate"],
"finish":["Reheat sauce over medium heat","Boil pasta 8 min","Toss and serve with parmesan"],
"noPrepFinish":["Dice 1 onion and mince 3 garlic cloves","Brown 1 lb beef in large pot 5 min","Add onion 3 min, garlic 1 min","Stir in 28oz crushed tomatoes + 2 tbsp paste + seasoning","Simmer 15 min while pasta boils","Toss and serve with parmesan"],
"shared":["rice","bell peppers"]}],
"prepGuide":{"minutes":75,"summary":["Marinated chicken for Monday fajitas","Cooked 6 cups rice for Tue + Thu","Teriyaki glaze for Wednesday","Browned beef + sauce for Friday"],"steps":["Cook 6 cups rice in rice cooker","Slice 3 bell peppers into strips","Dice 2 onions","Season and marinate chicken with 2 tbsp oil + fajita seasoning","Brown 1 lb ground beef, drain fat","Make teriyaki glaze: whisk soy sauce + honey + vinegar","Cool and store everything in labeled containers"]},
"shoppingList":{"Vegetables":["3 bell peppers (Mon + Wed)","2 onions"],"Fruits":[],"Meat & Seafood":["1.5 lb chicken thighs","1 lb ground beef"],"Dairy & Eggs":["1/2 cup parmesan"],"Herbs & Spices":["fresh cilantro","cumin"],"Grains & Pasta":["1 lb spaghetti","6 cups rice"],"Canned & Dry":["28oz crushed tomatoes","2 cans black beans"],"Condiments & Oils":["soy sauce","fajita seasoning"],"Frozen":[],"Bakery & Bread":["8 flour tortillas"],"Other":[]},
"reused":{"bell peppers":["Fajitas","Stir-Fry"],"rice":["Stir-Fry","Taco Bowls"]},
"supplyReminders":[]}`}]);
  const parsed=JSON.parse(t.replace(/```json|```/g,"").trim());sPl(parsed);sC({});setExpanded({});setSwapPicker(null);
  // save to history for AI learning
  const newHist=[...history,{date:new Date().toISOString().split("T")[0],meals:parsed.meals?.map(m=>m.name)||[]}].slice(-12);sHi(newHist);
  flash("New plan ready!");}catch(e){console.error("Generate error:",e);setError(e.message||"Couldn't generate — try again");}setLoading(false)};

  // swap meal
  const swapMeal=async(i,name)=>{setSwapping(i);const day=plan.meals[i].day;const r=recipes.find(x=>x.name===name);try{const t=await ai([{role:"user",content:`Write prep + finish for "${name}" for ${day}.\nIngredients: ${r?.ingredients||"use your knowledge"}\nPrep: ${r?.prep||"n/a"}\nFinish: ${r?.finish||"n/a"}\n\nJSON only:\n{"name":"${name}","time":${r?.time||25},"prep":"detailed prep","finish":"detailed finish","shared":[]}`}]);const m=JSON.parse(t.replace(/```json|```/g,"").trim());m.day=day;const nm=[...plan.meals];nm[i]=m;sPl({...plan,meals:nm});setSwapPicker(null);flash(`Swapped to ${name}`);}catch{flash("Try again");}setSwapping(null)};

  // copy + print
  const copyList=()=>{if(!plan?.shoppingList)return;let t=`🍲 ${plan.title}\n\n`;Object.entries(plan.shoppingList).filter(([,v])=>v?.length).forEach(([c,its])=>{t+=`${c}:\n${its.map(i=>`  □ ${i}`).join("\n")}\n\n`});navigator.clipboard.writeText(t);flash("Copied!")};
  const printPlan=()=>{if(!plan)return;let h=`<html><head><title>${plan.title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;padding:24px;font-size:13px;line-height:1.5}h1{font-size:22px;margin-bottom:16px}h2{font-size:16px;margin:18px 0 6px;border-bottom:1.5px solid #ddd;padding-bottom:4px}h3{font-size:13px;margin:12px 0 3px;text-transform:uppercase;letter-spacing:.5px;color:#888}.meal{margin-bottom:10px;padding:8px 0;border-bottom:1px solid #eee}.meal b{font-size:14px}.item{padding:3px 0 3px 20px;position:relative}.item::before{content:"☐";position:absolute;left:0}ol{padding-left:20px}ol li{margin-bottom:4px}@media print{body{padding:16px}}</style></head><body>`;h+=`<h1>🍲 ${plan.title}</h1>`;if(plan.prepGuide){h+=`<h2>Prep Day — ~${plan.prepGuide.minutes} min</h2><ol>`;plan.prepGuide.steps.forEach(s=>h+=`<li>${s}</li>`);h+=`</ol>`}h+=`<h2>Meals</h2>`;plan.meals?.forEach(m=>{h+=`<div class="meal"><b>${m.day}: ${m.name}</b> (${m.time}m)`;if(m.prep)h+=`<h3>Prepped</h3><div>${m.prep}</div>`;if(m.finish)h+=`<h3>Tonight</h3><div>${m.finish}</div>`;h+=`</div>`});h+=`<h2>Shopping List</h2>`;Object.entries(plan.shoppingList).filter(([,v])=>v?.length).forEach(([c,its])=>{h+=`<h3>${c}</h3>`;its.forEach(i=>h+=`<div class="item">${i}</div>`)});h+=`</body></html>`;const w=window.open("","_blank");w.document.write(h);w.document.close();w.print()};

  /* ═══ ONBOARDING ═══ */
  if(!onboarded)return(<><style>{css}</style><div className="ob"><div className="ob-logo">🍲</div><h2>Simmer</h2><p>Dinner's handled. Tell us about your family and we'll take care of the rest.</p>
  <div className="frow" style={{marginBottom:14,textAlign:"left"}}><div className="fg"><label className="fl">Adults</label><select className="fsel" value={prefs.adults} onChange={e=>setPrefs({...prefs,adults:+e.target.value})}>{[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</select></div><div className="fg"><label className="fl">Kids</label><select className="fsel" value={prefs.kids} onChange={e=>setPrefs({...prefs,kids:+e.target.value})}>{[0,1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></div></div>
  <div className="frow" style={{marginBottom:14,textAlign:"left"}}><div className="fg"><label className="fl">Dinners/week</label><select className="fsel" value={prefs.meals} onChange={e=>setPrefs({...prefs,meals:+e.target.value})}>{[3,4,5,6,7].map(n=><option key={n} value={n}>{n}</option>)}</select></div><div className="fg"><label className="fl">Max cook time</label><select className="fsel" value={prefs.time} onChange={e=>setPrefs({...prefs,time:+e.target.value})}>{[15,20,25,30,45].map(n=><option key={n} value={n}>{n} min</option>)}</select></div></div>
  <div className="fg" style={{textAlign:"left"}}><label className="fl">Prep days</label><div className="dpick">{DAYS.map(d=><button key={d} className={`dchip ${(prefs.prepDays||[]).includes(d)?"on":""}`} onClick={()=>{const ds=prefs.prepDays||["Sunday"];const n=ds.includes(d)?ds.filter(x=>x!==d):[...ds,d];if(n.length)setPrefs({...prefs,prepDays:n})}}>{d.slice(0,3)}</button>)}</div></div>
  <div className="fg" style={{textAlign:"left"}}><label className="fl">Protein priority</label><select className="fsel" value={prefs.proteinPriority} onChange={e=>setPrefs({...prefs,proteinPriority:e.target.value})}><option value="high">High protein</option><option value="medium">Balanced</option><option value="low">Lighter / plant-based</option></select></div>
  <div className="fg" style={{textAlign:"left"}}><label className="fl">Any dietary needs? <small>(optional)</small></label><input className="fi" value={prefs.diet} onChange={e=>setPrefs({...prefs,diet:e.target.value})} placeholder="No shellfish, low carb, kids hate mushrooms..."/></div>
  <button className="btn bg" style={{marginTop:12}} onClick={()=>{sP(prefs);setOnboarded(true);flash("Welcome!")}}>Let's Go</button></div></>);

  /* ═══ MAIN APP ═══ */
  return(<><style>{css}</style><div className="shell"><main className="page">

  {/* ── HOME ── */}
  {tab==="home"&&<>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <h1 className="pg-t">Hey there 🍲</h1>
      <button className="ib" onClick={()=>setTab("settings")} title="Settings">{I.gear}</button>
    </div>

    {/* Tonight's dinner — hero card */}
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

    {/* Nudges */}
    {overdue.length>0&&<div className="nudge nudge-am"><b>🏠</b><span>Time to restock: {overdue.map(s=>s.name).join(", ")}</span></div>}
    {!plan&&recipes.length>=3&&<div className="nudge nudge-sa"><b>✨</b><span>You have {recipes.length} recipes ready. Tap "Plan your week" above to get started!</span></div>}
    {recipes.length<3&&<div className="nudge nudge-ru"><b>📖</b><span>Add at least 3 recipes to start planning. Go to Recipes and paste a link or add your favorites!</span></div>}

    {/* Quick action cards */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
      <div className="hcard" onClick={()=>setTab("plan")}>
        <div className="hcard-icon">📋</div>
        <div className="hcard-title">This Week</div>
        <div className="hcard-desc">{plan?`${plan.meals?.length} meals planned`:"Generate a plan"}</div>
      </div>
      <div className="hcard" onClick={()=>setTab("shop")}>
        <div className="hcard-icon">🛒</div>
        <div className="hcard-title">Shopping</div>
        <div className="hcard-desc">{plan?.shoppingList?"View & check off list":"List ready after planning"}</div>
      </div>
      <div className="hcard" onClick={()=>setTab("recipes")}>
        <div className="hcard-icon">📖</div>
        <div className="hcard-title">Recipes</div>
        <div className="hcard-desc">{recipes.length} meals · {recipes.filter(r=>r.favorite).length} favorites</div>
      </div>
      <div className="hcard" onClick={()=>setTab("restock")}>
        <div className="hcard-icon">🏠</div>
        <div className="hcard-title">Restock</div>
        <div className="hcard-desc">{dueSoon.length>0?<span style={{color:"var(--am)"}}>{dueSoon.length} items due</span>:"All stocked up"}</div>
      </div>
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

      {plan.reused&&Object.keys(plan.reused).length>0&&<div style={{marginBottom:14}}><span style={{fontSize:12,fontWeight:700,color:"var(--i3)"}}>SHARED: </span>{Object.entries(plan.reused).map(([k,v])=><span key={k} className="sp">{k} ×{v.length}</span>)}</div>}

      {plan.prepGuide&&<div className="prb"><div className="prb-t">🔪 {(prefs.prepDays||["Sunday"]).join(" & ")} Prep — ~{plan.prepGuide.minutes} min</div>{plan.prepGuide.summary&&<div style={{marginBottom:12,padding:"10px 14px",background:"rgba(255,255,255,.6)",borderRadius:10}}><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"var(--sa)",marginBottom:6}}>After prep you'll have</div>{fmt(plan.prepGuide.summary).map((s,i)=><div key={i} style={{fontSize:13,color:"#2B5E3B",padding:"2px 0",paddingLeft:16,position:"relative"}}><span style={{position:"absolute",left:0}}>✓</span>{s}</div>)}</div>}<ol>{plan.prepGuide.steps.map((s,i)=><li key={i}>{s}</li>)}</ol></div>}

      {plan.meals?.map((m,i)=><div className="dc" key={i}>
        <div className="dc-top" onClick={()=>setExpanded(e=>({...e,[i]:!e[i]}))}>
          <div><div className="dc-day">{m.day}{m.day===today?" · Tonight":""}</div><div className="dc-meal">{m.name}</div></div>
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
      </div>)}
    </>}
  </>}

  {/* ── SHOP ── */}
  {tab==="shop"&&<>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><button className="ib" onClick={()=>setTab("home")} style={{marginLeft:-8}}>←</button><h1 className="pg-t">Shopping</h1></div>
    {plan?.shoppingList?<>
      {/* actions bar */}
      <div style={{display:"flex",gap:6,marginBottom:12}}><button className="btn bo bsm" onClick={copyList}>{I.copy} Copy</button><button className="btn bo bsm" onClick={printPlan}>🖨 Print</button></div>

      {/* add custom item */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <input className="fi" style={{flex:1}} value={addingItem} onChange={e=>setAddingItem(e.target.value)} placeholder="Add an item..." onKeyDown={e=>{if(e.key==="Enter"&&addingItem.trim()){setExtraItems([...extraItems,{name:addingItem.trim(),cat:"Other"}]);setAddingItem("");flash("Added")}}} />
        <button className="btn bg bsm" disabled={!addingItem.trim()} onClick={()=>{setExtraItems([...extraItems,{name:addingItem.trim(),cat:"Other"}]);setAddingItem("");flash("Added")}}>Add</button>
      </div>

      {/* filter tabs */}
      <div style={{display:"flex",gap:4,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {["all","unchecked","checked"].map(f=><button key={f} className={`dchip ${shopFilter===f?"on":""}`} onClick={()=>setShopFilter(f)} style={{fontSize:12,padding:"6px 12px"}}>{f==="all"?"All":f==="unchecked"?"Need":f==="Done"||"Done"}</button>)}
      </div>

      {/* shopping categories */}
      {Object.entries(plan.shoppingList).filter(([,v])=>v?.length).map(([cat,its])=>{
        const filtered=its.filter((item,i)=>{
          const k=`${cat}-${i}`;
          const isChecked=!!checked[k];
          if(shopFilter==="unchecked")return !isChecked;
          if(shopFilter==="checked")return isChecked;
          return true;
        });
        if(!filtered.length)return null;
        return <div className="shcat" key={cat}>
          <div className="shcat-t">{cat}</div>
          {its.map((item,i)=>{
            const k=`${cat}-${i}`;
            const isChecked=!!checked[k];
            if(shopFilter==="unchecked"&&isChecked)return null;
            if(shopFilter==="checked"&&!isChecked)return null;
            // check if item is in pantry
            const inPantry=pantry.some(p=>item.toLowerCase().includes(p.toLowerCase()));
            if(inPantry)return null;
            return <div key={k} className={`shrow ${isChecked?"ck":""}`}>
              <div className="shchk" onClick={()=>{const n={...checked,[k]:!checked[k]};sC(n)}}>{isChecked&&I.check}</div>
              <span style={{fontSize:14,flex:1}} onClick={()=>{const n={...checked,[k]:!checked[k]};sC(n)}}>{item}</span>
              <button className="ib" style={{width:28,height:28,fontSize:10,color:"var(--i4)"}} title="Already have this" onClick={()=>{const n={...checked,[k]:true};sC(n);flash("Got it")}}>✓</button>
            </div>
          })}
        </div>})}

      {/* extra items added by user */}
      {extraItems.length>0&&<div className="shcat"><div className="shcat-t">Added Items</div>{extraItems.map((item,i)=>{
        const k=`extra-${i}`;
        return <div key={k} className={`shrow ${checked[k]?"ck":""}`} onClick={()=>{const n={...checked,[k]:!checked[k]};sC(n)}}>
          <div className="shchk">{checked[k]&&I.check}</div>
          <span style={{fontSize:14,flex:1}}>{item.name}</span>
          <button className="ib dng" style={{width:28,height:28}} onClick={e=>{e.stopPropagation();setExtraItems(extraItems.filter((_,j)=>j!==i))}}>{I.trash}</button>
        </div>})}</div>}

      {plan.cost&&<p style={{fontSize:13,color:"var(--i3)",textAlign:"center",marginTop:12}}>Estimated: {plan.cost}</p>}

      {/* pantry section */}
      <div style={{marginTop:24,paddingTop:16,borderTop:"1px solid var(--sd)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div><div style={{fontFamily:"var(--hd)",fontSize:16,fontWeight:500}}>My Pantry</div><div style={{fontSize:12,color:"var(--i3)"}}>Items here are auto-excluded from shopping lists</div></div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
          {pantry.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",background:"var(--sand)",borderRadius:20,fontSize:12,fontWeight:600,color:"var(--i2)"}}>
            {item}
            <button style={{border:"none",background:"none",cursor:"pointer",color:"var(--i4)",fontSize:14,padding:0,lineHeight:1}} onClick={()=>sPa(pantry.filter((_,j)=>j!==i))}>×</button>
          </div>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input className="fi" style={{flex:1,padding:"8px 12px",fontSize:13}} placeholder="Add pantry staple (e.g. cumin, rice vinegar)..." id="pantry-input" onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){sPa([...pantry,e.target.value.trim()]);e.target.value="";flash("Added to pantry")}}} />
          <button className="btn bs bsm" onClick={()=>{const el=document.getElementById("pantry-input");if(el?.value.trim()){sPa([...pantry,el.value.trim()]);el.value="";flash("Added to pantry")}}}>Add</button>
        </div>
      </div>
    </>:<div style={{textAlign:"center",padding:"40px 20px",color:"var(--i3)"}}><p>Generate a meal plan first to see your shopping list here.</p><button className="btn bg" style={{marginTop:16}} onClick={()=>setTab("plan")}>{I.spark} Go to Plan</button></div>}
  </>}

  {/* ── RECIPES ── */}
  {tab==="recipes"&&<>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><button className="ib" onClick={()=>setTab("home")} style={{marginLeft:-8}}>←</button><h1 className="pg-t">Recipes</h1></div>
    <p className="pg-s">{recipes.length} meals · tap ❤️ to favorite</p>
    <div className="cd" style={{marginBottom:14}}><label className="fl">Add a recipe</label><textarea className="fta" style={{minHeight:60,marginBottom:8}} value={importText} onChange={e=>setImportText(e.target.value)} placeholder="Paste a recipe URL or the full recipe text..."/><button className="btn bg" disabled={!importText.trim()||importing} onClick={importRecipe}>{importing?"Reading recipe...":importText.trim()&&/^https?:\/\//i.test(importText.trim())?"Import from Link":"Add This Recipe"}</button></div>
    <button className="btn bo" style={{marginBottom:14,width:"100%"}} onClick={()=>setModal({type:"recipe"})}>{I.plus} Type it in manually</button>
    {recipes.map(r=><div className="rc" key={r.id}>
      <div className="rc-top"><div style={{display:"flex",gap:10,alignItems:"flex-start"}}><button className={`fav-btn ${r.favorite?"on":""}`} onClick={()=>toggleFav(r.id)}>{r.favorite?I.heartOn:I.heart}</button><div><div className="rc-name">{r.name}</div><div className="rc-meta"><span className="pill" style={{background:"var(--rub)",color:"var(--ru)"}}>{r.time}m</span><span className="pill" style={{background:"var(--sab)",color:"var(--sa)"}}>Serves {r.servings}</span>{r.source&&<span className="pill" style={{background:"var(--amb)",color:"var(--am)"}}>{r.source}</span>}</div></div></div><div style={{display:"flex",gap:2}}><button className="ib" onClick={()=>setModal({type:"recipe",data:r})}>{I.edit}</button><button className="ib dng" onClick={()=>{sR(recipes.filter(x=>x.id!==r.id));flash("Removed")}}>{I.trash}</button></div></div>
      <div style={{cursor:"pointer",padding:"8px 0 0",fontSize:12,color:"var(--i3)",fontWeight:600}} onClick={()=>setRecExp(e=>({...e,[r.id]:!e[r.id]}))}>{recExp[r.id]?"Hide details ▲":"View details ▼"}</div>
      {recExp[r.id]&&<div className="rx"><div className="rx-lb">Ingredients</div><ul style={{listStyle:"none",padding:0,margin:0}}>{(r.ingredients||"").split(/,\s*|\n/).filter(g=>g.trim()).map((g,j)=><li key={j} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",paddingLeft:16,position:"relative"}}><span style={{position:"absolute",left:0,color:"var(--i4)"}}>•</span>{g.trim()}</li>)}</ul>{r.prep&&<><div className="rx-lb">Prep Ahead</div><ol style={{paddingLeft:20,margin:0}}>{fmt(r.prep).map((s,j)=><li key={j} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",lineHeight:1.5}}>{s}</li>)}</ol></>}{r.finish&&<><div className="rx-lb">Day-of</div><ol style={{paddingLeft:20,margin:0}}>{fmt(r.finish).map((s,j)=><li key={j} style={{fontSize:13,color:"var(--i2)",padding:"3px 0",lineHeight:1.5}}>{s}</li>)}</ol></>}</div>}
    </div>)}
  </>}

  {/* ── RESTOCK ── */}
  {tab==="restock"&&<>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><button className="ib" onClick={()=>setTab("home")} style={{marginLeft:-8}}>←</button><h1 className="pg-t">Restock</h1></div>
    <p className="pg-s">Tap ↻ when you buy something</p>
    <button className="btn bg" style={{marginBottom:14}} onClick={()=>setModal({type:"supply"})}>{I.plus} Track Item</button>
    {supplies.map(s=>{const st=supStat(s);return <div className="scard" key={s.id}><div><h4 style={{fontSize:14.5,fontWeight:600}}>{s.name}</h4><p style={{fontSize:12,color:"var(--i3)",marginTop:1}}>{s.where} · every {s.weeks}wk</p></div><div style={{display:"flex",alignItems:"center",gap:6}}><span className={`badge ${st.c}`}>{st.t}</span><button className="ib" onClick={()=>{sS(supplies.map(x=>x.id===s.id?{...x,last:new Date().toISOString().split("T")[0]}:x));flash("Marked ordered")}}>{I.refresh}</button><button className="ib dng" onClick={()=>{sS(supplies.filter(x=>x.id!==s.id));flash("Removed")}}>{I.trash}</button></div></div>})}
  </>}

  {/* ── SETTINGS ── */}
  {tab==="settings"&&<>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><button className="ib" onClick={()=>setTab("home")} style={{marginLeft:-8}}>←</button><h1 className="pg-t">Settings</h1></div>
    <div className="cd">
      <div className="frow"><div className="fg"><label className="fl">Adults</label><select className="fsel" value={prefs.adults} onChange={e=>sP({...prefs,adults:+e.target.value})}>{[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</select></div><div className="fg"><label className="fl">Kids</label><select className="fsel" value={prefs.kids} onChange={e=>sP({...prefs,kids:+e.target.value})}>{[0,1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></div></div>
      <div className="frow"><div className="fg"><label className="fl">Dinners/week</label><select className="fsel" value={prefs.meals} onChange={e=>sP({...prefs,meals:+e.target.value})}>{[3,4,5,6,7].map(n=><option key={n} value={n}>{n}</option>)}</select></div><div className="fg"><label className="fl">Max cook time</label><select className="fsel" value={prefs.time} onChange={e=>sP({...prefs,time:+e.target.value})}>{[15,20,25,30,45].map(n=><option key={n} value={n}>{n} min</option>)}</select></div></div>
      <div className="fg"><label className="fl">Prep days</label><div className="dpick">{DAYS.map(d=><button key={d} className={`dchip ${(prefs.prepDays||["Sunday"]).includes(d)?"on":""}`} onClick={()=>{const ds=prefs.prepDays||["Sunday"];const n=ds.includes(d)?ds.filter(x=>x!==d):[...ds,d];if(n.length)sP({...prefs,prepDays:n})}}>{d.slice(0,3)}</button>)}</div></div>
    </div>
    <div className="cd">
      <div className="fl" style={{fontSize:15,marginBottom:12}}>Meal Preferences</div>
      <div className="fg"><label className="fl">Protein</label><select className="fsel" value={prefs.proteinPriority||"medium"} onChange={e=>sP({...prefs,proteinPriority:e.target.value})}><option value="high">High protein</option><option value="medium">Balanced</option><option value="low">Lighter</option></select></div>
      <div className="frow"><div className="fg"><label className="fl">Max pasta/wk</label><select className="fsel" value={prefs.maxPastaPerWeek??2} onChange={e=>sP({...prefs,maxPastaPerWeek:+e.target.value})}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n||"None"}</option>)}</select></div><div className="fg"><label className="fl">Max red meat/wk</label><select className="fsel" value={prefs.maxRedMeatPerWeek??2} onChange={e=>sP({...prefs,maxRedMeatPerWeek:+e.target.value})}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n||"None"}</option>)}</select></div></div>
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
  {modal?.type==="recipe"&&<div className="ov" onClick={e=>e.target===e.currentTarget&&setModal(null)}><div className="mdl"><div className="mdl-hd"><h3>{modal.data?"Edit":"Add Recipe"}</h3><button className="ib" onClick={()=>setModal(null)}>{I.x}</button></div><RecipeForm r={modal.data} onSave={r=>{if(modal.data)sR(recipes.map(x=>x.id===modal.data.id?{...r,id:modal.data.id,favorite:modal.data.favorite}:x));else sR([...recipes,{...r,id:"r"+Date.now(),favorite:false}]);setModal(null);flash(modal.data?"Updated":"Added!")}} /></div></div>}
  {modal?.type==="supply"&&<div className="ov" onClick={e=>e.target===e.currentTarget&&setModal(null)}><div className="mdl"><div className="mdl-hd"><h3>{modal.data?"Edit":"Track Item"}</h3><button className="ib" onClick={()=>setModal(null)}>{I.x}</button></div><SupplyForm s={modal.data} onSave={s=>{if(modal.data)sS(supplies.map(x=>x.id===modal.data.id?{...s,id:modal.data.id}:x));else sS([...supplies,{...s,id:"s"+Date.now()}]);setModal(null);flash(modal.data?"Updated":"Tracking!")}} onClose={()=>setModal(null)} /></div></div>}
  {toast&&<div className="toast">{toast}</div>}
  </div></>);
}

function RecipeForm({r,onSave}){const[n,sN]=useState(r?.name||"");const[t,sT]=useState(r?.time||25);const[sv,sSv]=useState(r?.servings||4);const[ig,sIg]=useState(r?.ingredients||"");const[p,sP]=useState(r?.prep||"");const[f,sF]=useState(r?.finish||"");const[sr,sSr]=useState(r?.source||"");const[m,sM]=useState(!!(r?.prep||r?.finish));
return<><div className="mdl-bd"><div className="fg"><label className="fl">What's the dish?</label><input className="fi" value={n} onChange={e=>sN(e.target.value)} placeholder="Chicken Fajitas" autoFocus/></div><div className="frow"><div className="fg"><label className="fl">Time (min)</label><input className="fi" type="number" inputMode="numeric" value={t} onChange={e=>sT(e.target.value)}/></div><div className="fg"><label className="fl">Serves</label><input className="fi" type="number" inputMode="numeric" value={sv} onChange={e=>sSv(e.target.value)}/></div></div><div className="fg"><label className="fl">Ingredients <small>(exact amounts)</small></label><textarea className="fta" value={ig} onChange={e=>sIg(e.target.value)} placeholder={"1.5 lb chicken thighs\n3 bell peppers\n2 tbsp olive oil"}/></div>{!m&&<button className="btn bo" style={{marginBottom:14,width:"100%"}} onClick={()=>sM(true)}>+ Add prep & cooking steps</button>}{m&&<><div className="fg"><label className="fl">Prep ahead</label><textarea className="fta" value={p} onChange={e=>sP(e.target.value)} placeholder="Slice veggies, marinate chicken..."/></div><div className="fg"><label className="fl">Day-of</label><textarea className="fta" value={f} onChange={e=>sF(e.target.value)} placeholder="400°F sheet pan, 20 min..."/></div></>}<div className="fg"><label className="fl">Source <small>(optional)</small></label><input className="fi" value={sr} onChange={e=>sSr(e.target.value)} placeholder="NYT Cooking, etc."/></div></div><div className="mdl-ft"><button className="btn bg" disabled={!n.trim()} onClick={()=>onSave({name:n.trim(),time:+t||25,servings:+sv||4,ingredients:ig.trim(),prep:p.trim(),finish:f.trim(),source:sr.trim()})}>{r?"Save":"Add Recipe"}</button></div></>}

function SupplyForm({s,onSave,onClose}){const[n,sN]=useState(s?.name||"");const[w,sW]=useState(s?.where||"Costco");const[wk,sWk]=useState(s?.weeks||4);const[l,sL]=useState(s?.last||"");
return<><div className="mdl-bd"><div className="fg"><label className="fl">Item</label><input className="fi" value={n} onChange={e=>sN(e.target.value)} placeholder="Paper Towels" autoFocus/></div><div className="frow"><div className="fg"><label className="fl">Store</label><select className="fsel" value={w} onChange={e=>sW(e.target.value)}>{["Costco","Wegmans","Amazon","Target","Other"].map(o=><option key={o}>{o}</option>)}</select></div><div className="fg"><label className="fl">Every __ weeks</label><input className="fi" type="number" inputMode="numeric" value={wk} onChange={e=>sWk(e.target.value)}/></div></div><div className="fg"><label className="fl">Last bought <small>(optional)</small></label><input className="fi" type="date" value={l} onChange={e=>sL(e.target.value)}/></div></div><div className="mdl-ft"><button className="btn bs" onClick={onClose}>Cancel</button><button className="btn bg" disabled={!n.trim()} onClick={()=>onSave({name:n.trim(),where:w,weeks:+wk||4,last:l||null})}>{s?"Save":"Track"}</button></div></>}
