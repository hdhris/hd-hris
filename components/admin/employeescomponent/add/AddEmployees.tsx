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
import Text from "@/components/Text";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddEmployeeProps {
  onEmployeeAdded: () => void;
}
//
export const employeeSchema = z.object({
  picture: z.union([z.instanceof(File), z.string()]).optional(),
  first_name: z
    .string()
    .min(1, "First name is required")
    .regex(/^[a-zA-Z\s]*$/, "First name should only contain letters"),
  middle_name: z
    .string()
    .regex(/^[a-zA-Z\s]*$/, "Middle name should only contain letters")
    .optional(),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .regex(/^[a-zA-Z\s]*$/, "Last name should only contain letters"),
  suffix: z
    .string()

    .optional(),
  extension: z
    .string()

    .optional(),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Invalid email address"),
  contact_no: z
    .string()
    .min(1, "Contact number is required")
    .regex(
      /^(09|\+639|9)\d{9}$/,
      "Contact number should start with 09, +639, or 9 followed by 9 digits"
    )
    .transform((val) => {
      if (val.startsWith("09")) {
        return val.substring(1);
      }
      // Remove "+63" if number starts with "+639"
      if (val.startsWith("+639")) {
        return val.substring(3);
      }
      return val;
    })
    .refine(
      (val) => val.length === 10,
      "Contact number must be exactly 10 digits"
    ),
  birthdate: z.string().min(1, "Birthdate is required"),
  addr_region: z.string().min(1, "Region is required"),
  addr_province: z.string().min(1, "Province is required"),
  addr_municipal: z.string().min(1, "Municipal is required"),
  addr_baranggay: z.string().min(1, "Baranggay is required"),
  elementary: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  highSchool: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  seniorHighSchool: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  seniorHighStrand: z
    .string()
    .regex(/^[a-zA-Z0-9\s]*$/, "Strand should only contain letters and numbers")
    .optional(),
  tvlCourse: z
    .string()
    .regex(/^[a-zA-Z0-9\s]*$/, "Course should only contain letters and numbers")
    .optional(),
  universityCollege: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  course: z
    .string()
    .regex(/^[a-zA-Z0-9\s]*$/, "Course should only contain letters and numbers")
    .optional(),
  highestDegree: z.string().optional(),
  certificates: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.union([z.string(), z.instanceof(File), z.undefined()]),
        fileName: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  hired_at: z.string().min(1, "Hire date is required"),
  department_id: z.string().min(1, "Department is required"),
  job_id: z.string().min(1, "Job is required"),
  branch_id: z.string().min(1, "Branch is required"),
  batch_id: z.string().min(1, "Batch is required"),
  // days_json: z
  //   .union([z.string(), z.array(z.string())])
  //   .transform((val) => {
  //     // If val is a string, split by commas, trim each day, and remove empty strings
  //     if (typeof val === "string") {
  //       return val
  //         .split(",")
  //         .map((day) => day.trim())
  //         .filter((day) => day);
  //     }
  //     // If it's already an array, return it as is
  //     return val;
  //   })
  //   .pipe(z.array(z.string()).min(1, "At least one working day is required")),
  days_json: z.array(z.string())
});

interface Certificate {
  name: string;
  url: string | File;
  fileName?: string;
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
  certificates: Certificate[];
  hired_at: string;
  department_id: string;
  job_id: string;
  branch_id: string;
  batch_id: string;
  days_json: string[];
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ onEmployeeAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { edgestore } = useEdgeStore();
  //
  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      picture: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      extension: "",
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
      branch_id: "",
      batch_id: "",
      days_json: [],
    },
    mode: "onChange", // This enables real-time validation
    reValidateMode: "onChange", // This ensures validation runs on every change
    shouldUnregister: false, // Keeps form values when unmounting fields
    criteriaMode: "all", // Shows all validation errors
  });

  const handleFormSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Adding new employee...",
    });
    try {
      // Handle picture upload similar to edit
      let pictureUrl = typeof data.picture === "string" ? data.picture : "";
      if (data.picture instanceof File) {
        const result = await edgestore.publicFiles.upload({
          file: data.picture,
        });
        pictureUrl = result.url;
      } else {
        pictureUrl = ""; 
      }

      // Handle certificates
      const updatedCertificates = await Promise.all(
        (data.certificates || []).map(async (cert) => {
          if (!cert) return null;

          if (cert.url instanceof File) {
            const result = await edgestore.publicFiles.upload({
              file: cert.url,
              options: {
                temporary: false,
              },
            });
            return {
              fileName:
                cert.fileName || cert.name || result.url.split("/").pop() || "",
              fileUrl: result.url,
            };
          }
          return {
            fileName: cert.fileName || cert.name || "",
            fileUrl: cert.url as string,
          };
        })
      );

      const filteredCertificates = updatedCertificates.filter(
        (cert) => cert !== null
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
        certificates: filteredCertificates,
      };

      // Prepare full data
      const fullData = {
        picture: pictureUrl,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        suffix: data.suffix,
        extension: data.extension,
        gender: data.gender,
        email: data.email,
        contact_no: data.contact_no,
        birthdate: data.birthdate
          ? new Date(data.birthdate).toISOString()
          : null,
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
            days_json: data.days_json,
            batch_id: parseInt(data.batch_id, 10),
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
          description:
            error.response.data.message ||
            "Failed to add employee. Please try again.",
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
      <Add variant="solid" name="Add Employee" onClick={onOpen} />
      <Drawer
        title="Add New Employee"
        size="lg"
        isOpen={isOpen}
        onClose={() => {
          methods.reset();
          onClose();
        }}
      >
        <Form {...methods}>
          <form
            className="mb-4 space-y-4"
            id="drawer-form"
            onSubmit={methods.handleSubmit(handleFormSubmit)}
          >
            <PersonalInformationForm />
            <Divider className="my-6" />
            <Text className="text-medium font-semibold">
              Educational Background
            </Text>
            <EducationalBackgroundForm />
            <Divider className="my-6" />
            <Text>Job Information</Text>
            <JobInformationForm />
          </form>
        </Form>
      </Drawer>
    </>
  );
};

export default AddEmployee;
