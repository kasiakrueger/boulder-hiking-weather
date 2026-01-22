// Boulder, CO approx coordinates
const BOULDER_LAT = 40.02;
const BOULDER_LON = -105.25;

// thresholds
const MIN_FEELS_LIKE_F = 50;
const MAX_WIND_MPH = 10;
const MAX_CLOUD_PERCENT_SUNNY = 25;

function kToF(kelvin) {
  return (kelvin - 273.15) * 9 / 5 + 32;
}

function msToMph(ms) {
  return ms * 2.237;
}

function isSunny(day) {
  const clouds = day.clouds ?? 0;
  const main = (day.weather?.[0]?.main || "").toLowerCase();
  const desc = (day.weather?.[0]?.description || "").toLowerCase();
  return (
    clouds <= MAX_CLOUD_PERCENT_SUNNY ||
    main === "clear" ||
    desc.includes("sunny")
  );
}

function evaluateDay(day) {
  const feelsLikeK = day.feels_like?.day ?? day.feels_like;
  const feelsLikeF = kToF(feelsLikeK);
  const windMph = msToMph(day.wind_speed ?? 0);
  const clouds = day.clouds ?? 0;
  const weatherLabel = (day.weather?.[0]?.description || "N/A");

  const goodTemp = feelsLikeF >= MIN_FEELS_LIKE_F;
  const goodWind = windMph < MAX_WIND_MPH;
  const goodSky = isSunny(day);

  const isGood = goodTemp && goodWind && goodSky;

  return {
    date: new Date(day.dt * 1000),
    feelsLikeF,
    windMph,
    clouds,
    weatherLabel,
    isGood,
    goodTemp,
    goodWind,
    goodSky
  };
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

async function loadForecast() {
  const statusEl = document.getElementById("status");
  const daysEl = document.getElementById("days");
 const apiKey = "20c50dce0b3ac7011b90c6e6d3987fbf";


  if (!apiKey || apiKey === "YOUR_OPENWEATHER_API_KEY_HERE") {
    statusEl.textContent =
      "Please set your OpenWeather API key in index.html (data-api-key attribute).";
    return;
  }

  statusEl.textContent = "Fetching Boulder forecast…";

  try {
    const url = new URL("https://api.openweathermap.org/data/3.0/onecall");
    url.searchParams.set("lat", BOULDER_LAT);
    url.searchParams.set("lon", BOULDER_LON);
    url.searchParams.set("exclude", "minutely,hourly,alerts");
    url.searchParams.set("appid", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error("API error: " + res.status);
    }
    const data = await res.json();

    const daily = (data.daily || []).slice(0, 5);
    if (!daily.length) {
      statusEl.textContent = "No daily forecast data returned.";
      return;
    }

    const evaluated = daily.map(evaluateDay);

    statusEl.textContent = "Forecast loaded for Boulder, CO.";

    daysEl.innerHTML = "";
    for (const day of evaluated) {
      const card = document.createElement("article");
      card.className = "day-card";

      const header = document.createElement("div");
      header.className = "day-header";

      const dateEl = document.createElement("div");
      dateEl.className = "day-date";
      dateEl.textContent = formatDate(day.date);

      const badge = document.createElement("div");
      badge.className = "day-badge " + (day.isGood ? "good" : "bad");
      badge.textContent = day.isGood ? "Good hiking" : "Not ideal";

      header.appendChild(dateEl);
      header.appendChild(badge);

      const line1 = document.createElement("div");
      line1.className = "day-line";
      line1.innerHTML =
        `<span class="label">Feels like</span>` +
        `<span>${Math.round(day.feelsLikeF)}°F</span>`;

      const line2 = document.createElement("div");
      line2.className = "day-line";
      line2.innerHTML =
        `<span class="label">Wind</span>` +
        `<span>${day.windMph.toFixed(1)} mph</span>`;

      const line3 = document.createElement("div");
      line3.className = "day-line";
      line3.innerHTML =
        `<span class="label">Sky</span>` +
        `<span>${day.weatherLabel} (${day.clouds}% clouds)</span>`;

      const reasons = document.createElement("div");
      reasons.className = "day-reasons";
      const parts = [];
      parts.push(day.goodTemp ? "Temp OK" : "Too cold");
      parts.push(day.goodWind ? "Wind OK" : "Too windy");
      parts.push(day.goodSky ? "Sunny enough" : "Not sunny");
      reasons.textContent = parts.join(" · ");

      card.appendChild(header);
      card.appendChild(line1);
      card.appendChild(line2);
      card.appendChild(line3);
      card.appendChild(reasons);

      daysEl.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Error loading forecast. Check your API key or internet connection.";
  }
}

// Register service worker for PWA installability
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(console.error);
  });
}

window.addEventListener("load", loadForecast);
