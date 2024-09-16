export function processJsonObject<T>(jsonObject: any): T | null {
    if (jsonObject && typeof jsonObject === 'object') {
        try {
            return jsonObject as T;
        } catch (error) {
            console.error("Error processing JSON object:", error);
            return null;
        }
    } else {
        console.log("No valid JSON object");
        return null;
    }
}