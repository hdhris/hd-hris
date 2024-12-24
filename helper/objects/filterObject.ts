export function objectIncludes<T extends object>(obj: T, keysToInclude: (keyof T)[]): Partial<T> {
    return Object.keys(obj)
        .filter((key) => keysToInclude.includes(key as keyof T))
        .reduce((filteredObj, key) => {
            filteredObj[key as keyof T] = obj[key as keyof T];
            return filteredObj;
        }, {} as Partial<T>);
}

export function objectExcludes<T extends object>(obj: T, keysToExclude: (keyof T)[]): Partial<T> {
    return Object.keys(obj)
        .filter((key) => !keysToExclude.includes(key as keyof T))
        .reduce((filteredObj, key) => {
            filteredObj[key as keyof T] = obj[key as keyof T];
            return filteredObj;
        }, {} as Partial<T>);
}
