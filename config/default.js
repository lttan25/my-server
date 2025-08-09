const config = {
    // Server configuration
    server: {
        protocol: 'https',
        port: 3000,
        host: 'localhost',
        ssl: {
            enabled: true,
            key: './certificates/private-key.pem',
            cert: './certificates/certificate.pem',
            //ca: './certificates/ca-certificate.pem', // Optional - for chain certificates
            requestCert: false, // Optional - require client certificate
            rejectUnauthorized: false // Optional - reject connections without certs when requestCert is true
        }
    },
    // DNSE API configuration
    dnse: {
        baseUrl: 'https://api.dnse.com.vn',
        apis: {
            // Authentication and Orders
            login: '/auth-service/login',
            smartOTP: '/order-service/trading-token',
            emailOTP: '/auth-service/api/email-otp',
            orders: '/order-service/v2/orders ',
        }
    },
    log4js: {
        appenders: {
            console: { type: 'console' },
            file: {
                type: 'dateFile',
                filename: './logs/app.log',
                pattern: '.yyyy-MM-dd',
                compress: true,
                keepFileExt: true,
                numBackups: 5,
                maxLogSize: 10 * 1024 * 1024
            }
        },
        categories: {
            default: {
                appenders: ['console', 'file'],
                level: 'info'
            },
            http: {
                appenders: ['console', 'file'],
                level: 'info'
            }
        }
    }
};

export default config;