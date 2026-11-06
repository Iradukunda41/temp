import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const DATA_DIR = path.join(homedir(), ".temp-cli");
const DATA_FILE = path.join(DATA_DIR, "data.json");

export class StorageError extends Error {}

function defaultData() {
  return { favourites: [], history: [], settings: { units: "celsius" } };
}

export async function loadData() {
  try {
    const text = await readFile(DATA_FILE, "utf8");
    return { ...defaultData(), ...JSON.parse(text) };
  } catch (err) {
    if (err.code === "ENOENT") return defaultData();
    if (err instanceof SyntaxError) {
      throw new StorageError(`the data file is damaged: ${DATA_FILE}. Delete it to start fresh.`);
    }
    throw err;
  }
}

export async function saveData(data) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}