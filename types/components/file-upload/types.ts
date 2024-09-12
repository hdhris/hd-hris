import type {DropzoneOptions} from "react-dropzone";

export type FileState = {
    file: File; key: string; // used to identify the file in the progress callback
    progress: 'PENDING' | 'COMPLETE' | 'ERROR' | number; abortController?: AbortController;
};

export type InputProps = {
    className?: string;
    value?: FileState[];
    onChange?: (files: FileState[]) => void | Promise<void>;
    onFilesAdded?: (addedFiles: FileState[]) => void | Promise<void>;
    disabled?: boolean;
    dropzoneOptions?: Omit<DropzoneOptions, 'disabled'>;
};