// js/ad_predict.js
// Frontend logic for the best ad place prediction 

'use strict';
console.log('ad_predict.js loaded');

// Allowed values server-side must match these strings
const ALLOWED_AD = {
  business_type:   ["restaurant_cafe","retail_fashion","pharmacy_health","electronics","supermarket","services"],
  campaign_goal:   ["sales","awareness","new_customers","footfall"],
  budget_level:    ["low","medium","high"],
  campaign_duration:["1_week","2_weeks","1_month","3_months"],
  area_type:       ["residential","commercial","mixed"],
  active_hours:    ["morning","noon","evening"],
  ad_style:        ["text","visual","interactive","video"],
  interaction_goal:["visit_store","visit_website","call_whatsapp","scan_qr"],
  offer_type:      ["none","discount","bundle","new_launch"],
  business_stage:  ["new","growing","established"]
};

// helper to show feedback to the user
function showAlert(msg){
  try { alert(msg); } catch(_) { console.log('alert:', msg); }
}

// Global listener:handles submit even if the from is injected later
document.addEventListener('submit', async (ev) => {
  const form = ev.target;
  // ignore any from that is not our target 
  if (!form || form.id !== 'ad-form') return; 
  ev.preventDefault();
  // convert from data into a plain js object
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  // quick required check
  for (const k of Object.keys(ALLOWED_AD)){
    if (!data[k] || data[k].trim()===''){
      showAlert('رجاءً أكمل جميع الحقول قبل الضغط على (احسب الأفضل).');
      return;
    }
  }

  // quick allowed validation
  for (const [k,v] of Object.entries(data)){
    if (ALLOWED_AD[k] && !ALLOWED_AD[k].includes(v)){
      showAlert(`قيمة غير مسموحة في الحقل: ${k}`);
      return;
    }
  }

  // attach current page language for backend localization
  data.lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';

  // POST to backend
  try {
    const res = await fetch('http://127.0.0.1:8000/api/btp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    // pasic HTTP error handling
    if (!res.ok) {
      showAlert(`حدث خطأ في الخادم. HTTP ${res.status}`);
      throw new Error(`HTTP ${res.status}`);
    }
    // read JSON prediction from API
    const json = await res.json();
    console.log('ad_predict response =>', json);

    // show result elements if present
    const result = document.getElementById('result');
    const rPlace = document.getElementById('r-place');
    const rNote  = document.getElementById('r-note');

    if (rPlace) rPlace.textContent = json.best_place || '—';
    if (rNote)  rNote.textContent  = json.note || '';

    // show result section andd scroll ti it smoothly
    if (result) { result.style.display = 'block'; result.scrollIntoView({ behavior: 'smooth' }); }
    // Network / runtime error handling
  } catch (err) {
    console.error('fetch error:', err);
    showAlert('تعذّر الاتصال بالخادم. تأكد أن السيرفر يعمل  .');
  }
});