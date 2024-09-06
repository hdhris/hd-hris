import React, { useState } from "react";
import Add from "@/components/common/button/Add";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import PersonalInformationForm from "./PersonalInformationForm";
import EducationalBackgroundForm from "./EducationalBackgroundForm"; // Import EducationalBackgroundForm
import JobInformationForm from "./JobInformation";
import { useForm, FormProvider } from "react-hook-form";

const AddEmployee = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentStep, setCurrentStep] = useState(1); // Update to handle multiple steps
  const methods = useForm();

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep < 3) {
      // There are now 3 steps
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFormSubmit = (data: any) => {
    console.log("Form Data:", data);
    onClose();
  };

  // Update breadcrumb for 3 steps
  const renderBreadcrumb = () => {
    const stepLabels = [
      "Personal Information",
      "Educational Background",
      "Job Information",
    ];

    return (
      <div className="flex space-x-2 text-sm text-gray-600">
        <span className="font-semibold">Add Employees</span>
        <span>{">"}</span>
        <span className={currentStep === 1 ? "font-semibold" : ""}>
          {stepLabels[currentStep - 1]} {/* Dynamic breadcrumb */}
        </span>
      </div>
    );
  };

  return (
    <>
      <Add variant="flat" name="Add Employee" onClick={onOpen} />
      <Modal
        size="4xl"
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        isDismissable={false}
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    {renderBreadcrumb()}
                  </ModalHeader>
                  <ModalBody>
                    {currentStep === 1 && <PersonalInformationForm />}
                    {currentStep === 2 && <EducationalBackgroundForm />}{" "}
                    {/* Add educational form here */}
                    {currentStep === 3 && <JobInformationForm />}
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="danger"
                      variant="light"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                      }}
                    >
                      Cancel
                    </Button>
                    {currentStep > 1 && (
                      <Button onClick={prevStep}>Back</Button>
                    )}
                    {currentStep < 3 ? ( // Update for 3 steps
                      <Button color="primary" onClick={nextStep}>
                        Next
                      </Button>
                    ) : (
                      <Button color="primary" type="submit">
                        Save
                      </Button>
                    )}
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default AddEmployee;
