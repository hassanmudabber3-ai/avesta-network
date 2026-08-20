function formatMessage(level, message, meta = null) {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    message
  };

  if (meta !== null && meta !== undefined) {
    record.meta = meta;
  }

  return JSON.stringify(record);
}

function info(message, meta = null) {
  console.log(formatMessage('info', message, meta));
}

function warn(message, meta = null) {
  console.warn(formatMessage('warn', message, meta));
}

function error(message, meta = null) {
  console.error(formatMessage('error', message, meta));
}

module.exports = {
  info,
  warn,
  error
};
