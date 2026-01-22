// Boulder, CO approx coordinates
const BOULDER_LAT = 40.02;
const BOULDER_LON = -105.25;

// thresholds
const MIN_FEELS_LIKE_F = 45;
const MAX_FEELS_LIKE_F = 75;
const MAX_WIND_MPH = 10;
const MAX_CLOUD_PERCENT_SUNNY = 35;

// ---- helpers ----
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

  const goodTemp =
    feelsLikeF >= MIN_FEELS_LIKE_F && feelsLikeF <= MAX_FEELS_LIKE_F;
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

// ---- main load function ----
async function loadForecast() {
  const statusEl = document.getElementById("status");
  const daysEl = document.getElementById("days");
  const apiKey = "20c50



