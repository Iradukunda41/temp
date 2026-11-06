const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function getCoordinates(city) {
  const url = `${GEO_URL}?name=${encodeURIComponent(city)}&count=1`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results ? data.results[0] : null;
}

export async function getForecast(latitude, longitude, units) {
  const url =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,wind_speed_10m,weather_code` +
    `&temperature_unit=${units}`;
  const response = await fetch(url);
  return await response.json();
}