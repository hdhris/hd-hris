import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
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
import Add from "@/components/common/button/Add";
import PersonalInformationForm from "./PersonalInformationForm";
import EducationalBackgroundForm from "./EducationalBackgroundForm";
import JobInformationForm from "./JobInformation";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";

interface AddEmployeeProps {
  onEmployeeAdded: () => void;
}

interface EmployeeFormData {
  picture: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  birthdate: string;
  addr_region: string;
  addr_province: string;
  addr_municipal: string;
  addr_baranggay: string;
  elementary: string;
  highSchool: string;
  seniorHighSchool: string;
  seniorHighStrand: string;
  universityCollege: string;
  course: string;
  highestDegree: string;
  certificates: Array<{ name: string; url: string }>;
  hireDate: string;
  jobTitle: string;
  jobRole: string;
  workingType: string;
  contractYears: string;
  workSchedules: Record<string, unknown>;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ onEmployeeAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const methods = useForm<EmployeeFormData>({
    defaultValues: {
      picture: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "",
      birthdate: "",
      addr_region: "",
      addr_province: "",
      addr_municipal: "",
      addr_baranggay: "",
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
      workSchedules: {},
    },
    mode: "onChange",
  });
  const handleFormSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const educationalBackground = {
        elementary: data.elementary,
        highSchool: data.highSchool,
        seniorHighSchool: data.seniorHighSchool,
        seniorHighStrand: data.seniorHighStrand,
        universityCollege: data.universityCollege,
        course: data.course,
        highestDegree: data.highestDegree,
        certificates: data.certificates.map((file) => ({
          fileName: file.name,
          fileUrl: file.url,
        })),
      };

      const fullData = {
        ...data,
        birthdate: data.birthdate
          ? new Date(data.birthdate).toISOString()
          : null,
        hireDate: data.hireDate ? new Date(data.hireDate).toISOString() : null,
        addr_region: parseInt(data.addr_region, 10),
        addr_province: parseInt(data.addr_province, 10),
        addr_municipal: parseInt(data.addr_municipal, 10),
        addr_baranggay: parseInt(data.addr_baranggay, 10),
        educationalBackground: JSON.stringify(educationalBackground),
      };

      const response = await axios.post(
        "/api/employeemanagement/employees",
        fullData
      );
      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Success",
          description: "Employee successfully added!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        onEmployeeAdded(); // tawagon para mag refresh
        methods.reset(); // tangalon ang data sa fields
        onClose(); // close model
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <ModalHeader>Add New Employee</ModalHeader>
              <ModalBody>
                <h2>Personal Information</h2>
                <PersonalInformationForm />
                <Divider className="my-6" />
                <h2>Educational Background</h2>
                <EducationalBackgroundForm />
                <Divider className="my-6" />
                <h2>Job Information</h2>
                <JobInformationForm />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button color="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </ModalFooter>
            </ModalContent>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default AddEmployee;
