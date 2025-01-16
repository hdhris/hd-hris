export function consoleLog(...data: any[]): void;
export function consoleLog(condition: boolean, ...data: any[]): void;
export function consoleLog(...args: any[]): void {
    // Check if the first argument is a boolean (condition)
    const condition = typeof args[0] === "boolean" ? args[0] : true;
    // Extract the data to log (skip the first argument if it's a condition)
    const data = typeof args[0] === "boolean" ? args.slice(1) : args;

    if (condition) {
        console.log(...data); // Spread the data for proper logging
    }
}