// Free weather via Open-Meteo (no API key). Default city: Brussels.
const { weatherCategory } = require('./content');

const DEFAULT_CITY = { name: 'Brussels', lat: 50.85, lon: 4.35 };

async function geocode(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en`;
  const res = await fetch(url);
  const data = await res.json();
  const hit = data.results && data.results[0];
  if (!hit) return null;
  return { name: hit.name, lat: hit.latitude, lon: hit.longitude };
}

async function getWeather(cityName) {
  const city = cityName ? (await geocode(cityName)) || DEFAULT_CITY : DEFAULT_CITY;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
  const res = await fetch(url);
  const data = await res.json();
  const code = data.daily.weather_code[0];
  return {
    city: city.name,
    category: weatherCategory(code),
    tMax: Math.round(data.daily.temperature_2m_max[0]),
    tMin: Math.round(data.daily.temperature_2m_min[0]),
  };
}

module.exports = { getWeather };
