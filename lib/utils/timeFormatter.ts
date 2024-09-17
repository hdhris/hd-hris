export const calculateShiftLength = (
    clockIn: string,
    clockOut: string,
    breaks: number
  ) => {
    const [inHour, inMinute] = (clockIn.slice(11, 16) as string).split(":").map(Number);
    const [outHour, outMinute] = (clockOut.slice(11, 16) as string).split(":").map(Number);
  
    const clockInMinutes = inHour * 60 + inMinute;
    const clockOutMinutes = outHour * 60 + outMinute;
  
    const shiftLengthMinutes = clockOutMinutes - clockInMinutes - breaks;
  
    const hours = Math.floor(shiftLengthMinutes / 60);
    const minutes = shiftLengthMinutes % 60;
  
    return `${hours} hr${hours !== 1 ? "s" : ""} ${
      minutes > 0 ? `and ${minutes} min${minutes !== 1 ? "s" : ""}` : ""
    }`;
  };
