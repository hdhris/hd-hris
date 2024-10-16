import React, { useState, useEffect, useCallback } from "react";
import {
  Divider,
} from "@nextui-org/react";
import EditPersonalInformationForm from "./EditPersonalInformationForm";
import EditEducationalBackgroundForm from "./EditEducationalBackgroundForm";
import EditJobInformationForm from "./EditJobInformationForm";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import Drawer from "@/components/common/Drawer";
import { Form } from "@/components/ui/form";

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
  hired_at: string;
  department_id: string;
  branch_id: string;
  job_id: string;
  batch_id: string;
  days_json: Record<string, boolean>;
  certificates: Certificate[];
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
      highestDegree: "",
      certificates: [],
      hired_at: "",
      department_id: "",
      job_id: "",
      batch_id: "",
      days_json: {},
    },
    mode: "onChange",
  });

  const fetchEmployeeData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!employeeData || !employeeData.id) {
        throw new Error("Employee data not found or invalid");
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
        elementary: educationalBg.elementary || "",
        highSchool: educationalBg.highSchool || "",
        seniorHighSchool: educationalBg.seniorHighSchool || "",
        seniorHighStrand: educationalBg.seniorHighStrand || "",
        tvlCourse: educationalBg.tvlCourse || "",
        universityCollege: educationalBg.universityCollege || "",
        course: educationalBg.course || "",
        highestDegree: educationalBg.highestDegree || "",
        certificates: certificatesWithUrls,
        batch_id:
          employeeData.dim_schedules?.[0]?.ref_batch_schedules?.id?.toString() ||
          "",
        days_json: employeeData.schedules?.[0]?.days_json || {
          Monday: false,
          Tuesday: false,
          Wednesday: false,
          Thursday: false,
          Friday: false,
          Saturday: false,
          Sunday: false,
        },
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
        // If the picture is empty, it means the user wants to remove it
        if (employeeData.picture) {
          // Delete the old picture from EdgeStore
          await edgestore.publicFiles.delete({
            url: employeeData.picture,
          });
        }
        pictureUrl = "";
      }
  
      // Handle certificate uploads
      const updatedCertificates = await Promise.all(
        data.certificates.map(async (cert) => {
          if (cert.url instanceof File) {
            const result = await edgestore.publicFiles.upload({
              file: cert.url,
              options: {
                temporary: false,
              },
            });
            return { fileName: cert.fileName, fileUrl: result.url };
          }
          return { fileName: cert.fileName, fileUrl: cert.url as string };
        })
      );
  
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
  
      const fullData = {
        ...data,
        picture: pictureUrl,
        birthdate: data.birthdate ? new Date(data.birthdate).toISOString() : null,
        hired_at: data.hired_at ? new Date(data.hired_at).toISOString() : null,
        addr_region: parseInt(data.addr_region, 10),
        addr_province: parseInt(data.addr_province, 10),
        addr_municipal: parseInt(data.addr_municipal, 10),
        addr_baranggay: parseInt(data.addr_baranggay, 10),
        department_id: parseInt(data.department_id, 10),
        job_id: parseInt(data.job_id, 10),
        branch_id: parseInt(data.branch_id, 10),
        educational_bg_json: JSON.stringify(educationalBackground),
        batch_id: parseInt(data.batch_id, 10),
        schedules: [
          {
            batch_id: parseInt(data.batch_id, 10),
            days_json: data.days_json,
          },
        ],
      };
  
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
      onClose={onClose}
    >
      <Form {...methods}>
        <form className="mb-4 space-y-4" id="drawer-form" onSubmit={methods.handleSubmit(handleFormSubmit)}>
          {isLoading ? (
            <div>Loading employee data...</div>
          ) : (
            <>
              <h2>Personal Information</h2>
              <EditPersonalInformationForm />
              <Divider className="my-4" />
              <h2>Educational Background</h2>
              <EditEducationalBackgroundForm />
              <Divider className="my-4" />
              <h2>Job Information & Work Schedules</h2>
              <EditJobInformationForm />
            </>
          )}
        </form>
      </Form>
    </Drawer>
  );
};

export default EditEmployee;