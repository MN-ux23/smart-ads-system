

'use strict';
// Detect current page language (Arabic vs English)
const IS_AR = (document.documentElement.lang || '').toLowerCase().startsWith('ar');
console.log("IS_AR=". IS_AR);

// Avoid double-binding event listeners
if (!window.__PM_BIND_ONCE__) {
  window.__PM_BIND_ONCE__ = true;
  console.log('pm_predict.js loaded (bound once)');

  // API endpoint for PM predictions
  const ENDPOINT_PM = 'http://127.0.0.1:8000/api/pm_predict';
  window.PM_ENDPOINT = ENDPOINT_PM;

  // Helper for error alerts
  function showAlert(msg){
    try { alert(msg); } 
    catch { console.log('alert:', msg); }
  }

  // Handle <form> submission for Predictive Maintenance
  document.addEventListener('submit', async (ev) => {
    const form = ev.target;
    if (!form || form.id !== 'pm-form') return;
    ev.preventDefault();

    const fd   = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    // Check required fields exist before sending to backend
    const required = [
      'model','resolution','content_type','media_source','ip_rating',
      'install_type','install_month','daily_hours','humidity_pct',
      'reboots_per_week','rated_power_w','height_m','width_m','install_year'
    ];
    for (const k of required){
      if (!data[k]) {
        showAlert(
          IS_AR?'رجاءً أكمل جميع الحقول.'
          :'Please fill in all required fieldds.');
        return;
      }
    }

    // Validate temperature input (°C)
    const tempCEl = document.getElementById('temp_c');
    if (!tempCEl || tempCEl.value === '') {
      showAlert(
        IS_AR ?'رجاءً أدخل درجة الحرارة (°C).'
        :' Please enter ambient temperature (°C).');
      return;
    }
    const tempC = parseFloat(tempCEl.value);
    if (!Number.isFinite(tempC)) {
      showAlert(
        IS_AR?'أدخل رقمًا صحيحًا لدرجة الحرارة (°C).'
        :'Please enter a valid number for temperature (°C).');
      return;
    }

    // Validate screen height (meters) within [0.5, 3]
    const hVal = parseFloat(data.height_m);
    if (!Number.isFinite(hVal) || hVal < 0.5 || hVal > 3) {
      showAlert(
        IS_AR?'رجاءً أدخل ارتفاع الشاشة بالمتر بين 0.5 و 3.'
        :' Please enter height (m) between 0.5 and 3.');
      return;
    }

  
    // Validate screen width (meters) within [0.5, 3]
    const wVal = parseFloat(data.width_m);
    if (!Number.isFinite(wVal) || wVal < 0.5 || wVal > 3) {
      showAlert(
        IS_AR?'رجاءً أدخل عرض الشاشة بالمتر بين 0.5 و 3.'
        : 'Please enter width (m) between 0.5 and 3.');
      return;
    }

    // Validate installation year (required field)

    const yearEl = document.getElementById('install_year');
    if (!yearEl || yearEl.value === "") {
      showAlert(
        IS_AR?'رجاءً اختار سنة التركيب.'
        :'Please select installation year.');
      return;
    }
    const yearVal = parseInt(yearEl.value);

    // Build payload object to send to backend
    const payload = {
      daily_hours:      parseFloat(data.daily_hours),
      temperature:      tempC,
      reboots_per_week: parseFloat(data.reboots_per_week),
      humidity_pct:     parseFloat(data.humidity_pct),
      install_year:     yearVal,
      height_m:         hVal,
      width_m:          wVal,
      rated_power_w:    parseFloat(data.rated_power_w),

      model:        data.model,
      resolution:   data.resolution,
      content_type: data.content_type,
      media_source: data.media_source,
      ip_rating:    data.ip_rating,
      install_type: data.install_type,
      install_month:data.install_month,

      lang: (document.documentElement.lang === 'ar') ? 'ar' : 'en'
    };

    // UI Elements for showing prediction results
    const resultCard = document.getElementById('result');
    const rStatus    = document.getElementById('r-status');
    const rNote      = document.getElementById('r-note');
    const tipsEl     = document.getElementById('r-tips');

    try {

      // Send POST request to backend with JSON payload
      const res = await fetch(ENDPOINT_PM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok){
        showAlert('تعذّر الوصول لخادم التنبؤ.');
        return;
      }

      const json = await res.json();
      console.log('pm_predict response =>', json);

      // Extract predicted status (OK | WARN | FAIL)
      const isAR = (document.documentElement.lang === 'ar');
      const extractCode = (j) => {
        let raw = (j?.debug?.raw_pred ?? '').toString().replace(/[^A-Za-z]/g,'').toUpperCase();
        if (['OK','WARN','FAIL'].includes(raw)) return raw;
        const up = (j?.status ?? '').toString().trim().toUpperCase();
        if (['OK','WARN','FAIL'].includes(up)) return up;
        return '';
      };
      const code = extractCode(json);

      // Static labels + tips (Arabic & English)
      const labelAR = { OK:'سليمة', WARN:'تنبيه', FAIL:'عطل' };
      const labelEN = { OK:'OK',     WARN:'WARN',  FAIL:'FAIL' };

      const adviceAR = {
        OK:   '💡 صيانة وقائية خفيفة وتنظيف الفلاتر شهريًا.',
        WARN: '💡 يُفضّل جدولة فحص هذا الأسبوع.',
        FAIL: '💡 تواصل فورًا مع الدعم الفني.'
      };
      const adviceEN = {
        OK:   '💡 Light preventive maintenance recommended.',
        WARN: '💡 Schedule a check this week.',
        FAIL: '💡 Contact support immediately.'
      };

      // Extra tips based on input values

      const extraTip = (() => {
        const out = [];
        const h   = parseFloat(data.daily_hours);
        const r   = parseFloat(data.reboots_per_week);
        const hum = parseFloat(data.humidity_pct);
        if (h > 16) out.push(isAR ? 'ساعات تشغيل عالية.' : 'High daily hours.');
        if (r > 10) out.push(isAR ? 'إعادات تشغيل كثيرة.' : 'Frequent reboots.');
        if (hum > 80) out.push(isAR ? 'رطوبة مرتفعة.' : 'High humidity.');
        return out.join(' • ');
      })();

      // Write results to UI

      if (code){
        rStatus.textContent = isAR ? labelAR[code] : labelEN[code];
        rNote.textContent   = json.note || (isAR ? adviceAR[code] : adviceEN[code]);
      } else {
        rStatus.textContent = isAR ? 'غير معروف' : 'Unknown';
        rNote.textContent   = isAR ? 'تحقق من المدخلات.' : 'Check inputs.';
      }

      
      // Render final list of tips
    
      if (tipsEl){
        tipsEl.innerHTML = "";
        const list = [
          isAR ? adviceAR[code] : adviceEN[code],
          extraTip
        ].filter(Boolean);
        for (const tip of list){
          const li = document.createElement('li');
          li.textContent = tip;
          tipsEl.appendChild(li);
        }
      }

      // Show result card
      resultCard.style.display = 'block';
      resultCard.scrollIntoView({ behavior:'smooth' });

    } catch (err) {
      console.error('pm fetch error:', err);
      showAlert('تعذّر الاتصال بالخادم.');
    }
  });

  
  // Sync sliders + numeric inputs for better UX

  document.addEventListener('input', (ev) => {
    const el = ev.target;

    if (el.id === 'daily_hours'){
      document.getElementById('daily_hours_num').value = el.value;
    }
    if (el.id === 'daily_hours_num'){
      document.getElementById('daily_hours').value = el.value;
    }

    if (el.id === 'humidity_pct'){
      document.getElementById('humidity_pct_num').value = el.value;
    }
    if (el.id === 'humidity_pct_num'){
      document.getElementById('humidity_pct').value = el.value;
    }

    if (el.id === 'reboots_per_week'){
      document.getElementById('reboots_per_week_num').value = el.value;
    }
    if (el.id === 'reboots_per_week_num'){
      document.getElementById('reboots_per_week').value = el.value;
    }
  });
}