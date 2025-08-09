import sqlite3 from 'sqlite3';
import log4js from 'log4js';
import { promises as fs } from 'fs';

const logger = log4js.getLogger('database');

class Database {
    constructor() {
        this.db = null;
    }

    async init() {
        try {
            await fs.mkdir('./data', { recursive: true });
            
            return new Promise((resolve, reject) => {
                this.db = new sqlite3.Database('./data/trading.db', async (err) => {
                    if (err) {
                        logger.error('Error opening database:', err);
                        reject(err);
                        return;
                    }

                    try {
                        // Tạo lại bảng với cấu trúc mới
                        await this.recreateTable();
                        logger.info('Database initialized successfully');
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            logger.error('Error initializing database:', error);
            throw error;
        }
    }

    async recreateTable() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // Drop existing tables
                // this.db.run('DROP TABLE IF EXISTS token');
                // this.db.run('DROP TABLE IF EXISTS order_result');

                // Create token table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS token (
                        session_id TEXT PRIMARY KEY,
                        jwt TEXT,
                        trading_token TEXT,
                        expires_at INTEGER,
                        created_at INTEGER DEFAULT (unixepoch())
                    )
                `);

                // Create order result table based on API spec
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS order_result (
                        id INTEGER PRIMARY KEY,
                        side TEXT NOT NULL,
                        accountNo TEXT NOT NULL,
                        investorId TEXT,
                        symbol TEXT NOT NULL,
                        price REAL NOT NULL,
                        quantity INTEGER NOT NULL,
                        orderType TEXT NOT NULL,
                        orderStatus TEXT NOT NULL,
                        fillQuantity INTEGER,
                        lastQuantity INTEGER,
                        lastPrice REAL,
                        averagePrice REAL,
                        transDate TEXT,
                        createdDate TEXT NOT NULL,
                        modifiedDate TEXT,
                        taxRate REAL,
                        feeRate REAL,
                        leaveQuantity INTEGER,
                        canceledQuantity INTEGER,
                        priceSecure REAL,
                        custody TEXT,
                        channel TEXT,
                        loanPackageId INTEGER,
                        initialRate REAL,
                        error TEXT,
                        created_at INTEGER DEFAULT (unixepoch())
                    )
                `, (err) => {
                    if (err) {
                        logger.error('Error recreating table:', err);
                        reject(err);
                        return;
                    }
                    logger.info('Table recreated successfully');
                    resolve();
                });
            });
        });
    }

    clearAllTokens() {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM token', (err) => {
                if (err) {
                    logger.error('Error clearing tokens:', err);
                    reject(err);
                    return;
                }
                logger.info('All tokens cleared successfully');
                resolve();
            });
        });
    }

    saveJWT(sessionId, jwt) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO token (session_id, jwt) VALUES (?, ?)',
                [sessionId, jwt],
                function(err) {
                    if (err) {
                        logger.error('Error saving JWT:', err);
                        reject(err);
                        return;
                    }
                    logger.info('JWT saved successfully for session:', sessionId);
                    resolve();
                }
            );
        });
    }

    getLatestToken() {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM token ORDER BY created_at DESC LIMIT 1',
                (err, row) => {
                    if (err) {
                        logger.error('Error getting latest token:', err);
                        reject(err);
                        return;
                    }
                    if (!row || Date.now() > row.expires_at) {
                        logger.warn('Token expired or missing');
                        resolve(null);
                        return;
                    }
                    resolve(row);
                });
        });
    }

    getJWTBySessionId(sessionId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT jwt FROM token WHERE session_id = ?',
                [sessionId],
                (err, row) => {
                    if (err) {
                        logger.error('Error getting JWT:', err);
                        reject(err);
                        return;
                    }
                    resolve(row ? row.jwt : null);
                }
            );
        });
    }

    saveTradingToken(sessionId, tradingToken, expiresAt) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE token SET trading_token = ?, expires_at = ? WHERE session_id = ?',
                [tradingToken, expiresAt, sessionId],
                function(err) {
                    if (err) {
                        logger.error('Error saving trading token:', err);
                        reject(err);
                        return;
                    }
                    if (this.changes === 0) {
                        reject(new Error('Session not found'));
                        return;
                    }
                    logger.info('Trading token saved successfully for session:', sessionId);
                    resolve();
                }
            );
        });
    }

    getTokenBySessionId(sessionId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM token WHERE session_id = ? ORDER BY created_at DESC LIMIT 1',
                [sessionId],
                (err, row) => {
                    if (err) {
                        logger.error('Error getting latest token by session ID:', err);
                        reject(err);
                        return;
                    }
                    resolve(row);
                }
            );
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM token', (err, rows) => {
                if (err) {
                    logger.error('Error getting all tokens:', err);
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    getLatestToken() {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM token ORDER BY created_at DESC LIMIT 1',
                (err, row) => {
                    if (err) {
                        logger.error('Error getting latest token:', err);
                        reject(err);
                        return;
                    }
                    resolve(row);
                });
        });
    }

    close() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.close(err => {
                    if (err) {
                        logger.error('Error closing database:', err);
                        reject(err);
                        return;
                    }
                    this.db = null;
                    resolve();
                });
            });
        }
        return Promise.resolve();
    }
}

const database = new Database();

// Đảm bảo database được khởi tạo trước khi sử dụng
await database.init();

export const tokenService = {
    clearAllTokens: () => database.clearAllTokens(),
    saveJWT: (sessionId, jwt) => database.saveJWT(sessionId, jwt),
    getJWTBySessionId: (sessionId) => database.getJWTBySessionId(sessionId),
    saveTradingToken: (sessionId, tradingToken, expiresAt) => database.saveTradingToken(sessionId, tradingToken, expiresAt),
    getTokenBySessionId: (sessionId) => database.getTokenBySessionId(sessionId),
    getAll: () => database.getAll(),
    getLatestToken: () => database.getLatestToken(),
    close: () => database.close()
};

export default database;
