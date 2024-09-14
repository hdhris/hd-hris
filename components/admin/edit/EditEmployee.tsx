import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from "@nextui-org/react";
import PersonalInformationForm from "../add/PersonalInformationForm";
import EducationalBackgroundForm from "../add/EducationalBackgroundForm";
import JobInformationForm from "../add/JobInformation";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

interface EditEmployeeProps {
  employeeId: number;
  onEmployeeUpdated: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface EmployeeFormData {
  picture: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  birthdate: string;
  email: string;
  contact_no: string;
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

const EditEmployee: React.FC<EditEmployeeProps> = ({ employeeId, onEmployeeUpdated, isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const methods = useForm<EmployeeFormData>({
    defaultValues: {
      picture: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "",
      birthdate: "",
      email: "",
      contact_no: "",
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

  useEffect(() => {
    if (isOpen) {
      fetchEmployeeData();
    }
  }, [isOpen, employeeId]);

  const fetchEmployeeData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/employeemanagement/employees?id=${employeeId}`);
      const employeeData = response.data;
      
      methods.reset({
        picture: employeeData.picture || "",
        first_name: employeeData.first_name || "",
        middle_name: employeeData.middle_name || "",
        last_name: employeeData.last_name || "",
        gender: employeeData.gender || "",
        birthdate: employeeData.birthdate ? new Date(employeeData.birthdate).toISOString().split('T')[0] : "",
        email: employeeData.email || "",
        contact_no: employeeData.contact_no || "",
        addr_region: employeeData.addr_region?.toString() || "",
        addr_province: employeeData.addr_province?.toString() || "",
        addr_municipal: employeeData.addr_municipal?.toString() || "",
        addr_baranggay: employeeData.addr_baranggay?.toString() || "",
        elementary: employeeData.educational_bg_json?.elementary || "",
        highSchool: employeeData.educational_bg_json?.highSchool || "",
        seniorHighSchool: employeeData.educational_bg_json?.seniorHighSchool || "",
        seniorHighStrand: employeeData.educational_bg_json?.seniorHighStrand || "",
        universityCollege: employeeData.educational_bg_json?.universityCollege || "",
        course: employeeData.educational_bg_json?.course || "",
        highestDegree: employeeData.educational_bg_json?.highestDegree || "",
        certificates: employeeData.educational_bg_json?.certificates || [],
        hired_at: employeeData.hired_at ? new Date(employeeData.hired_at).toISOString().split('T')[0] : "",
        department_id: employeeData.department_id?.toString() || "",
        job_id: employeeData.job_id?.toString() || "",
        workSchedules: employeeData.workSchedules || {},
      });
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employee data. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Updating employee information...",
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
        certificates: data.certificates,
      };

      const fullData = {
        ...data,
        picture: data.picture,
        birthdate: data.birthdate ? new Date(data.birthdate).toISOString() : null,
        hired_at: data.hired_at ? new Date(data.hired_at).toISOString() : null,
        addr_region: parseInt(data.addr_region, 10),
        addr_province: parseInt(data.addr_province, 10),
        addr_municipal: parseInt(data.addr_municipal, 10),
        addr_baranggay: parseInt(data.addr_baranggay, 10),
        department_id: parseInt(data.department_id, 10),
        job_id: parseInt(data.job_id, 10),
        educational_bg_json: educationalBackground,
      };

      const response = await axios.put(`/api/employeemanagement/employees?id=${employeeId}`, fullData);
      if (response.status === 200) {
        onEmployeeUpdated();
        toast({
          title: "Success",
          description: "Employee information successfully updated!",
          duration: 3000,
        });
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Error",
        description: "Failed to update employee information. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            <ModalHeader className="flex flex-col gap-1">Edit Employee Information</ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div>Loading employee data...</div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold">Personal Information</h2>
                  <PersonalInformationForm />
                  <Divider className="my-6" />
                  <h2 className="text-lg font-semibold">Educational Background</h2>
                  <EducationalBackgroundForm />
                  <Divider className="my-6" />
                  <h2 className="text-lg font-semibold">Job Information</h2>
                  <JobInformationForm />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default EditEmployee;
