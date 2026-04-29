'use strict';

/**
 * Send a successful response.
 * Shape: { statusCode, data }
 */
function ok(res, data, status = 200) {
  return res.status(status).json({ statusCode: status, data: data ?? null });
}

/**
 * Send an error response.
 * Shape: { statusCode, message, path, timestamp }
 */
function fail(res, message, status = 500, path = '') {
  return res.status(status).json({
    statusCode: status,
    timestamp: new Date().toISOString(),
    path,
    message,
  });
}

module.exports = { ok, fail };
