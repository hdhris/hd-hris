'use client';

import {formatFileSize} from '@edgestore/react/utils';
import * as React from 'react';
import {type DropzoneOptions, useDropzone} from 'react-dropzone';
import {twMerge} from 'tailwind-merge';
import {Button, cn} from "@nextui-org/react";
import {LuCheckCircle, LuFileWarning, LuUpload, LuX} from "react-icons/lu";
import {motion} from 'framer-motion';
import FileIcon from "@/components/common/file-extension/FileIcon";
import {getFileExtension} from "@/helper/file/get-file-extension";
import {icon_color, icon_size} from "@/lib/utils";
import {GridPattern} from "@/components/ui/file-upload";
import Typography from "@/components/common/typography/Typography";
import {formatBytes} from "@/helper/file/formatBytes";

const mainVariant = {
    initial: {
        x: 0, y: 0,
    }, animate: {
        x: 20, y: -20, opacity: 0.9,
    },
};

const secondaryVariant = {
    initial: {
        opacity: 0,
    }, animate: {
        opacity: 1,
    },
};

const variants = {
    base: 'relative rounded-md p-4 w-full flex justify-center items-center flex-col cursor-pointer dark:border-gray-300 transition-colors duration-200 ease-in-out',
    active: 'border-none',
    disabled: 'hidden bg-gray-200 border-gray-300 cursor-default pointer-events-none bg-opacity-30 dark:bg-gray-700 dark:border-gray-600',
    accept: 'border border-blue-500 bg-blue-500 bg-opacity-10',
    reject: 'border border-red-700 bg-red-700 bg-opacity-10',
};

export type FileState = {
    file: File; key: string; // used to identify the file in the progress callback
    progress: 'PENDING' | 'COMPLETE' | 'ERROR' | number; abortController?: AbortController;
};

type InputProps = {
    className?: string;
    value?: FileState[];
    onChange?: (files: FileState[]) => void | Promise<void>;
    onFilesAdded?: (addedFiles: FileState[]) => void | Promise<void>;
    disabled?: boolean;
    dropzoneOptions?: Omit<DropzoneOptions, 'disabled'>;
};

const ERROR_MESSAGES = {
    fileTooLarge(maxSize: number) {
        return `The file is too large. Max size is ${formatFileSize(maxSize)}.`;
    }, fileInvalidType() {
        return 'Invalid file type.';
    }, tooManyFiles(maxFiles: number) {
        return `You can only add ${maxFiles} file(s).`;
    }, fileNotSupported() {
        return 'The file is not supported.';
    },
};


const FileDropzone = React.forwardRef<HTMLInputElement, InputProps>(({
                                                                         dropzoneOptions,
                                                                         value,
                                                                         className,
                                                                         disabled,
                                                                         onFilesAdded,
                                                                         onChange
                                                                     }, ref,) => {
    const [customError, setCustomError] = React.useState<string>();
    if (dropzoneOptions?.maxFiles && value?.length) {
        disabled = disabled ?? value.length >= dropzoneOptions.maxFiles;
    }


    // dropzone configuration
    const {
        getRootProps, getInputProps, fileRejections, isFocused, isDragAccept, isDragReject, isDragActive
    } = useDropzone({
        disabled, onDrop: (acceptedFiles) => {
            const files = acceptedFiles;
            setCustomError(undefined);
            if (dropzoneOptions?.maxFiles && (value?.length ?? 0) + files.length > dropzoneOptions.maxFiles) {
                setCustomError(ERROR_MESSAGES.tooManyFiles(dropzoneOptions.maxFiles));
                return;
            }
            if (files) {
                const addedFiles = files.map<FileState>((file) => ({
                    file, key: Math.random().toString(36).slice(2), progress: 'PENDING',
                }));
                void onFilesAdded?.(addedFiles);
                void onChange?.([...(value ?? []), ...addedFiles]);
            }
        }, ...dropzoneOptions,
    });

    // styling
    const dropZoneClassName = React.useMemo(() => twMerge(variants.base, isFocused && variants.active, disabled && variants.disabled, (isDragReject ?? fileRejections[0]) && variants.reject, isDragAccept && variants.accept, className,).trim(), [isFocused, fileRejections, isDragAccept, isDragReject, disabled, className,],);

    // const handleClick = () => {
    //     // ref?.current?.click();
    // };
    // error validation messages
    const errorMessage = React.useMemo(() => {
        if (fileRejections[0]) {
            const {errors} = fileRejections[0];
            if (errors[0]?.code === 'file-too-large') {
                return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? 0);
            } else if (errors[0]?.code === 'file-invalid-type') {
                return ERROR_MESSAGES.fileInvalidType();
            } else if (errors[0]?.code === 'too-many-files') {
                return ERROR_MESSAGES.tooManyFiles(dropzoneOptions?.maxFiles ?? 0);
            } else {
                return ERROR_MESSAGES.fileNotSupported();
            }
        }
        return undefined;
    }, [fileRejections, dropzoneOptions]);

    return (<motion.div
            // onClick={handleClick}
            whileHover="animate"
            className="group/file block rounded-lg cursor-pointer w-full relative overflow-hidden">
            <div className="flex w-full flex-col gap-2">
                <div className="w-full">
                    {/* Main File Input */}
                    <div
                        {...getRootProps({
                            className: dropZoneClassName,
                        })}
                    >
                        {!disabled && (<>
                            <input ref={ref}
                                   id="file-upload-handle"
                                   type="file"
                                   {...getInputProps()} />
                            <div
                                className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
                                <GridPattern/>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                                    Upload file
                                </p>
                                <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
                                    Drag or drop your files here or click to upload
                                </p>
                            </div>
                        </>)}
                        <div className="relative w-full max-w-xl mx-auto">
                            {!value?.length && !value?.find(item => !item.file) && <motion.div
                                layoutId="file-upload"
                                variants={mainVariant}
                                transition={{
                                    type: "spring", stiffness: 300, damping: 20,
                                }}
                                className={cn("relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md", "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]")}
                            >
                                {isDragActive ? (<motion.p
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    className="text-neutral-600 flex flex-col items-center"
                                >
                                    Drop it
                                    <LuUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400"/>
                                </motion.p>) : (<LuUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300"/>)}
                            </motion.div>}
                            {!value?.length && !value?.find(item => !item.file) && (<motion.div
                                variants={secondaryVariant}
                                className="absolute opacity-0 border border-dashed border-slate-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
                            ></motion.div>)}
                        </div>
                    </div>


                    {/* Error Text */}
                    <div className="mt-1 text-xs text-red-500">
                        {customError ?? errorMessage}
                    </div>
                </div>

                {/* Selected Files */}
                <div className="relative w-full max-w-xl mx-auto space-y-4">
                    {value?.map(({file, abortController, progress}, i) => {
                        const extension = getFileExtension(file.name)
                        return (<motion.div
                            key={"file" + i}
                            layoutId={i === 0 ? "file-upload" : "file-upload-" + i}
                            className={cn("relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start p-4 mt-4 w-full mx-auto rounded-md border-1", "shadow-sm")}
                        >
                            <div className="flex justify-between w-full">
                                <FileIcon extension={extension}/>
                                {progress === 'PENDING' ? (<Button
                                    isIconOnly
                                    variant="light"
                                    // type="button"
                                    // className="rounded-md p-1 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => {
                                        void onChange?.(value.filter((_, index) => index !== i),);
                                    }}
                                >
                                    <LuX
                                        className={cn("h-4 w-4 shrink-0 text-gray-400 dark:text-gray-400", icon_color, icon_size)}/>
                                    {/*<LuTrash2 className={cn("", icon_color, icon_size)}/>*/}
                                </Button>) : progress === 'ERROR' ? (<LuFileWarning
                                    className="shrink-0 text-red-600 dark:text-red-400"/>) : progress !== 'COMPLETE' ? (
                                    <div className="flex flex-col items-end gap-0.5">
                                        {abortController && (<button
                                            type="button"
                                            className="rounded-md p-0.5 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            disabled={progress === 100}
                                            onClick={() => {
                                                abortController.abort();
                                            }}
                                        >
                                            <LuX
                                                className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-400"/>
                                        </button>)}

                                    </div>) : (<LuCheckCircle className="shrink-0 text-green-600 dark:text-gray-400"/>)}
                            </div>
                            <div className="flex justify-between w-full items-center gap-4">
                                <motion.p
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    layout
                                    className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                                >
                                    {file.name}
                                </motion.p>
                                <motion.p
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    layout
                                    className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                                >
                                    {formatBytes(file.size)}
                                </motion.p>
                            </div>

                            <div
                                className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                                <div className="w-6 text-end">
                                    <Typography as="span"
                                                className="text-sm text-gray-800 dark:text-white">{typeof progress === 'number' &&  Math.round(progress) + '%'}</Typography>
                                </div>
                                <motion.p
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    layout
                                >
                                    {new Date(file.lastModified).toLocaleDateString()}
                                </motion.p>

                            </div>
                            {/* Progress Bar */}
                            <div className={cn("flex items-center gap-x-3 whitespace-nowrap mt-2 w-full",  typeof progress !== 'number' ? "hidden" : "")}>
                                <div
                                    className="flex w-full h-1 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700">
                                    <div
                                        className={cn("h-full transition-all duration-300 ease-in-out dark:bg-white", progress === 'ERROR' ? 'bg-red-400' : progress === 'PENDING' ? 'bg-warning-400' : progress === 'COMPLETE' ? 'bg-success-400' : 'bg-default-400')}
                                        style={{
                                            width: progress ? `${progress}%` : '0%',
                                        }}/>
                                </div>

                            </div>
                        </motion.div>)
                    })}
                </div>
            </div>
        </motion.div>

    );
},);
FileDropzone.displayName = 'FileDropzone';

export {FileDropzone};