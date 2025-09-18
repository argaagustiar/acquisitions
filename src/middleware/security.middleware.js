import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin request limit reached (20 per minute). Slow down!';
        break;
      case 'user':
        limit = 10;
        message = 'User request limit reached (10 per minute). Slow down!';
        break;
      case 'guest':
        limit = 5;
        message = 'Guest request limit reached (5 per minute). Slow down!';
        break;        
    }

    const client = aj.withRule(slidingWindow({ mode: 'LIVE', interval: '1m', max: limit, name: `${role}-rate-limit` }));

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked', { ip: req.ip, path: req.path, userAgent: req.get('User-Agent') });

      return res.status(403).json({ error: 'Forbidden', message: 'Bot activity detected. Access denied.' });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield blocked request', { ip: req.ip, path: req.path, userAgent: req.get('User-Agent'), method: req.method });

      return res.status(403).json({ error: 'Forbidden', message: 'Request blocked by security policy' });
    }

    if (decision.isDenied() && decision.reason.isRateLimit ()) {
      logger.warn('Rate limit reached', { ip: req.ip, path: req.path, userAgent: req.get('User-Agent'), method: req.method });

      return res.status(403).json({ error: 'Forbidden', message: 'Too many requests' });
    }

    next();
  } catch (error) {
    console.log('Arcjet Security Middleware Error', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong with security middleware' });
  }
};