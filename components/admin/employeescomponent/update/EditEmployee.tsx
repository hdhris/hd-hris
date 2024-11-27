"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Divider } from "@nextui-org/react";
import EditPersonalInformationForm from "./EditPersonalInformationForm";
import EditEducationalBackgroundForm from "./EditEducationalBackgroundForm";
import EditJobInformationForm from "./EditJobInformationForm";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Text from "@/components/Text";
import EditScheduleSelection from "./EditScheduleSelection";
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
  suffix: z.string().optional().nullable(),
  extension: z.string().optional().nullable(),
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
  //
  masters: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Masters institution should only contain letters and numbers"
    )
    .optional(),
  mastersCourse: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Masters course should only contain letters and numbers"
    )
    .optional(),
    mastersYear: z
    .union([
      z.string().regex(/^\d{4}-\d{4}$/, "Year should be in format YYYY-YYYY"),
      z.string().length(0),  // allows empty string
      z.null(),             // allows null
      z.undefined()         // allows undefined
    ])
    .optional(),
  mastersCertificates: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.union([z.string(), z.instanceof(File), z.undefined()]),
        fileName: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  doctorate: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Doctorate institution should only contain letters and numbers"
    )
    .optional(),
  doctorateCourse: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Doctorate course should only contain letters and numbers"
    )
    .optional(),
    doctorateYear: z
    .union([
      z.string().regex(/^\d{4}-\d{4}$/, "Year should be in format YYYY-YYYY"),
      z.string().length(0),  // allows empty string
      z.null(),             // allows null
      z.undefined()         // allows undefined
    ])
    .optional(),
  doctorateCertificates: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.union([z.string(), z.instanceof(File), z.undefined()]),
        fileName: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  //
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
  is_regular: z.preprocess((val) => {
    if (typeof val === "string") {
      return val === "true";
    }
    return val;
  }, z.boolean()),
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
  days_json: z.array(z.string()),
});

interface EditEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
  employeeData: any;
  onEmployeeUpdated: () => Promise<void>;
}

interface Certificate {
  name: string;
  url: string | File;
  fileName: string;
}

interface EmployeeFormData {
  is_regular: string;
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
  masters?: string;
  mastersCourse?: string;
  mastersYear?: string;
  mastersCertificates?: Certificate[];
  doctorate?: string;
  doctorateCourse?: string;
  doctorateYear?: string;
  doctorateCertificates?: Certificate[];
  highestDegree: string;
  certificates: Certificate[];
  hired_at: string;
  department_id: string;
  job_id: string;
  branch_id: string;
  batch_id: string;
  days_json: string[];
}

const EditEmployee: React.FC<EditEmployeeProps> = ({
  isOpen,
  onClose,
  employeeData,
  onEmployeeUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { edgestore } = useEdgeStore();

  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      picture: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "",
      email: "",
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
      masters: "",
      mastersCourse: "",
      mastersYear: "",
      mastersCertificates: [],
      doctorate: "",
      doctorateCourse: "",
      doctorateYear: "",
      doctorateCertificates: [],
      highestDegree: "",
      certificates: [],
      hired_at: "",
      department_id: "",
      job_id: "",
      is_regular: "false",
      batch_id: "",
      days_json: [],
    },
    mode: "onChange",
    reValidateMode: "onBlur",
    shouldUnregister: false,
    criteriaMode: "all",
  });

  const fetchEmployeeData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!employeeData || !employeeData.id) {
        throw new Error("Employee data not found or invalid");
      }
      //to fetch the current days to be updated
      let daysArray: string[] = [];
      if (employeeData.dim_schedules?.[0]?.days_json) {
        try {
          const daysJson = employeeData.dim_schedules[0].days_json;
          if (typeof daysJson === "string") {
            // Parse the JSON string
            daysArray = JSON.parse(daysJson);
          } else if (Array.isArray(daysJson)) {
            daysArray = daysJson;
          }
        } catch (error) {
          console.error("Error parsing days_json:", error);
          daysArray = [];
        }
      }

      const educationalBg =
        typeof employeeData.educational_bg_json === "string"
          ? JSON.parse(employeeData.educational_bg_json || "{}")
          : employeeData.educational_bg_json || {};

      const certificatesWithUrls = (educationalBg.certificates || []).map(
        (cert: { fileName: string; fileUrl: string }) => ({
          name: cert.fileName,
          url: cert.fileUrl,
          fileName: cert.fileName,
        })
      );
      const mastersCertificatesWithUrls = (educationalBg.mastersCertificates || []).map(
        (cert: { fileName: string; fileUrl: string }) => ({
          name: cert.fileName,
          url: cert.fileUrl,
          fileName: cert.fileName,
        })
      );
  
      const doctorateCertificatesWithUrls = (educationalBg.doctorateCertificates || []).map(
        (cert: { fileName: string; fileUrl: string }) => ({
          name: cert.fileName,
          url: cert.fileUrl,
          fileName: cert.fileName,
        })
      );

      //reset and fetch the current employee data
      methods.reset({
        picture: employeeData.picture || "",
        first_name: employeeData.first_name || "",
        middle_name: employeeData.middle_name || "",
        last_name: employeeData.last_name || "",
        suffix: employeeData.suffix || "",
        extension: employeeData.extension || "",
        gender: employeeData.gender || "",
        email: employeeData.email || "",
        contact_no: employeeData.contact_no || "",
        birthdate: employeeData.birthdate
          ? new Date(employeeData.birthdate).toISOString().split("T")[0]
          : "",
        hired_at: employeeData.hired_at
          ? new Date(employeeData.hired_at).toISOString().split("T")[0]
          : "",
        addr_region: employeeData.addr_region?.toString() || "",
        addr_province: employeeData.addr_province?.toString() || "",
        addr_municipal: employeeData.addr_municipal?.toString() || "",
        addr_baranggay: employeeData.addr_baranggay?.toString() || "",
        department_id: employeeData.department_id?.toString() || "",
        branch_id: employeeData.branch_id?.toString() || "",
        job_id: employeeData.job_id?.toString() || "",
        is_regular: employeeData.is_regular?.toString() || "",
        elementary: educationalBg.elementary || "",
        highSchool: educationalBg.highSchool || "",
        seniorHighSchool: educationalBg.seniorHighSchool || "",
        seniorHighStrand: educationalBg.seniorHighStrand || "",
        tvlCourse: educationalBg.tvlCourse || "",
        universityCollege: educationalBg.universityCollege || "",
        course: educationalBg.course || "",
        masters: educationalBg.masters || "",
        mastersCourse: educationalBg.mastersCourse || "",
        mastersYear: educationalBg.mastersYear || "",
        mastersCertificates: mastersCertificatesWithUrls,
        doctorate: educationalBg.doctorate || "",
        doctorateCourse: educationalBg.doctorateCourse || "",
        doctorateYear: educationalBg.doctorateYear || "",
        doctorateCertificates: doctorateCertificatesWithUrls,
        highestDegree: educationalBg.highestDegree || "",
        certificates: certificatesWithUrls,
        batch_id:
          employeeData.dim_schedules?.[0]?.ref_batch_schedules?.id?.toString() ||
          "",
        days_json: daysArray,
      });

      toast({
        title: "Success",
        description: "Employee data fetched successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employee data. Please try again.",
        duration: 5000,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [employeeData, methods, toast, onClose]);

  useEffect(() => {
    if (isOpen && employeeData) {
      fetchEmployeeData();
    }
  }, [isOpen, employeeData, fetchEmployeeData]);

  const handleFormSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Updating employee information...",
    });

    try {
      let pictureUrl = typeof data.picture === "string" ? data.picture : "";
      if (data.picture instanceof File) {
        const result = await edgestore.publicFiles.upload({
          file: data.picture,
        });
        pictureUrl = result.url;
      } else if (data.picture === "") {
        if (employeeData.picture) {
          await edgestore.publicFiles.delete({
            url: employeeData.picture,
          });
        }
        pictureUrl = "";
      }

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

      const mastersCertificates = await Promise.all(
        (data.mastersCertificates || []).map(async (cert) => {
          if (!cert) return null;
          if (cert.url instanceof File) {
            const result = await edgestore.publicFiles.upload({
              file: cert.url,
              options: { temporary: false },
            });
            return {
              fileName:
                cert.fileName ||
                cert.name ||
                result.url.split("/").pop() ||
                "",
              fileUrl: result.url,
            };
          }
          return {
            fileName: cert.fileName || cert.name || "",
            fileUrl: cert.url as string,
          };
        })
      ).then((certs) => certs.filter((cert) => cert !== null));
    
      const doctorateCertificates = await Promise.all(
        (data.doctorateCertificates || []).map(async (cert) => {
          if (!cert) return null;
          if (cert.url instanceof File) {
            const result = await edgestore.publicFiles.upload({
              file: cert.url,
              options: { temporary: false },
            });
            return {
              fileName:
                cert.fileName ||
                cert.name ||
                result.url.split("/").pop() ||
                "",
              fileUrl: result.url,
            };
          }
          return {
            fileName: cert.fileName || cert.name || "",
            fileUrl: cert.url as string,
          };
        })
      ).then((certs) => certs.filter((cert) => cert !== null));

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
        masters: data.masters,
        mastersCourse: data.mastersCourse,
        mastersYear: data.mastersYear,
        mastersCertificates: mastersCertificates,
        doctorate: data.doctorate,
        doctorateCourse: data.doctorateCourse,
        doctorateYear: data.doctorateYear,
        doctorateCertificates: doctorateCertificates,
      };

      //use to prepare the input fulldata
      const fullData = {
        ...data,
        picture: pictureUrl,
        birthdate: data.birthdate
          ? new Date(data.birthdate).toISOString()
          : null,
        hired_at: data.hired_at ? new Date(data.hired_at).toISOString() : null,
        suffix: data.suffix || "",
        extension: data.extension || "",
        addr_region: parseInt(data.addr_region, 10),
        addr_province: parseInt(data.addr_province, 10),
        addr_municipal: parseInt(data.addr_municipal, 10),
        addr_baranggay: parseInt(data.addr_baranggay, 10),
        department_id: parseInt(data.department_id, 10),
        job_id: parseInt(data.job_id, 10),
        is_regular: Boolean(data.is_regular),
        branch_id: parseInt(data.branch_id, 10),
        educational_bg_json: JSON.stringify(educationalBackground),
        batch_id: parseInt(data.batch_id, 10),
        schedules: [
          {
            batch_id: parseInt(data.batch_id, 10),
            days_json: data.days_json, // Make sure days_json is passed as is
          },
        ],
      };
      // console.log("Sending data:", JSON.stringify(fullData, null, 2));

      //saving full data
      const response = await axios.put(
        `/api/employeemanagement/employees?id=${employeeData.id}`,
        fullData
      );

      if (response.status === 200) {
        await onEmployeeUpdated();
        toast({
          title: "Success",
          description: "Employee information successfully updated!",
          duration: 3000,
        });
        onClose();
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
    <Drawer
      title="Edit Employee"
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
          <>
            <EditPersonalInformationForm />
            <Divider className="my-4" />
            <Text className="text-medium font-semibold">
              Educational Background
            </Text>
            <EditEducationalBackgroundForm />
            <Divider className="my-4" />
            <Text>Job Information</Text>
            <EditJobInformationForm />
            <Text className="text-small font-semibold" >Working Schedule</Text>
            <EditScheduleSelection />
          </>
        </form>
      </Form>
    </Drawer>
  );
};

export default EditEmployee;
