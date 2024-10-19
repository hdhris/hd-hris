export function joinNestedKeys(keys: (any | any[])[]): string {
    return keys
        .map(key =>
            Array.isArray(key)
                ? joinNestedKeys(key) // Recursively flatten and join
                : String(key)  // Convert each key to a string
        )
        .join('.');  // Join the keys with dot notation
}

export type NestedKeys<T> = {
    [K in keyof T]: T[K] extends Record<string, any>
        ? K | [K, NestedKeys<T[K]>]
        : K; // Return the key itself if it's not an object
}[keyof T];