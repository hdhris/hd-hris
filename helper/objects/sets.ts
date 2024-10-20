export const areSetsEqual = (a: Set<any>, b: Set<any>) => {
    if (a.size !== b.size) return false;

    // Convert Set to array and sort to compare values
    const aArray = Array.from(a);
    const bArray = Array.from(b);

    // Sort the arrays for comparison
    aArray.sort();
    bArray.sort();

    // Check if both arrays are equal
    return aArray.every((item, index) => item === bArray[index]);
};