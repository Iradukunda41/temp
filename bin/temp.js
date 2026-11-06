#!/usr/bin/env node
import { parseArgs } from "node:util";

const HELP = `temp (ubushyuhe) - a weather tool for your terminal

Usage:
  temp weather <city> [--units celsius|fahrenheit]
  temp fav add <city>
  temp fav list
  temp history

Options:
  -u, --units   celsius or fahrenheit (default: celsius)
  -h, --help    show this help`;

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
      units: { type: "string", short: "u", default: "celsius" },
    },
  });
} catch (err) {
  fail(err.message);
}

const { values, positionals } = parsed;
const [command, ...rest] = positionals;

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

if (!["celsius", "fahrenheit"].includes(values.units)) {
  fail(`units must be "celsius" or "fahrenheit", not "${values.units}".`);
}

switch (command) {
  case "weather": {
    const city = rest.join(" ");
    if (!city) fail("please give a city, for example: temp weather Kigali");
    console.log(`(coming soon) weather for ${city} in ${values.units}`);
    break;
  }
  case "fav":
  case "history":
    console.log(`(coming soon) ${command}`);
    break;
  case undefined:
    fail("no command given.");
    break;
  default:
    fail(`unknown command "${command}".`);
}