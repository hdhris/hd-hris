export function formatFullName(last_name: string, first_name: string, middle_name: string, suffix: string) {
    let formattedName = `${last_name}, ${first_name}`;

    if (middle_name) {
        formattedName += ` ${middle_name.charAt(0)}.`;
    }

    if (suffix) {
        formattedName += ` ${suffix}.`;
    }

    return formattedName;
}
