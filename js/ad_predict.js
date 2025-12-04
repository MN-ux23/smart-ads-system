// js/ad_predict.js
// Frontend logic for the best ad place prediction

'use strict';
console.log('ad_predict.js loaded');

//  BACKEND BASE URL (Render) 
const API_BASE = 'https://smart-ads-system-1.onrender.com';

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

// Global listener: handles submit even if the form is injected later
document.addEventListener('submit', async (ev) => {
  const form = ev.target;
  // ignore any form that is not our target 
  if (!form || form.id !== 'ad-form') return;

  ev.preventDefault();

  // convert form data into a plain js object
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  // quick required check
  for (const k of Object.keys(ALLOWED_AD)){
    if (!data[k] || data[k].trim() === ''){
      if (document.documentElement.dir === 'rtl') {
    showAlert('رجاءً أكمل جميع الحقول قبل الضغط على (أحسب الأفضل)');
} else {
    showAlert('Please fill in all fields before submitting.');
}
    }
  }

  // quick allowed validation
  for (const [k,v] of Object.entries(data)){
    if (ALLOWED_AD[k] && !ALLOWED_AD[k].includes(v)){
      if (document.documentElement.dir === 'rtl') {
    showAlert(`قيمة غير مسموحة في الحقل: ${k}`);
} else {
    showAlert(`Invalid value in field: ${k}`);
}
    }
  }

  // attach current page language for backend localization
  data.lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';

  try {
    // Sends a POST request to the backend API hosted on Render
    const res = await fetch(`${API_BASE}/api/btp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    // basic HTTP error handling
   if (!res.ok) {
    if (document.documentElement.dir === 'rtl') {
        showAlert('فضلًا انتظر قليلًا ');
    } else {
        showAlert('Please wait a little… ');
    }
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

    // Display the result card and smoothly scroll it into view
    if (result) {
      result.style.display = 'block';
      result.scrollIntoView({ behavior: 'smooth' });
    }

  } catch (err) {
    console.error('fetch error:', err);
   if (document.documentElement.dir === 'rtl') {
    showAlert('لحظات بسيطة… نقدر انتظارك ');
} else {
    showAlert('Please wait a moment… we appreciate your patience ');
}
  }
});