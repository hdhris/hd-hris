// logger.ts
enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL'
}

class Logger {
    private logLevel: LogLevel;

    constructor(logLevel: LogLevel = LogLevel.INFO) {
        this.logLevel = logLevel;
    }

    private log(message: string, level: LogLevel): void {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] - `, message);
    }

    public debug(message: string): void {
        // Disable DEBUG logs only in production
        if (process.env.NODE_ENV !== 'production' && this.shouldLog(LogLevel.DEBUG)) {
            this.log(message, LogLevel.DEBUG);
        }
    }

    public info(message: string): void {
        if (this.shouldLog(LogLevel.INFO)) {
            this.log(message, LogLevel.INFO);
        }
    }

    public warn(message: string): void {
        if (this.shouldLog(LogLevel.WARN)) {
            this.log(message, LogLevel.WARN);
        }
    }

    public error(message: string): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.log(message, LogLevel.ERROR);
        }
    }

    public fatal(message: string): void {
        if (this.shouldLog(LogLevel.FATAL)) {
            this.log(message, LogLevel.FATAL);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        const levelPriority = Object.values(LogLevel).indexOf(this.logLevel);
        const messagePriority = Object.values(LogLevel).indexOf(level);
        return messagePriority >= levelPriority;
    }
}

export { Logger, LogLevel };
