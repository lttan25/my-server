import log4js from 'log4js';
import { tokenService } from '../services/database.js';

const logger = log4js.getLogger('token-handler');

export function handleTokenSave(req, res) {
  const { jwt, trading_token, expires_at } = req.body;
  try {
    tokenService.saveToken(jwt, trading_token, expires_at);
    logger.info('Token saved successfully');
    res.send("Token đã lưu");
  } catch (error) {
    logger.error('Error saving token:', error);
    res.status(500).send("Lỗi lưu token");
  }
}
