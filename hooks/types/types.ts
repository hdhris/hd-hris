export type NestedKeys<T> = {
    [K in keyof T]: T[K] extends Record<string, any> ? K | [K, NestedKeys<T[K]>] : K; // Return the key itself if it's not an object
}[keyof T];


export interface SortedItemProps<T> {
    key: NestedKeys<T>;
    name: string;
}