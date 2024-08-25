'use client';

import React, { useState } from 'react';
import { FileState, MultiFileDropzone } from "@/components/ui/fileupload/multi-file";

function FileUpload() {
    const [fileStates, setFileStates] = useState<FileState[]>([]);

    function updateFileProgress(key: string, progress: FileState['progress']) {
        setFileStates((fileStates) => {
            const newFileStates = structuredClone(fileStates);
            const fileState = newFileStates.find((fileState) => fileState.key === key);
            if (fileState) {
                fileState.progress = progress;
            }
            return newFileStates;
        });
    }

    return (
        <div>
            <MultiFileDropzone
                value={fileStates}
                onChange={(files) => {
                    setFileStates(files);
                }}
                onFilesAdded={async (addedFiles) => {
                    setFileStates([...fileStates, ...addedFiles]);

                    await Promise.all(addedFiles.map(async (addedFileState) => {
                        const formData = new FormData();
                        formData.append('file', addedFileState.file); // Make sure to use 'file' as the key

                        try {
                            const res = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData,
                            });

                            if (!res.ok) {
                                throw new Error('Upload failed');
                            }

                            // Update progress to 100%
                            updateFileProgress(addedFileState.key, 100);

                            // Wait 1 second before marking as complete
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            updateFileProgress(addedFileState.key, 'COMPLETE');
                        } catch (err) {
                            updateFileProgress(addedFileState.key, 'ERROR');
                        }
                    }));
                }}
            />
        </div>
    );
}

export default FileUpload;
