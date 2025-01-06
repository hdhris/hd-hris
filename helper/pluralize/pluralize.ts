/**
 * Returns a pluralized string based on the given number, optionally including "is" or "are".
 *
 * @param {number} n - The count to determine singular or plural form.
 * @param {string} baseWord - The base word to pluralize.
 * @param {boolean} [showCount] - Whether to include the count in the output string.
 * @param {boolean} [includeVerb] - Whether to include "is" or "are" for grammatical accuracy.
 * @returns {string} The pluralized string with optional count and verb.
 */
export const pluralize = (
    n: number,
    baseWord: string,
    showCount: boolean = true,
    includeVerb?: boolean
): string => {
    let word: string;

    // Singular case
    if (n === 1) {
        word = baseWord;
        return `${includeVerb ? "is " : ""}${showCount ? n : ""} ${word}`;
    }

    // Handle words ending in "f" or "fe" (e.g., "knife" -> "knives", "wolf" -> "wolves")
    if (baseWord.endsWith("f")) {
        word = baseWord.slice(0, -1) + "ves";
    } else if (baseWord.endsWith("fe")) {
        word = baseWord.slice(0, -2) + "ves";
    }
    // Handle words ending in "y" (e.g., "city" -> "cities")
    else if (baseWord.endsWith("y") && !/[aeiou]y$/.test(baseWord)) {
        word = baseWord.slice(0, -1) + "ies";
    }
    // Handle words ending in "s", "x", "z", "ch", or "sh" (e.g., "box" -> "boxes")
    else if (/(s|x|z|ch|sh)$/.test(baseWord)) {
        word = baseWord + "es";
    }
    // Default case: append "s"
    else {
        word = baseWord + "s";
    }

    // Plural case
    return `${includeVerb ? "are " : ""}${showCount ? n : ""} ${word}`;
};
