export function toGMT8(value: string | Date): Date {
    let date: Date;
  
    if (typeof value === "string") {
      // Check if the input is a time string in the format "HH:mm:ss"
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
      if (timeRegex.test(value)) {
        const now = new Date(); // Get the current date
        const [hours, minutes, seconds] = value.split(":").map(Number);
        date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
      } else {
        date = new Date(value); // Assume it's an ISO date string
      }
    } else {
      date = value; // Directly use the Date object
    }
  
    const offset = 8 * 60; // GMT+8 in minutes
    const gmt8Time = new Date(date.getTime() + offset * 60 * 1000);
    return gmt8Time;
  }
  