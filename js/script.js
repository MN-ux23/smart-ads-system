'use strict';
console.log('script.js loaded');

// UI references for splash screen, language selector, and audio
const langUI = document.getElementById('lang');
const logo   = document.getElementById('logo');
const hint   = document.getElementById('hint');
const app    = document.getElementById('app');
const veil   = document.getElementById('veil');
const audAR  = document.getElementById('aud-ar');
const audEN  = document.getElementById('aud-en');

const SHOW_LANG_AFTER = 2500;

// Helper: Normalize page paths
const abs = (p) => '/' + String(p || '').replace(/^\/+/, '');

// Track intro sound per language 
function keyFor(lang){ return `introPlayed_${lang}`; }
function hasPlayed(lang){ return sessionStorage.getItem(keyFor(lang)) === '1'; }
function markPlayed(lang){ sessionStorage.setItem(keyFor(lang), '1'); }

// Safe audio play/pause handlers 
function playAudioSafe(audio){
  try{
    if(!audio) return;
    audio.volume = 1.0;
    audio.currentTime = 0;
    const pr = audio.play();
    if (pr && pr.catch){ pr.catch(err => console.warn('[audio.play rejected]', err)); }
  }catch(err){ console.warn('[audio.play error]', err); }
}

function stopAudioSafe(audio){
  try{ if(audio){ audio.pause(); audio.currentTime = 0; } }catch(_){}
}

// Play intro sound only once for each language
function playIntroOnce(lang){
  const isAR = (lang === 'ar');
  const a = isAR ? audAR : audEN;
  if (!a) return;

  if (hasPlayed(lang)){
    console.log('[intro] already played');
    return;
  }

  try{
    a.currentTime = 0;
    a.play().then(()=>{
      markPlayed(lang);
      console.log('[intro] started for', lang);
    }).catch(err=>{
      console.warn('[intro failed]', err);
    });
  }catch(err){
    console.error('[intro play error]', err);
  }
}

// Developer utilities 
window.resetIntroSound = ()=>{
  sessionStorage.removeItem('introPlayed_ar');
  sessionStorage.removeItem('introPlayed_en');
};
window.testIntro = (lang='ar') =>
  (lang === 'ar' ? audAR : audEN)?.play();

// Splash screen animation (logo → language buttons)
window.addEventListener('DOMContentLoaded', ()=>{
  // ensure viewport meta exists
  let v = document.querySelector('meta[name="viewport"]');
  if(!v){
    v = document.createElement('meta');
    v.name = 'viewport';
    v.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(v);
  } else {
    v.setAttribute('content','width=device-width, initial-scale=1.0');
  }

  if (logo) requestAnimationFrame(()=> logo.classList.add('show'));
  if (langUI) setTimeout(()=> langUI.classList.add('show'), SHOW_LANG_AFTER);
});

// Inject form scripts when loading internal pages dynamically
async function rebindForms(){
  try{
    if (document.getElementById('pm-form')){
      await import('../js/pm_predict.js');
    }
    if (document.getElementById('ad-form')){
      await import('../js/ad_predict.js');
    }
  }catch(err){
    console.error('Rebind error:', err);
  }
}

// Load a new page into <div id="app"> using fetch and replace body
async function loadPage(url){
  const target = abs(url);
  try{
    if (veil) veil.classList.add('show');

    const res = await fetch(target, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    const html = await res.text();
    const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

    app.innerHTML = m ? m[1] : html;

    const splash = document.getElementById('splash');
    if (splash) splash.style.display = 'none';

    app.classList.add('show');
    await rebindForms();

  }catch(e){
    window.location.href = target; // fallback full reload
  }finally{
    if (veil) veil.classList.remove('show');
  }
}

// Handle language selection (AR/EN) + update UI direction
function go(lang){
  const isAR = (lang === 'ar');
  document.documentElement.lang = isAR ? 'ar' : 'en';
  document.documentElement.dir  = isAR ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', isAR);
  document.body.classList.toggle('ltr', !isAR);

  playIntroOnce(lang);

  const page = isAR ? '/pages/home-ar.html' : '/pages/home-en.html';
  history.pushState({ p: page, lang }, '', page);
  loadPage(page);
}

// Bind AR/EN language buttons
const btnAR = document.getElementById('btn-ar');
const btnEN = document.getElementById('btn-en');
if (btnAR) btnAR.onclick = () => go('ar');
if (btnEN) btnEN.onclick = () => go('en');

// Handle browser back/forward without replaying audio
window.addEventListener('popstate', (e)=>{
  if (e.state && e.state.p){
    const isAR = e.state.lang === 'ar';
    document.documentElement.lang = isAR ? 'ar' : 'en';
    document.documentElement.dir  = isAR ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isAR);
    document.body.classList.toggle('ltr', !isAR);

    stopAudioSafe(audAR);
    stopAudioSafe(audEN);

    loadPage(e.state.p);
  }else{
    app.classList.remove('show');
    app.innerHTML = '';
    const splash = document.getElementById('splash');
    if (splash) splash.style.display = 'grid';
  }
});

// iOS audio unlock (one silent initial user gesture)
window.addEventListener('touchstart', ()=>{
  [audAR, audEN].forEach(a=>{
    try{ a.play(); a.pause(); a.currentTime=0; }catch(_){}
  });
}, { once:true });