export const getDateRequestedAgo = (referenceDate: Date, isDay?: boolean): string => {
    const currentDate = new Date();
    // const formatter = new Intl.DateTimeFormat('en-US', {
    //     hour12: true,
    //     hour: 'numeric',
    //     minute: '2-digit',
    //     timeZone: 'UTC'
    // });
    const referenceTime = currentDate.getTime() - referenceDate.getTime(); // Calculate the difference in milliseconds

    // Convert milliseconds to minutes, hours, or days
    const minutes = Math.abs(Math.floor(referenceTime / (1000 * 60)));
    const hours = Math.abs(Math.floor(minutes / 60));
    const days = Math.abs(Math.floor(hours / 24));

    if(!isDay) {
        if (minutes < 60) {
            return `${referenceDate.toLocaleDateString()} - ${minutes} mins ago`;
        } else if (hours < 24) {
            return `${referenceDate.toLocaleDateString()} - ${hours} hrs ago`;
        } else {
            return `${referenceDate.toLocaleDateString()} - ${days} days ago`;
        }
    } else{
        return `${days} days ago`;
    }


};

export const getRandomDateTime = (startDate: Date, endDate: Date): Date => {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    const randomTimestamp = startTimestamp + Math.random() * (endTimestamp - startTimestamp);
    const randomDate = new Date(randomTimestamp);

    // Randomize hours, minutes, seconds, and milliseconds
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);
    const milliseconds = Math.floor(Math.random() * 1000);

    randomDate.setHours(hours, minutes, seconds, milliseconds);

    return randomDate;
};
