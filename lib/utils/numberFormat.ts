import { formatDistanceToNow } from 'date-fns'

function formatTimeAgo(date: Date | string): string {
  return formatDistanceToNow(date, { addSuffix: true })
}


const numberWithCommas = (n: number) => {
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 20 });
}

const ordinalSuffix = (i: number) => {
    const value = parseInt(String(i),10);
    const suffixes = ["th", "st", "nd", "rd"];
    const remainder = value % 100;
    const suffix =
    remainder >= 11 && remainder <= 13 ? "th" : suffixes[(value % 10) as keyof typeof suffixes] || "th";
    return `${value}${suffix}`;
}

const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "PHP" }).format(Number(amount));
};

const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const compactNumber = (x: number) => {
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(x);
};



export {numberWithCommas, ordinalSuffix, getRandomInt, compactNumber, formatCurrency, formatTimeAgo}