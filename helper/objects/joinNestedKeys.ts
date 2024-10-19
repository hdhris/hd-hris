export function joinNestedKeys(keys: (any | any[])[]): string {
    return keys
        .map(key =>
            Array.isArray(key)
                ? joinNestedKeys(key) // Recursively flatten and join
                : String(key)  // Convert each key to a string
        )
        .join('.');  // Join the keys with dot notation
}
