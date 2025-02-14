import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

export class Logger {
  private logPath: string;

  constructor(filename: string = 'deep-research.log') {
    // 确保日志目录存在
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.logPath = path.join(logDir, filename);
  }

  log(message: string, type: 'info' | 'error' = 'info') {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;

    // 异步写入日志文件
    fs.appendFile(this.logPath, logEntry, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });

    // 同时也打印到控制台
    console.log(logEntry);
  }

  // 用于记录对象类型的数据
  logObject(label: string, data: any) {
    this.log(`${label}:\n${JSON.stringify(data, null, 2)}`);
  }
}

// 创建单例实例
export const logger = new Logger();