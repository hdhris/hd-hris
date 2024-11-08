import {FileExtension, iconPaths} from "@/components/common/file-extension/FileIcon";

export const getFileExtension = (fileName: string): FileExtension => {
    const extension = fileName.split(".").pop()?.toLowerCase(); // Get the extension and convert to lowercase
    if (extension && (extension in iconPaths)) { // Check if the extension exists in iconPaths
        return extension as FileExtension; // Cast to FileExtension
    }
    return "DEFAULT"; // Return "unknown" if not found
};
