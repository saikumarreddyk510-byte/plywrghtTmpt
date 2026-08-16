const fs = require("fs");
const path = require("path");

/** Updates the artifacts.download.directory in .sauce/config.yml with a timestamped folder. */
const suiteName = process.env.npm_config_suite ?? "playwright-template";
const now = new Date();
const timestamp =
  [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-") +
  "_" +
  [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("-");

const folderPath =
  process.platform === "win32"
    ? `C:\\LogFolder\\${suiteName}_${timestamp}`
    : `/e2e/output/${suiteName}_${timestamp}`;

const configPath = path.resolve(".sauce/config.yml");
let config = fs.readFileSync(configPath, "utf8");
config = config.replace(/directory:.*\n/, `directory: ${folderPath}\n`);
fs.writeFileSync(configPath, config);

console.log(`Updated .sauce/config.yml download directory: ${folderPath}`);
