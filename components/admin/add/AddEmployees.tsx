import React, { useState } from "react";
import Add from "@/components/common/button/Add";
import BreadcrumbComponent from "@/components/common/breadcrumb";
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
import EducationalBackgroundForm from "./EducationalBackgroundForm";
import JobInformationForm from "./JobInformation";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";

const AddEmployee = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentStep, setCurrentStep] = useState(1);

  const methods = useForm({
    defaultValues: {
      ID: "",
      profileImage: null,
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      birthdate: "",
      email: "",
      phoneNo: "",
      region: "",
      province: "",
      city: "",
      purok: "",
      elementary: "",
      highSchool: "",
      seniorHighSchool: "",
      seniorHighStrand: "",
      universityCollege: "",
      course: "",
      highestDegree: "",
      certificates: [],
      department: "",
      hireDate: "",
      jobTitle: "",
      jobRole: "",
      workingType: "",
      contractYears: "",
      workSchedule: {},
    },
    mode: "onChange",
  });

  const [savedData, setSavedData] = useState({});

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    methods.trigger().then((isValid) => {
      if (isValid && currentStep < 3) {
        setSavedData(methods.getValues());
        setCurrentStep((prev) => prev + 1);
      }
    });
  };

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      methods.reset(savedData);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const response = await axios.post("/api/employees", data);
      console.log("Employee created:", response.data);
      onClose();
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleCancel = () => {
    methods.reset();
    setSavedData({});
    setCurrentStep(1);
    onClose();
  };

  const renderBreadcrumb = () => {
    const breadcrumbPaths = [
      { title: "Add Employee", link: "#" },
      { 
        title:
          currentStep === 1 ? "Personal Information" :
          currentStep === 2 ? "Educational Background" : 
          "Job Information",
        link: "#"
      },
    ];
    return <BreadcrumbComponent paths={breadcrumbPaths} />;
  };

  return (
    <>
      <Add variant="flat" name="Add Employee" onClick={onOpen} />
      <Modal
        size="4xl"
        isOpen={isOpen}
        onClose={handleCancel}
        scrollBehavior="inside"
        isDismissable={false}
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
            <ModalContent>
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {renderBreadcrumb()}
                </ModalHeader>
                <ModalBody>
                  {currentStep === 1 && <PersonalInformationForm />}
                  {currentStep === 2 && <EducationalBackgroundForm />}
                  {currentStep === 3 && <JobInformationForm />}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onClick={handleCancel}>
                    Cancel
                  </Button>
                  {currentStep > 1 && (
                    <Button onClick={prevStep}>Back</Button>
                  )}
                  {currentStep < 3 ? (
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
            </ModalContent>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default AddEmployee;
