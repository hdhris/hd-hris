export function formatFullName(
    prefix: string = '',      // Optional prefix
    first_name: string,
    middle_name: string,
    last_name: string,
    extension: string = '',  // Extensions like Jr., Sr.
    suffixes: string[] | string = [] // Other suffixes like PhD, MD, etc.
) {
    let formattedName = '';

    // Add the prefix if provided
    if (prefix) {
        formattedName += `${prefix} `;
    }

    // Start with last name and first name
    formattedName += `${last_name} ${first_name}`;

    // Add the middle initial if middle name is provided
    if (middle_name) {
        formattedName += ` ${middle_name.charAt(0)}.`;
    }

    // Add the extension (like Jr., Sr.) if provided
    if (extension) {
        formattedName += ` ${extension}`;
    }

    // Add any other suffixes
    if (suffixes.length > 0) {
        formattedName += ` ${typeof suffixes === 'string' ? suffixes : suffixes.join(' ')}`;
    }

    return formattedName;
}
