export const getRandomColor = (index: number) => {
    const colors = [
      "teal", "pink", "violet", "orange", "green",
      "amber", "red", "yellow", "blue",
    ];
  
    return {
      border: `border-${colors[index % colors.length]}-500`,
      hoverBorder: `hover:border-${colors[index % colors.length]}-500`,
      text: `text-${colors[index % colors.length]}-500`,
      bg: `bg-${colors[index % colors.length]}-100`,
    };
  };
  
  export const getShortTime = (time: string): string => time.slice(11, 16);
  
  export const formatTime = (time: string) => {
    const [hour, minute] = getShortTime(time).split(":");
    const intHour = parseInt(hour);
    const isPM = intHour >= 12;
    const formattedHour = intHour % 12 || 12;
    const period = isPM ? "PM" : "AM";
  
    return `${String(formattedHour).padStart(2, "0")}:${minute} ${period}`;
  };
  