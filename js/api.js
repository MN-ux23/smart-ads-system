// js/api.js

// Base URL for backend API services
const API_BASE = "https://smart-ads-system-1.onrender.com";


// Best Place for Ads prediction
async function callBestPlace(form) {

  // Detect current page language to localize API results
  const lang =
    document.documentElement.lang &&
    document.documentElement.lang.toLowerCase().startsWith("ar")
      ? "ar"
      : "en";

  // Construct payload from user input for the prediction request
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

  // Display initial status message before sending the request
  const resultBox = document.getElementById("btp-result");
  if (resultBox) {
    resultBox.textContent =
      lang === "ar" ? "جاري التنبؤ بأفضل مكان..." : "Predicting best place...";
  }

  try {
    // Send POST request to backend prediction API
    const res = await fetch(`${API_BASE}/api/btp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Parse returned JSON response
    const data = await res.json();

    // Handle server-side errors gracefully
    if (!res.ok) {
      if (resultBox) {
        resultBox.textContent = data.error || "Request failed.";
      }
      console.error("BTP error:", data);
      return;
    }

    // Display final prediction result and model note
    if (resultBox) {
      resultBox.textContent = `${data.best_place} – ${data.note}`;
    }

    console.log("BTP debug:", data.debug);

  } catch (err) {
    // Handle network or unexpected errors
    console.error(err);
    if (resultBox) {
      resultBox.textContent =
        lang === "ar"
          ? "حدث خطأ أثناء الاتصال بالخادم."
          : "Error while calling the server.";
    }
  }
}


// Predictive Maintenance model
async function callPm(form) {

  // Determine response language for localization
  const lang =
    document.documentElement.lang &&
    document.documentElement.lang.toLowerCase().startsWith("ar")
      ? "ar"
      : "en";

  // Prepare structured payload for maintenance prediction
  const payload = {
    lang,

    // Basic hardware / usage information
    install_year: form.install_year.value,
    height_m: form.height_m.value,
    width_m: form.width_m.value,
    daily_hours: form.daily_hours.value,
    rated_power_w: form.rated_power_w.value,

    // Environmental conditions
    temperature: form.temperature.value,
    humidity_pct: form.humidity_pct.value,

    // Optional categorical field
    location_type: form.location_type ? form.location_type.value : ""
  };

  // Display initial status message before computation
  const resultBox = document.getElementById("pm-result");
  if (resultBox) {
    resultBox.textContent =
      lang === "ar" ? "جاري تقييم حالة الشاشة..." : "Evaluating screen status...";
  }

  try {
    // Send POST request to maintenance prediction API
    const res = await fetch(`${API_BASE}/api/pm_predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Parse backend response
    const data = await res.json();

    // Handle backend errors or invalid responses
    if (!res.ok) {
      if (resultBox) {
        resultBox.textContent = data.error || "Request failed.";
      }
      console.error("PM error:", data);
      return;
    }

    // Display final maintenance prediction result
    if (resultBox) {
      resultBox.textContent = `${data.status} – ${data.note}`;
    }

    console.log("PM debug:", data.debug);

  } catch (err) {
    // Handle unexpected failures or network issues
    console.error(err);
    if (resultBox) {
      resultBox.textContent =
        lang === "ar"
          ? "حدث خطأ أثناء الاتصال بالخادم."
          : "Error while calling the server.";
    }
  }
}