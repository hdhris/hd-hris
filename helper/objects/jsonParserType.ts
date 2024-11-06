export function tryParse(data: unknown){
    return JSON.parse(JSON.stringify(data));
}