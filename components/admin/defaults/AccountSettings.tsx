'use client'
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@nextui-org/react';
import React from 'react';

interface Props {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

function AccountSettings({isOpen, onOpenChange}: Props) {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top-center"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Account Settings</ModalHeader>
                        <ModalBody>

                        </ModalBody>
                        <ModalFooter>
                            {/*<Button color="danger" variant="flat" onPress={onClose}>*/}
                            {/*    Close*/}
                            {/*</Button>*/}
                            {/*<Button color="primary" onPress={onClose}>*/}
                            {/*    Sign in*/}
                            {/*</Button>*/}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default AccountSettings;