import React, { useCallback, useState } from "react";
import { FileDropzone, FileState } from "../ui/fileupload/file";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { useFormContext } from "react-hook-form";

interface QuickFileUploadProps {
    name?: string;
    values?: string[];
    onChange?: (values: string[]) => void;
}

function QuickFileUpload({ name, values: propValues = [], onChange: propOnChange = () => {} }: QuickFileUploadProps) {
    const form = useFormContext();
    const { watch, setValue } = form || {};

    // Use form context if available, otherwise use props
    const values = form ? watch( name ?? "files") : propValues;
    const onChange = form ? (v: string[]) => setValue( name ?? "files", v) : propOnChange;

    const { edgestore } = useEdgeStore();
    const [documentAttachments, setDocumentAttachments] = useState<FileState[]>([]);

    function updateFileProgress(key: string, progress: FileState["progress"]) {
        setDocumentAttachments((fileStates) => {
            const newFileStates = structuredClone(fileStates);
            const fileState = newFileStates.find((fileState) => fileState.key === key);
            if (fileState) {
                fileState.progress = progress;
            }
            return newFileStates;
        });
    }

    const fileUpload = useCallback(
        async (addedFiles: FileState[]) => {
            setDocumentAttachments([...documentAttachments, ...addedFiles]);
            await Promise.all(
                addedFiles.map(async (addedFileState) => {
                    try {
                        const res = await edgestore.publicFiles.upload({
                            file: addedFileState.file,
                            onProgressChange: async (progress) => {
                                updateFileProgress(addedFileState.key, progress);
                                if (progress === 100) {
                                    // wait 1 second to set it to complete
                                    // so that the user can see the progress bar at 100%
                                    await new Promise((resolve) => setTimeout(resolve, 1000));
                                    updateFileProgress(addedFileState.key, "COMPLETE");
                                }
                            },
                        });
                        onChange([...values, res.url]);
                    } catch (err) {
                        updateFileProgress(addedFileState.key, "ERROR");
                    }
                })
            );
        },
        [documentAttachments, edgestore.publicFiles, values]
    );

    return (
        <FileDropzone
            onChange={setDocumentAttachments}
            value={documentAttachments}
            onFilesAdded={fileUpload}
            dropzoneOptions={{
                accept: {
                    "application/pdf": [".pdf"],
                    "application/msword": [".doc"],
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                    "image/webp": [".webp"],
                },
                maxSize: 5 * 1024 * 1024, // 5MB limit
            }}
        />
    );
}

export default QuickFileUpload;
