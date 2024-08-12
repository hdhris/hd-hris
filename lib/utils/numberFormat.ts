const numberWithCommas = (x: number) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const ordinalSuffix = (i: number) => {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}

const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const compactNumber = (x: number) => {
    if (x < 1000) return x.toString();

    const suffixes = ["", "K", "M", "B", "T"];
    const magnitude = Math.floor(Math.log10(x) / 3);
    const suffixIndex = Math.max(0, Math.min(suffixes.length - 1, magnitude));

    let shortenedValue = x / Math.pow(1000, suffixIndex);

    if (shortenedValue % 1 !== 0) {
        shortenedValue = parseFloat(shortenedValue.toFixed(1));
    }

    return shortenedValue.toString() + suffixes[suffixIndex];
};


export {numberWithCommas, ordinalSuffix, getRandomInt, compactNumber}