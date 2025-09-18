import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_please_change_in_production';
const JWT_EXPIRES_IN = '1d';

export const jwttoken = {
  sign: (payload) => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN});
    } catch (error) {
      console.log('Error Authenticating Token', error);
      logger.error('Error Authenticating Token', error);
      throw new Error('Error authenticating Token');
    }
  },
  verify: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.log('Error Verifying Token', error);
      logger.error('Error Verifying Token', error);
      throw new Error('Error verifying Token');
    }
  }
};