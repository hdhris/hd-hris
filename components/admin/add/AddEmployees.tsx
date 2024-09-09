import React from "react";
import Add from "@/components/common/button/Add";
import BreadcrumbComponent from "@/components/common/breadcrumb";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  useDisclosure,
} from "@nextui-org/react";
import PersonalInformationForm from "./PersonalInformationForm";
import EducationalBackgroundForm from "./EducationalBackgroundForm";
import JobInformationForm from "./JobInformation";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";

interface AddEmployeeProps {
  onEmployeeAdded: () => void;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ onEmployeeAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const methods = useForm({
    defaultValues: {
      picture: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      birthdate: "",
      addr_region: "",
      addr_province: "",
      addr_municipal: "",
      addr_baranggay: "",
      // Include default values for educational background and job information fields
      elementary: "",
      highSchool: "",
      seniorHighSchool: "",
      seniorHighStrand: "",
      universityCollege: "",
      course: "",
      highestDegree: "",
      certificates: [],
      hireDate: "",
      jobTitle: "",
      jobRole: "",
      workingType: "",
      contractYears: "",
      workSchedules: {}, // Add the initial structure for work schedules if needed
    },
    mode: "onChange",
  });

  const handleFormSubmit = async (data: any) => {
    try {
      // Combine the educational background fields into a single JSON object
      const educationalBackground = {
        elementary: data.elementary,
        highSchool: data.highSchool,
        seniorHighSchool: data.seniorHighSchool,
        seniorHighStrand: data.seniorHighStrand,
        universityCollege: data.universityCollege,
        course: data.course,
        highestDegree: data.highestDegree,
        certificates:
          data.certificates?.map((file: any) => ({
            fileName: file.name,
            fileUrl: file.url,
          })) || [],
      };

      // Prepare data for submission
      const fullData = {
        ...data,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
        addr_region: parseInt(data.addr_region),
        addr_province: parseInt(data.addr_province),
        addr_municipal: parseInt(data.addr_municipal),
        addr_baranggay: parseInt(data.addr_baranggay),
        educationalBackground: JSON.stringify(educationalBackground), // Convert to JSON string
      };

      const response = await axios.post(
        "/api/employeemanagement/employees",
        fullData
      );
      console.log("Employee created:", response.data);

      onClose();
      onEmployeeAdded();
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleCancel = () => {
    methods.reset();
    onClose();
  };

  const renderBreadcrumb = () => {
    const breadcrumbPaths = [{ title: "Add Employee", link: "#" }];
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
                <ModalBody className="max-h-[70vh] overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-2">
                    Personal Information
                  </h2>
                  <PersonalInformationForm />

                  <Divider className="my-6" />

                  <h2 className="text-lg font-semibold mb-2">
                    Educational Background
                  </h2>
                  <EducationalBackgroundForm />

                  <Divider className="my-6" />

                  <h2 className="text-lg font-semibold mb-2">
                    Job Information
                  </h2>
                  <JobInformationForm />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button color="primary" type="submit">
                    Save
                  </Button>
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
