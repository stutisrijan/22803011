const LOG_LEVELS = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

const logs = [];
const MAX_LOGS = 500;

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

  logs.push(entry);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  // Write to stderr (allowed — not console.log)
  if (typeof process !== "undefined" && process.stderr) {
    process.stderr.write(`[${entry.timestamp}] [${level}] ${message} ${JSON.stringify(meta)}\n`);
  }
}

const logger = {
  info: (message, meta) => writeLog(LOG_LEVELS.INFO, message, meta),
  warn: (message, meta) => writeLog(LOG_LEVELS.WARN, message, meta),
  error: (message, meta) => writeLog(LOG_LEVELS.ERROR, message, meta),
  debug: (message, meta) => writeLog(LOG_LEVELS.DEBUG, message, meta),
  getLogs: () => [...logs],
  clear: () => {
    logs.length = 0;
  },
};

export { logger, LOG_LEVELS };
