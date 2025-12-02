// js/api.js
const API_BASE = "https://smart-ads-system-1.onrender.com";

// ---------- Best Place for Ads ----------
async function callBestPlace(form) {
  const lang =
    document.documentElement.lang &&
    document.documentElement.lang.toLowerCase().startsWith("ar")
      ? "ar"
      : "en";

  const payload = {
    lang,
    business_type: form.business_type.value,
    campaign_goal: form.campaign_goal.value,
    budget_level: form.budget_level.value,
    campaign_duration: form.campaign_duration.value,
    area_type: form.area_type.value,
    active_hours: form.active_hours.value,
    ad_style: form.ad_style.value,
    interaction_goal: form.interaction_goal.value,
    offer_type: form.offer_type.value,
    business_stage: form.business_stage.value
  };

  const resultBox = document.getElementById("btp-result");
  if (resultBox) {
    resultBox.textContent =
      lang === "ar" ? "جاري التنبؤ بأفضل مكان..." : "Predicting best place...";
  }

  try {
    const res = await fetch(`${API_BASE}/api/btp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      if (resultBox) {
        resultBox.textContent = data.error || "Request failed.";
      }
      console.error("BTP error:", data);
      return;
    }

    if (resultBox) {
      resultBox.textContent = `${data.best_place} – ${data.note}`;
    }
    console.log("BTP debug:", data.debug);
  } catch (err) {
    console.error(err);
    if (resultBox) {
      resultBox.textContent =
        lang === "ar"
          ? "حدث خطأ أثناء الاتصال بالخادم."
          : "Error while calling the server.";
    }
  }
}

// ---------- Predictive Maintenance ----------
async function callPm(form) {
  const lang =
    document.documentElement.lang &&
    document.documentElement.lang.toLowerCase().startsWith("ar")
      ? "ar"
      : "en";

  const payload = {
    lang,

    // Basic hardware / usage info
    install_year: form.install_year.value,
    height_m: form.height_m.value,
    width_m: form.width_m.value,
    daily_hours: form.daily_hours.value,
    rated_power_w: form.rated_power_w.value,

    // Environment info
    temperature: form.temperature.value,
    humidity_pct: form.humidity_pct.value,

    // Example extra categorical field (optional, you can change/remove)
    location_type: form.location_type ? form.location_type.value : ""
  };

  const resultBox = document.getElementById("pm-result");
  if (resultBox) {
    resultBox.textContent =
      lang === "ar" ? "جاري تقييم حالة الشاشة..." : "Evaluating screen status...";
  }

  try {
    const res = await fetch(`${API_BASE}/api/pm_predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      if (resultBox) {
        resultBox.textContent = data.error || "Request failed.";
      }
      console.error("PM error:", data);
      return;
    }

    if (resultBox) {
      resultBox.textContent = `${data.status} – ${data.note}`;
    }
    console.log("PM debug:", data.debug);
  } catch (err) {
    console.error(err);
    if (resultBox) {
      resultBox.textContent =
        lang === "ar"
          ? "حدث خطأ أثناء الاتصال بالخادم."
          : "Error while calling the server.";
    }
  }
}