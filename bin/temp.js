#!/usr/bin/env node
import { parseArgs } from "node:util";
import { getCoordinates, getForecast, ApiError } from "../src/api.js";
import { formatWeather } from "../src/format.js";
import { loadData, saveData, StorageError } from "../src/storage.js";

const HELP = `temp - a weather tool for your terminal

Usage:
  temp weather <city> [--units celsius|fahrenheit]
  temp fav add <city>
  temp fav remove <city>
  temp fav list
  temp history

Options:
  -u, --units   celsius or fahrenheit (default: celsius)
  -h, --help    show this help

Environment variables:
  TEMP_UNITS        default units (celsius or fahrenheit)
  TEMP_DATA_DIR     folder for the data file (default: ~/.temp-cli)
  TEMP_TIMEOUT_MS   request timeout in milliseconds (default: 10000)`;

function fail(message) {
  console.error(`Error: ${message}`);
  console.error("Run 'temp --help' to see how to use temp.");
  process.exit(1);
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      units: { type: "string", short: "u" },
    },
  });
} catch (err) {
  fail(err.message);
}

const { values, positionals } = parsed;
const [command, ...rest] = positionals;
const units = values.units ?? process.env.TEMP_UNITS ?? "celsius";

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

if (!["celsius", "fahrenheit"].includes(units)) {
  fail(`units must be "celsius" or "fahrenheit", not "${units}".`);
}

try {
  switch (command) {
    case "weather": {
      const city = rest.join(" ");
      if (!city) fail("please give a city, for example: temp weather Kigali");
      const place = await getCoordinates(city);
      if (!place) fail(`could not find a city called "${city}".`);
      const forecast = await getForecast(place.latitude, place.longitude, units);
      console.log(formatWeather(place, forecast.current, units));

      const data = await loadData();
      data.history.push({
        city: place.name,
        country: place.country,
        temperature: forecast.current.temperature_2m,
        units,
        time: new Date().toISOString(),
      });
      data.history = data.history.slice(-20);
      await saveData(data);
      break;
    }
    case "fav": {
      const [action, ...cityParts] = rest;
      const city = cityParts.join(" ");
      const data = await loadData();
      const same = (a, b) => a.toLowerCase() === b.toLowerCase();

      if (action === "list") {
        if (data.favourites.length === 0) console.log("No favourites yet.");
        else data.favourites.forEach((c) => console.log(`- ${c}`));
      } else if (action === "add") {
        if (!city) fail("please give a city, for example: temp fav add Kigali");
        if (data.favourites.some((c) => same(c, city))) {
          console.log(`${city} is already in your favourites.`);
        } else {
          data.favourites.push(city);
          await saveData(data);
          console.log(`Added ${city} to favourites.`);
        }
      } else if (action === "remove") {
        if (!city) fail("please give a city, for example: temp fav remove Kigali");
        const before = data.favourites.length;
        data.favourites = data.favourites.filter((c) => !same(c, city));
        if (data.favourites.length === before) {
          fail(`${city} is not in your favourites.`);
        }
        await saveData(data);
        console.log(`Removed ${city} from favourites.`);
      } else {
        fail("use: temp fav add <city>, temp fav remove <city> or temp fav list");
      }
      break;
    }
    case "history": {
      const data = await loadData();
      if (data.history.length === 0) {
        console.log("No history yet.");
      } else {
        data.history.forEach((h) => {
          const symbol = h.units === "fahrenheit" ? "°F" : "°C";
          console.log(`${h.time}  ${h.city}, ${h.country}  ${h.temperature}${symbol}`);
        });
      }
      break;
    }
    case undefined:
      fail("no command given.");
      break;
    default:
      fail(`unknown command "${command}".`);
  }
} catch (err) {
  if (err instanceof ApiError || err instanceof StorageError) fail(err.message);
  throw err;
}