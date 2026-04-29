'use strict';

/**
 * Simple request logger middleware.
 * Logs: METHOD  /path  STATUS  contentLength  - user-agent  ip
 */
function logger(req, res, next) {
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || '';

  res.on('finish', () => {
    const { statusCode } = res;
    const contentLength = res.get('content-length') || '-';
    console.log(
      `[HTTP] ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
    );
  });

  next();
}

module.exports = logger;
