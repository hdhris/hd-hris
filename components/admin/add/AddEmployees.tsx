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
import { useToast } from "@/components/ui/use-toast";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";

interface AddEmployeeProps {
  onEmployeeAdded: () => void;
}

interface EmployeeFormData {
  picture: File | string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  extension: string;
  gender: string;
  email: string;
  contact_no: string;
  birthdate: string;
  addr_region: string;
  addr_province: string;
  addr_municipal: string;
  addr_baranggay: string;
  elementary: string;
  highSchool: string;
  seniorHighSchool: string;
  seniorHighStrand: string;
  tvlCourse: string;
  universityCollege: string;
  course: string;
  highestDegree: string;
  certificates: Array<{ name: string; url: string | File }>;
  hired_at: string;
  department_id: string;
  job_id: string;
  branch_id: string;
  batch_id: string;
  days_json: Record<string, boolean>;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ onEmployeeAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { edgestore } = useEdgeStore();

  const methods = useForm<EmployeeFormData>({
    defaultValues: {
      picture: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "",
      email: "",
      contact_no: "",
      birthdate: "",
      addr_region: "",
      addr_province: "",
      addr_municipal: "",
      addr_baranggay: "",
      elementary: "",
      highSchool: "",
      seniorHighSchool: "",
      seniorHighStrand: "",
      tvlCourse: "",
      universityCollege: "",
      course: "",
      highestDegree: "",
      certificates: [],
      hired_at: "",
      department_id: "",
      job_id: "",
      batch_id: "",
      days_json: {
        // Monday: false,
        // Tuesday: false,
        // Wednesday: false,
        // Thursday: false,
        // Friday: false,
        // Saturday: false,
        // Sunday: false,
      },
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
      let pictureUrl = "";
      if (data.picture instanceof File) {
        const result = await edgestore.publicFiles.upload({
          file: data.picture,
        });
        pictureUrl = result.url;
      } else {
        pictureUrl = data.picture; // If it's already a URL or default picture
      }
  
      // Handle certificates
      const updatedCertificates = await Promise.all(
        data.certificates.map(async (cert) => {
          if (cert.url instanceof File) {
            const result = await edgestore.publicFiles.upload({
              file: cert.url,
              options: {
                temporary: false,
              },
            });
            return { fileName: cert.name, fileUrl: result.url };
          }
          return { fileName: cert.name, fileUrl: cert.url as string };
        })
      );
  
      // Build educational background
      const educationalBackground = {
        elementary: data.elementary,
        highSchool: data.highSchool,
        seniorHighSchool: data.seniorHighSchool,
        seniorHighStrand: data.seniorHighStrand,
        tvlCourse: data.tvlCourse,
        universityCollege: data.universityCollege,
        course: data.course,
        highestDegree: data.highestDegree,
        certificates: updatedCertificates,
      };
  
      // Prepare full data
      const fullData = {
        picture: pictureUrl,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        suffix:data.suffix,
        extension:data.extension,
        gender: data.gender,
        email: data.email,
        contact_no: data.contact_no,
        birthdate: data.birthdate ? new Date(data.birthdate).toISOString() : null,
        hired_at: data.hired_at ? new Date(data.hired_at).toISOString() : null,
        addr_region: parseInt(data.addr_region, 10),
        addr_province: parseInt(data.addr_province, 10),
        addr_municipal: parseInt(data.addr_municipal, 10),
        addr_baranggay: parseInt(data.addr_baranggay, 10),
        educational_bg_json: JSON.stringify(educationalBackground),
        department_id: parseInt(data.department_id, 10),
        job_id: parseInt(data.job_id, 10),
        branch_id: parseInt(data.branch_id, 10),
        batch_id: parseInt(data.batch_id, 10),
        schedules: [
          {
            batch_id: parseInt(data.batch_id, 10),
            days_json: data.days_json,
          },
        ],
      };
  
      console.log("Sending data:", JSON.stringify(fullData, null, 2));
  
      const response = await axios.post(
        "/api/employeemanagement/employees",
        fullData
      );
  
      if (response.status === 201) {
        onEmployeeAdded();
        methods.reset();
        toast({
          title: "Success",
          description: "Employee successfully added!",
          duration: 3000,
        });
  
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Server error response:", error.response.data);
        toast({
          title: "Error",
          description: error.response.data.message || "Failed to add employee. Please try again.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          duration: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <>
      <Add variant="flat" name="Add Employee" onClick={onOpen} />
      <Drawer title="Add New Employee"
        size="lg"
        isOpen={isOpen}
        onClose={onClose}
        // scrollBehavior="inside"
        // isDismissable={false}
      >
        <Form {...methods}>
          <form className="mb-4 space-y-4" id="drawer-form" onSubmit={methods.handleSubmit(handleFormSubmit)}>
            
                <h2>Personal Information</h2>
                <PersonalInformationForm />
                <Divider className="my-6" />
                <h2>Educational Background</h2>
                <EducationalBackgroundForm />
                <Divider className="my-6" />
                <h2>Job Information</h2>
                <JobInformationForm />
          </form>
        </Form>
      </Drawer  >
    </>
  );
};

export default AddEmployee;
