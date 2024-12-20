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
    [K in keyof T]: T[K] extends (infer U)[] // If T[K] is an array
      ? K | [K, NestedKeys<U>] // Include the key and traverse into the array's type
      : T[K] extends Record<string, any> // If T[K] is an object
      ? K | [K, NestedKeys<T[K]>] // Include the key and traverse into the object's type
      : K; // Otherwise, just include the key itself
  }[keyof T];
  