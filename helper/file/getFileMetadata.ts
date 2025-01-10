/**
 * Utility to fetch file metadata by downloading a Blob from a URL.
 * @param url - The URL of the file.
 * @returns A promise that resolves with file metadata or rejects with an error.
 */
import {formatFileSize} from "@edgestore/react/utils";

export interface MetadataProps{
    url: string
    name: string
    type: string
    size: string
}
export const getFileMetadataFromUrlWithBlob = async (url: string) => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch file. HTTP status: ${response.status}`);
        }

        const blob = await response.blob();

        // Extract file name from the URL
        const fileName = url.substring(url.lastIndexOf("/") + 1).split(".")[0] || "unknown";

        return {
            url,
            name: fileName,
            type: blob.type.substring(blob.type.lastIndexOf("/") + 1) || "unknown",
            size: formatFileSize(blob.size), // Size in bytes
        };
    } catch (error) {
        console.error("Error fetching file metadata:", error);
        throw error;
    }
};


export async function getAttachmentMetadata(urls: string[]) {
    return Promise.all(urls.map(async (url) => {
        try {
            return await getFileMetadataFromUrlWithBlob(url);
        } catch (error) {
            console.error(`Failed to fetch metadata for ${url}:`, error);
            throw error;
        }
    }));
}