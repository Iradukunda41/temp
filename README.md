# temp

**temp** is a weather tool you run from the terminal.

```
$ temp weather Kigali
Kigali, Rwanda
Overcast
Temperature: 26.6°C
Wind: 8.1 km/h
```

## Features

- Current weather for any city in the world
- Celsius or Fahrenheit
- Favourite cities and lookup history, saved in a JSON file
- Settings through environment variables
- Friendly error messages and correct exit codes (no internet, timeout, city not found, bad input)

## Requirements

- Node.js 18 or newer (check with `node -v`)
- An internet connection (weather data comes from [Open-Meteo](https://open-meteo.com/), no API key needed)

## Install

```bash
git clone https://github.com/Iradukunda41/temp.git
cd temp
npm install
npm link
```

`npm link` creates a global command, so `temp` works from any folder. To remove it later, run `npm unlink -g temp`.

Check that it works:

```bash
temp --help
```

## Usage

### Get the weather

```bash
temp weather Kigali
temp weather "New York" --units fahrenheit
temp weather Nairobi -u celsius
```

![weather](screenshots/weather.png)

### Favourites

```bash
temp fav add Kigali
temp fav list
temp fav remove Kigali
```

![favourites](screenshots/fav.png)

### History

Every successful `temp weather` lookup is saved. `temp history` shows the last 20.

```bash
temp history
```

![history](screenshots/history.png)

### Help

```bash
temp --help
```

![help](screenshots/help.png)

## Options

| Option | Meaning | Default |
|---|---|---|
| `-u`, `--units` | `celsius` or `fahrenheit` | `celsius` |
| `-h`, `--help` | show the help text | |

## Configuration (environment variables)

| Variable | Meaning | Default |
|---|---|---|
| `TEMP_UNITS` | default units when `--units` is not given | `celsius` |
| `TEMP_DATA_DIR` | folder where `data.json` is saved | `~/.temp-cli` |
| `TEMP_TIMEOUT_MS` | request timeout in milliseconds | `10000` |

The `--units` flag always wins over `TEMP_UNITS`.

PowerShell example:

```powershell
$env:TEMP_UNITS = "fahrenheit"
temp weather Kigali
```

Mac / Linux example:

```bash
TEMP_UNITS=fahrenheit temp weather Kigali
```

## Errors and exit codes

Exit code `0` means success. Any problem prints a short message to the error stream and exits with code `1`.

| Situation | Message | Exit code |
|---|---|---|
| Weather, list or history printed | (normal output) | 0 |
| No command, unknown command, unknown option | usage hint | 1 |
| No city given | `please give a city...` | 1 |
| Units not `celsius` or `fahrenheit` | `units must be ...` | 1 |
| City not found | `could not find a city called ...` | 1 |
| No internet | `could not reach the weather service` | 1 |
| Request too slow | `the request timed out` | 1 |
| Data file contains broken JSON | `the data file is damaged` | 1 |
| Favourite not in the list | `... is not in your favourites` | 1 |

![error](screenshots/error.png)

## Where the data is saved

Favourites and history are stored in `~/.temp-cli/data.json` (for example `C:\Users\<you>\.temp-cli\data.json` on Windows):

```json
{
  "favourites": ["Kigali"],
  "history": [
    {
      "city": "Kigali",
      "country": "Rwanda",
      "temperature": 26.8,
      "units": "celsius",
      "time": "2026-11-06T09:53:14.453Z"
    }
  ],
  "settings": { "units": "celsius" }
}
```

## Project structure

```
temp/
  bin/temp.js      entry point: reads the command line and decides what to do
  src/api.js       the two web requests (geocoding, forecast) and error handling
  src/format.js    turns the weather data into readable text
  src/storage.js   reads and writes the JSON data file
  package.json     name, bin, scripts, engines
```

## How it works (walkthrough)

**1. Package setup.** `package.json` has a `bin` field that maps the command `temp` to `bin/temp.js`. The first line of that file, `#!/usr/bin/env node`, tells the operating system to run the file with Node. `"type": "module"` lets me use `import`. `npm link` creates a global shortcut to my folder, so I can type `temp` anywhere.

**2. Reading the input.** `util.parseArgs` splits what the user types into positional words (`weather`, `Kigali`) and flags (`--units`). The first word is the command and the rest is the city, joined with spaces so "New York" works. If the input is bad, the `fail()` function prints a message with `console.error` and calls `process.exit(1)`.

**3. Two chained requests.** The forecast service needs a latitude and longitude, but the user only gives a city name. So `getCoordinates` first asks the geocoding API for the city's coordinates, and only then `getForecast` asks for the current weather at those coordinates. `await` pauses the function until each network request finishes, so the second request can use the result of the first. Both go through one helper, `fetchJson`.

**4. Error handling.** `fetchJson` wraps `fetch` in `try/catch`. `AbortSignal.timeout` cancels a request that takes too long, which gives a `TimeoutError`. Any other failure from `fetch` means the service could not be reached. A response with `response.ok` false means the service returned an error. All of these become an `ApiError` with a friendly message. In `bin/temp.js`, one `try/catch` turns `ApiError` and `StorageError` into a message with exit code 1. Any other error is a bug in my code, so I rethrow it instead of hiding it.

**5. Saving data.** `os.homedir()` and `path.join()` build the path to `~/.temp-cli/data.json` for any operating system. `fs/promises` provides `mkdir` (with `recursive: true`), `readFile` and `writeFile`. If the file does not exist yet (`ENOENT`), I start with empty data. If it exists but the JSON is broken, I show a `StorageError` instead of erasing it. After each successful lookup I add an entry to `history` and keep only the last 20.

**6. Configuration.** `process.env` holds the environment variables. The units are chosen in this order: the `--units` flag, then `TEMP_UNITS`, then `celsius`. `TEMP_DATA_DIR` changes the data folder and `TEMP_TIMEOUT_MS` changes the timeout.

## Data source

Weather and geocoding data from [Open-Meteo](https://open-meteo.com/).

## Author

Iradukunda Flora