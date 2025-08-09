import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import https from 'https';
import fs from 'fs';
import log4js from 'log4js';
import session from 'express-session';
import config from "./config/default.js";
import tradingRoutes from './src/routes/trading.js';
import path from 'path';
import { tokenService } from './src/services/database.js';

// Load environment variables
dotenv.config();

// Configure logging
log4js.configure(config.log4js);
const logger = log4js.getLogger('server');

// Initialize express app
const app = express();

// Dùng cookie-parser
app.use(cookieParser());

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", config.dnse?.baseUrl || ''],
        },
    },
}));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: config.server.protocol === 'https',
        maxAge: 1000 * 60 * 15 // 15 minutes
    }
}));
app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));

// Routes
app.use('/', tradingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).send('Internal Server Error');
});

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'public')); // thư mục chứa file .ejs

// Server configuration
const { protocol, port, host, ssl } = config.server;

if (protocol === 'https') {
  // HTTPS server
  const httpsOptions = {
    key: fs.readFileSync(ssl.key),
    cert: fs.readFileSync(ssl.cert),
    ...(ssl.ca && { ca: fs.readFileSync(ssl.ca) }),
    requestCert: ssl.requestCert,
    rejectUnauthorized: ssl.rejectUnauthorized
  };

  https.createServer(httpsOptions, app)
    .listen(port, () => {
      logger.info(`🚀 HTTPS Server running at ${protocol}://${host}:${port}`);
    });
} else {
  // HTTP server
  app.listen(port, () => {
    logger.info(`🚀 HTTP Server running at ${protocol}://${host}:${port}`);
  });
}
