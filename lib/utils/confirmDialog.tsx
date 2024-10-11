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
import ReactDOM from "react-dom/client";

interface showDialogProps {
  title: string;
  message: string;
  withCancel?: boolean;
  preferredAnswer?: "yes" | "no" | "cancel";
}

const showDialog = async ({
  title,
  message,
  withCancel,
  preferredAnswer,
}: showDialogProps): Promise<"yes" | "no" | "cancel"> => {
  const prefAnswer = preferredAnswer || "yes";
  return new Promise((resolve) => {
    const Dialog = () => {
      const [isOpen, setIsOpen] = useState(true);

      const handleYes = () => {
        setIsOpen(false);
        resolve("yes");
      };

      const handleNo = () => {
        setIsOpen(false);
        resolve("no");
      };

      const handleCancel = () => {
        setIsOpen(false);
        resolve("cancel");
      };

      return (
        <Modal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          isDismissable={false}
          isKeyboardDismissDisabled={true}
          size="sm"
          closeButton={false}
          style={{
            zIndex: '9999 !important'
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-small">
                  {title}
                </ModalHeader>
                <ModalBody>
                  <p>{message}</p>
                </ModalBody>
                <ModalFooter className="z-[9999]">
                  {withCancel && (
                    <Button
                      color="primary"
                      variant={prefAnswer == "cancel" ? "solid" : "light"}
                      onPress={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    color="danger"
                    variant={prefAnswer == "no" ? "solid" : "light"}
                    onPress={handleNo}
                  >
                    No
                  </Button>
                  <Button
                    color="primary"
                    variant={prefAnswer == "yes" ? "solid" : "light"}
                    onPress={handleYes}
                  >
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
