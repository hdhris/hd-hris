'use client'
import React, {useCallback, useEffect} from 'react';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {Section} from "@/components/common/typography/Typography";
import {ActionButtons} from "@/components/actions/ActionButton";
import FileUpload from "@/components/common/forms/FileUpload";
import {Parser} from "sql-ddl-to-json-schema";


function RestoreOption() {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure()
    const handleOnSave = useCallback(async () => {

    }, [])



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
                    <FileUpload
                        className='h-52'
                        dropzoneOptions={{
                            accept: {
                                'text/*': ['.sql', '.csv'], 'application/json': ['.json'],
                            }, maxFiles: 1,
                        }}
                    />

                </ModalBody>
                <ModalFooter>
                    <ActionButtons label='Apply' onCancel={onClose} onSave={handleOnSave}/>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>);
}

export default RestoreOption;