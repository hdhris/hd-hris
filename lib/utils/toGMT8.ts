export function toGMT8(value: string | Date): Date | string {
    let date: Date;
  
    if (typeof value === "string") {
      // Check if the input is a time string in the format "HH:mm:ss"
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
      if (timeRegex.test(value)) {
        return `1970-01-01T${value}.000Z`;
      } else {
        date = new Date(value); // Assume it's an ISO date string
      }
    } else {
      date = value; // Directly use the Date object
    }
  
    const offset = 8 * 60; // GMT+8 in minutes
    return new Date(date.getTime() + offset * 60 * 1000);
  }
  