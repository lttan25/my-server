import express from 'express';
import { handleTradingWebhook } from '../handlers/webhook-handler.js';
import { handleTokenSave } from '../handlers/token-handler.js';
import { handleLogin, handleOTPVerification } from '../handlers/auth-handler.js';
import { tokenService } from '../services/database.js';
import path from 'path';

const router = express.Router();

// Serve login page
router.get("/login", async (req, res) => {

    // const all =  await tokenService.getAll();
    // console.log('Existing token:', all);

    const sessionId = req.cookies?.sessionId;
    const existingToken =  await tokenService.getTokenBySessionId(sessionId);
    // {
    //     session_id: '3a6567b0ee39fc8461321ab56217e2f6',
    //     jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpZGVudGlmaWNhdGlvbkNvZGUiOiIwODcwODkwMTk2NDciLCJzdWIiOiIxMDAxOTg5MzY0IiwiYXV0aFNvdXJjZSI6bnVsbCwicm9sZXMiOlsiaW52ZXN0b3IiXSwiaXNzIjoiRE5TRSIsImludmVzdG9ySWQiOiIxMDAxOTg5MzY0IiwiZnVsbE5hbWUiOiJOZ3V54buFbiBWxakgxJDDrG5oIEtoYSIsInNlc3Npb25JZCI6IjlhY2UzZGI5LTcxMmUtNGZhOS04ZTIwLWEzMDY4ZTgyNjI2NyIsInVzZXJJZCI6Ijc4Zjg3MDY0LWU4NTQtNGZiNy05ZDRkLTdlMmQzMzI4YzM1ZiIsImF1ZCI6WyJhdWRpZW5jZSJdLCJjdXN0b21lckVtYWlsIjoibmd1eWVudnVkaW5oa2hhQGdtYWlsLmNvbSIsImN1c3RvZHlDb2RlIjoiMDY0Q0tIQTQ1MSIsImN1c3RvbWVySWQiOiIwMDAzMjgxNzc0IiwiZXhwIjoxNzU0NDQ3OTUwLCJjdXN0b21lck1vYmlsZSI6IjA5MDc0MTk0NTEiLCJpYXQiOjE3NTQ0MTkxNTAsInVzZXJuYW1lIjoiMDY0Q0tIQTQ1MSIsInN0YXR1cyI6IkFDVElWRSJ9.UgGa4dv1Wc4Ox7apC7tt2iSPcT4lY2U5ZirgLPbKNW9zP8ocoasr1BAvMb4ubTWdWYgpcKJywVg-_W-aZzhVv9M-_h4lKWxG7tI76vrJlCT-kfLmvp8ZKpq8v5cnaUQ-84U2rIt9eXLOQvUPt2HCbUD2KH5qPkc33HhWBWC5Vcs',
    //     trading_token: null,
    //     expires_at: null,
    //     created_at: 1754419077
    // }
    if (existingToken) {
        res.render('already_login.ejs', { existingToken });
    } else {
        res.render('login.ejs', {  });
    }
});

router.get("/logout", async (req, res) => {
    if (!req.cookies?.sessionId) {
        await tokenService.clearAllTokens(sessionId);
    }
    res.clearCookie('sessionId');
    res.redirect('/login');
});

router.get("/testForm", (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'testForm.html'));
});


// Authentication endpoints
router.post("/auth/login", handleLogin);
router.post("/auth/verify-otp", handleOTPVerification);

// API nhận webhook từ TradingView
router.post("/webhook", handleTradingWebhook);

// API lưu token
router.post("/token", handleTokenSave);

export default router;
