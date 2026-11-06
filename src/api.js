const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const TIMEOUT_MS = Number(process.env.TEMP_TIMEOUT_MS) || 10000;

export class ApiError extends Error {}

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    if (err.name === "TimeoutError") {
      throw new ApiError("the request timed out. Please try again.");
    }
    throw new ApiError("could not reach the weather service. Check your internet connection.");
  }
  if (!response.ok) {
    throw new ApiError(`the weather service returned an error (${response.status}).`);
  }
  return await response.json();
}

export async function getCoordinates(city) {
  const url = `${GEO_URL}?name=${encodeURIComponent(city)}&count=1`;
  const data = await fetchJson(url);
  return data.results ? data.results[0] : null;
}

export async function getForecast(latitude, longitude, units) {
  const url =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,wind_speed_10m,weather_code` +
    `&temperature_unit=${units}`;
  return await fetchJson(url);
}