'use client'
import React, {useCallback, useState} from 'react';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {Section} from "@/components/common/typography/Typography";
import {ActionButtons} from "@/components/actions/ActionButton";
import {useToast} from "@/components/ui/use-toast";
import {FileDropzone, FileState} from "@/components/ui/fileupload/file";


function RestoreOption() {
    const {toast} = useToast()
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure()
    const [loading, setLoading] = useState<boolean>(false)
    const [restoreFileStates, setRestoreFileStates] = useState<FileState[]>([]);
    const [progress, setProgress] = useState(0)
    const [uploading, setUploading] = useState(false)
    const handleOnSave = useCallback(async () => {

    }, [])

    function updateFileProgress(key: string, progress: FileState['progress']) {
        setRestoreFileStates((fileStates) => {
            const newFileStates = structuredClone(fileStates);
            const fileState = newFileStates.find((fileState) => fileState.key === key,);
            if (fileState) {
                fileState.progress = progress;
            }
            return newFileStates;
        });
    }

    return (<>
        <Button size='sm' variant='faded' onPress={onOpen}>Restore Options</Button>
        <Modal
            placement='center'
            onOpenChange={onOpenChange}
            isOpen={isOpen}
            size='xl'
            isDismissable={false}
        >
            <ModalContent>
                <ModalHeader>Upload your backup</ModalHeader>
                <ModalBody className='space-y-4'>
                    <Section title='Upload Backup File'
                             subtitle='Easily upload a backup file to restore your data and ensure seamless recovery.'/>
                    <FileDropzone
                        className='h-52'
                        value={restoreFileStates}
                        onChange={(files) => {
                            setRestoreFileStates(files);
                        }}
                        onFilesAdded={async (addedFiles) => {

                            const render = new FileReader();
                            render.readAsText(addedFiles[0].file);


                            for (let i = 0; i <= 100; i += 10) {
                                updateFileProgress(addedFiles[0].key, i)
                                await new Promise(resolve => setTimeout(resolve, 500))
                                updateFileProgress(addedFiles[0].key, 'COMPLETE');
                            }
                            setRestoreFileStates(addedFiles);
                        }}
                        dropzoneOptions={{
                            accept: {
                                'application/sql': ['.sql', '.xls', '.xlsx', '.csv'], 'application/x-sql': ['.sql']
                            }, maxFiles: 1,
                        }}

                    />

                </ModalBody>
                <ModalFooter>
                    <ActionButtons label='Apply' onCancel={onClose} onSave={handleOnSave} isLoading={loading}/>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>);
}

export default RestoreOption;