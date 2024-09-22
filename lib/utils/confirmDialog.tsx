"use client";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import ReactDOM from 'react-dom/client';

const showDialog = async (
  title: string,
  message: string,
  withCancel?: boolean
): Promise< 'yes'|'no'|'cancel' > => {
  return new Promise((resolve) => {
    const Dialog = () => {
      const [isOpen, setIsOpen] = useState(true);

      const handleYes = () => {
        setIsOpen(false);
        resolve('yes');
      };

      const handleNo = () => {
        setIsOpen(false);
        resolve('no');
      };

      const handleCancel = () => {
        setIsOpen(false);
        resolve('cancel');
      };

      return (
        <Modal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          isDismissable={false}
          isKeyboardDismissDisabled={true}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
                <ModalBody>
                  <p>{message}</p>
                </ModalBody>
                <ModalFooter>
                  { withCancel && <Button color="default" variant="light" onPress={handleCancel}>
                    Cancel
                  </Button>}
                  <Button color="danger" variant="light" onPress={handleNo}>
                    No
                  </Button>
                  <Button color="primary" onPress={handleYes}>
                    Yes
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      );
    };

    // Render the dialog inside a React portal to ensure it displays over other content
    const modalContainer = document.createElement("div");
    document.body.appendChild(modalContainer);

    const removeDialog = () => {
      document.body.removeChild(modalContainer);
    };

    const dialogJSX = <Dialog />;
    const renderDialog = () => {
      const root = ReactDOM.createRoot(modalContainer);
      root.render(dialogJSX);
    };
    

    renderDialog();

    // Clean up after modal closes
    const observer = new MutationObserver(() => {
      if (!modalContainer.innerHTML) {
        removeDialog();
        observer.disconnect();
      }
    });
    observer.observe(modalContainer, { childList: true });
  });
};

export default showDialog;
