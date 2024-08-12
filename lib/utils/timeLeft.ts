interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

export function calculateTimeLeft(expiryTime: number): TimeLeft | null {
    const difference = expiryTime - new Date().getTime();
    let timeLeft: TimeLeft | null = null;

    if (difference > 0) {
        timeLeft = {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }

    return timeLeft;
}
