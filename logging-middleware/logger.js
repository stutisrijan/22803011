const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

function formatTimestamp() {
  return new Date().toISOString();
}

function writeLog(level, message, meta = {}) {
  const entry = {
    timestamp: formatTimestamp(),
    level,
    message,
    ...meta,
  };
  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(LOG_FILE, line, "utf8");
}

const logger = {
  info: (message, meta) => writeLog(LOG_LEVELS.INFO, message, meta),
  warn: (message, meta) => writeLog(LOG_LEVELS.WARN, message, meta),
  error: (message, meta) => writeLog(LOG_LEVELS.ERROR, message, meta),
  debug: (message, meta) => writeLog(LOG_LEVELS.DEBUG, message, meta),
};

module.exports = { logger, LOG_LEVELS };
