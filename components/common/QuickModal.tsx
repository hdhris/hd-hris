import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    button,
} from "@nextui-org/react";

interface ModalProps {
    title: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    buttons: {
        onClose: {
            label: string;
            onPress?: () => void;
            isLoading?: boolean;
            isDisabled?: boolean;
        };
        onAction: {
            isLoading?: boolean;
            isDisabled?: boolean;
            form?: string;
            label: string;
            onPress?: () => void;
        };
    };
    size?: "2xl" | "xs" | "sm" | "md" | "lg" | "xl" | "3xl" | "4xl" | "5xl" | "full" | undefined;
    children: React.ReactNode;
}

export default function QuickModal({ title, isOpen, buttons, onClose, children, size }: ModalProps) {
    return (
        <Modal isOpen={isOpen} size={size} onClose={onClose} scrollBehavior="inside">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
                        <ModalBody>{children}</ModalBody>
                        <ModalFooter>
                            <Button
                                isDisabled={buttons.onClose.isDisabled}
                                isLoading={buttons.onClose.isLoading}
                                color="danger"
                                variant="light"
                                onPress={buttons.onClose.onPress ?? onClose}
                            >
                                {buttons.onClose.label}
                            </Button>
                            <Button
                                form={buttons.onAction.form}
                                isDisabled={buttons.onAction.isDisabled}
                                isLoading={buttons.onAction.isLoading}
                                color="primary"
                                onPress={buttons.onAction.onPress}
                            >
                                {buttons.onAction.label}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
