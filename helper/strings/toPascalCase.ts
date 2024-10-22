export function toPascalCase(input: string): string {
    return input
        // Split the string by non-word characters (spaces, underscores, etc.)
        .split(/[\s_]+/)
        // Map over each word, capitalizing the first letter and joining with an empty string
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        // Join all the words without spaces to form a PascalCase string
        .join(' ');
}