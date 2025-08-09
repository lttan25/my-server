import log4js from 'log4js';
import fetch from 'node-fetch';
import { tokenService } from '../services/database.js';
import config from 'config';
import crypto from 'crypto';

const logger = log4js.getLogger('auth-handler');
const DNSE_CONFIG = config.dnse;

/**
 * curl --location --request POST 'https://api.dnse.com.vn/auth-service/login' \
 * --header 'Content-Type: application/json' \
 * --data '{"username":"<your_email OR your_mobile OR your_custody_code>","password":"<your_password>"}'} req 
 */
export async function handleLogin(req, res) {
    const { username, password } = req.body;
    try {
        // Xóa toàn bộ record trong bảng token
        //await tokenService.clearAllTokens();
        
        // Phát sinh ID ngẫu nhiên 32 ký tự
        const sessionId = crypto.randomBytes(16).toString('hex');

        // Gọi API đăng nhập theo mẫu curl
        const response = await fetch(`${DNSE_CONFIG.baseUrl}${DNSE_CONFIG.apis.login}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            logger.error('Login error:', await response.text());
            throw new Error('Login failed');
        }

        const data = await response.json();
        // {
        //   token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMDAxOTg5MzUyIiwiYXV0aFNvdXJjZSI6bnVsbCwicm9sZXMiOlsiaW52ZXN0b3IiXSwiaXNzIjoiRE5TRSIsImludmVzdG9ySWQiOiIxMDAxOTg5MzUyIiwiZnVsbE5hbWUiOiJLaGEgTmd1eeG7hW4iLCJzZXNzaW9uSWQiOiJhMzNjODEzZC0zMzQwLTRmODAtYjE1Ni1iZTVkNDFlZjkwNTQiLCJ1c2VySWQiOiJkMzcwODdhMC1jODVjLTQwY2YtOGEzMS1jNDE1OGNiMmYzYWYiLCJhdWQiOlsiYXVkaWVuY2UiXSwiY3VzdG9tZXJFbWFpbCI6ImtoYW5ndXllbi5lNDMwQGdtYWlsLmNvbSIsImN1c3RvZHlDb2RlIjpudWxsLCJjdXN0b21lcklkIjpudWxsLCJleHAiOjE3NTQzNTE1OTQsImN1c3RvbWVyTW9iaWxlIjpudWxsLCJpYXQiOjE3NTQzMjI3OTQsInVzZXJuYW1lIjpudWxsLCJzdGF0dXMiOiJORVcifQ.3HBPANItgwINoZfq1VPt9uxgUunukcAPAs_OPymoJp3EbyACbPtY4pfXFflYK68UrmdghxNNsh7nKRyvRbeoGkvpKTM3Bg9D0lMMpC5xYeyk5GvBVt2N8Qb-1SgqHiyE5E0MUWE_2g1tyitfUtXiNLjH_ed1OePaRDtXbrQsKYE',   
        //   roles: [ 'investor' ],
        //   isNeedReset: false
        // }
        
        // Lưu JWT token vào database với ID ngẫu nhiên
        await tokenService.saveJWT(sessionId, data.token);
        
        // Trả về ID ngẫu nhiên cho frontend
        res.json({
            success: true,
            sessionId: sessionId
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(401).json({ error: 'Login failed' });
    }
}

/**
 * Chỉ gọi API 1 lần sau khi đăng nhập thành công.
 * curl --location --request POST 'https://api.dnse.com.vn/order-service/trading-token' \
 * --header 'Authorization: Bearer <jwt_token_from_login_API_response_step_2.1>' \
 * --header 'Content-Type: application/json' \
 * --header 'smart-otp: <smart_otp_from_EntradeX_mobile_app>' \
 * --data ''
 */
export async function handleOTPVerification(req, res) {
    const { sessionId, otp } = req.body; // Nhận sessionId và OTP từ frontend
    try {
        // Lấy JWT token từ database dựa vào sessionId
        const jwt = await tokenService.getJWTBySessionId(sessionId);
        if (!jwt) {
            throw new Error('Session not found');
        }

        // Gọi API lấy trading token theo mẫu curl
        const response = await fetch(`${DNSE_CONFIG.baseUrl}${DNSE_CONFIG.apis.smartOTP}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
                'smart-otp': otp
            }
        });

        if (!response.ok) {
            logger.error('Trading token error:', await response.text());
            throw new Error('Failed to get trading token');
        }

        const data = await response.json();
        // { tradingToken: '07eb2a40-5bf5-49ab-8cf3-e1a23e31c5e9' }

        // expires_at = now + 8 hours
        const expiresAt = Math.floor(Date.now() / 1000) + (8 * 60 * 60); // 8 hours in seconds

        // Lưu trading token vào database với sessionId
        await tokenService.saveTradingToken(sessionId, data.tradingToken, expiresAt);

        res.json({ 
            success: true,
            sessionId: sessionId
        });
    } catch (error) {
        logger.error('OTP verification error:', error);
        res.status(401).json({ error: 'Failed to get trading token' });
    }
}
