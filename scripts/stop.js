import { exec } from 'child_process';
import log4js from 'log4js';

const logger = log4js.getLogger('stop-script');
logger.level = 'info';

const PORT = process.env.PORT || 3000;

// Tìm và kill process đang sử dụng port
const findAndKillProcess = () => {
    return new Promise((resolve, reject) => {
        // Tìm PID của process đang sử dụng port
        exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
            if (error) {
                logger.info(`Không tìm thấy process nào đang sử dụng port ${PORT}`);
                resolve();
                return;
            }

            // Trích xuất PID từ output của netstat
            const lines = stdout.split('\n');
            const pids = new Set();
            
            lines.forEach(line => {
                const matches = line.match(/\s+(\d+)\s*$/);
                if (matches) {
                    pids.add(matches[1]);
                }
            });

            if (pids.size === 0) {
                logger.info(`Không tìm thấy process nào đang sử dụng port ${PORT}`);
                resolve();
                return;
            }

            // Kill từng process tìm thấy
            pids.forEach(pid => {
                exec(`taskkill /PID ${pid} /F`, (err) => {
                    if (err) {
                        logger.error(`Không thể kill process ${pid}: ${err.message}`);
                    } else {
                        logger.info(`Đã kill process ${pid} thành công`);
                    }
                });
            });

            resolve();
        });
    });
};

// Thực thi script
logger.info('Bắt đầu dừng server...');
findAndKillProcess()
    .then(() => {
        logger.info('Hoàn tất dừng server');
        process.exit(0);
    })
    .catch(error => {
        logger.error('Lỗi khi dừng server:', error);
        process.exit(1);
    });
