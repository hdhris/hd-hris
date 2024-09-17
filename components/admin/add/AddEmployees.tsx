import React, { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast"; // Updated import

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
  hired_at: string;
  department_id: string;
  job_id: string;
  workSchedules: Record<string, unknown>;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ onEmployeeAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast(); // Use custom toast

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
      hired_at: "",
      department_id: "",
      job_id: "",
      workSchedules: {},
    },
    mode: "onChange",
  });

  const handleFormSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Adding new employee...",
    });

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
        picture: data.picture,
        birthdate: data.birthdate
          ? new Date(data.birthdate).toISOString()
          : null,
        hired_at: data.hired_at ? new Date(data.hired_at).toISOString() : null,
        addr_region: parseInt(data.addr_region, 10),
        addr_province: parseInt(data.addr_province, 10),
        addr_municipal: parseInt(data.addr_municipal, 10),
        addr_baranggay: parseInt(data.addr_baranggay, 10),
        department_id: parseInt(data.department_id, 10),
        job_id: parseInt(data.job_id, 10),
        educational_bg_json: educationalBackground,
      };

      const response = await axios.post(
        "/api/employeemanagement/employees",
        fullData
      );
      if (response.status === 201) {
        onEmployeeAdded(); // Call to refresh the table
        methods.reset(); // Clear the form fields

        toast({
          title: "Success",
          description: "Employee successfully added!",
          duration: 3000,
        });

        // Delay closing the modal to ensure toast visibility
        setTimeout(() => {
          onClose(); // Close the modal
        }, 500); // Adjust the timeout as needed
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Add variant="flat" name="Add Employee" onClick={onOpen} />
      <Modal
        size="5xl"
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
                <Button
                  onClick={() => {
                    toast({
                      title: "Button Clicked",
                      description: "You clicked the button!",

                      duration: 1000,
                    });
                  }}
                >
                  Show Toast
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
