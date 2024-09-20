import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from "@nextui-org/react";
import EditPersonalInformationForm from "./EditPersonalInformationForm";
import EditEducationalBackgroundForm from "./EditEducationalBackgroundForm";
import EditJobInformationForm from "./EditJobInformationForm";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useEdgeStore } from "@/lib/edgestore/edgestore";

interface EditEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  onEmployeeUpdated: () => Promise<void>;
}

interface EmployeeFormData {
  picture: File | string;
  first_name: string;
  middle_name: string;
  last_name: string;
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
  batch_id: string; // batch_schedule_id -> batch_id
  days_json: Record<string, boolean>;
}

const EditEmployee: React.FC<EditEmployeeProps> = ({
  isOpen,
  onClose,
  employeeId,
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
      const response = await axios.get(
        `/api/employeemanagement/employees?id=${employeeId}`
      );
      const employeeData = response.data;

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
        })
      );

      methods.reset({
        picture: employeeData.picture || "",
        first_name: employeeData.first_name || "",
        middle_name: employeeData.middle_name || "",
        last_name: employeeData.last_name || "",
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
          "", // Adjusted to batch_id
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
  }, [employeeId, methods, toast, onClose]);

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchEmployeeData();
    }
  }, [isOpen, employeeId, fetchEmployeeData]);

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
      }

      const updatedCertificates = await Promise.all(
        data.certificates.map(async (cert) => {
          if (cert.url instanceof File) {
            const result = await edgestore.publicFiles.upload({
              file: cert.url,
            });
            return {  fileUrl: result.url };
          }
          return { fileUrl: cert.url };
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
        educational_bg_json: JSON.stringify(educationalBackground),
        batch_id: parseInt(data.batch_id, 10), // Adjusted to batch_id
        schedules: [
          {
            batch_id: parseInt(data.batch_id, 10),
            days_json: data.days_json,
          },
        ],
      };

      const response = await axios.put(
        `/api/employeemanagement/employees?id=${employeeId}`,
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
            <ModalHeader>Edit Employee</ModalHeader>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant ="solid"
                type="submit"
                isDisabled={isSubmitting || isLoading}
              >
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