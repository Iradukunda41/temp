const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export function describeWeather(code) {
  return WEATHER_CODES[code] ?? "Unknown conditions";
}

export function formatWeather(place, current, units) {
  const symbol = units === "fahrenheit" ? "°F" : "°C";
  return [
    `${place.name}, ${place.country}`,
    describeWeather(current.weather_code),
    `Temperature: ${current.temperature_2m}${symbol}`,
    `Wind: ${current.wind_speed_10m} km/h`,
  ].join("\n");
}