"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeFormData } from "../schema";
import { useToast } from "@/components/ui/use-toast";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Tabs, Tab, Spinner } from "@nextui-org/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useEmployeeData } from "@/services/queries";
import EditPersonalInformationForm from "@/components/admin/employeescomponent/update/EditPersonalInformationForm";
import EditEducationalBackgroundForm from "@/components/admin/employeescomponent/update/EditEducationalBackgroundForm";
import EditJobInformationForm from "@/components/admin/employeescomponent/update/EditJobInformationForm";
import EditScheduleSelection from "@/components/admin/employeescomponent/update/EditScheduleSelection";

type EmployeeFields = keyof EmployeeFormData;
type Certificate = {
  name?: string;
  url: string | File;
  fileName?: string;
};
const personalFields: EmployeeFields[] = [
  "first_name",
  "middle_name",
  "last_name",
  "suffix",
  "extension",
  "gender",
  "email",
  "contact_no",
  "birthdate",
  "addr_region",
  "addr_province",
  "addr_municipal",
  "addr_baranggay",
  "fathers_first_name",
  "fathers_middle_name",
  "fathers_last_name",
  "mothers_first_name",
  "mothers_middle_name",
  "mothers_last_name",
  "guardian_first_name",
  "guardian_middle_name",
  "guardian_last_name",
];

const educationalFields: EmployeeFields[] = [
  "elementary",
  "highSchool",
  "seniorHighSchool",
  "seniorHighStrand",
  "tvlCourse",
  "universityCollege",
  "course",
  "highestDegree",
  "certificates",
  "masters",
  "mastersCourse",
  "mastersYear",
  "mastersCertificates",
  "doctorate",
  "doctorateCourse",
  "doctorateYear",
  "doctorateCertificates",
];

const jobFields: EmployeeFields[] = [
  "hired_at",
  "department_id",
  "job_id",
  "employement_status_id",
  "branch_id",
  "salary_grade_id",
  "batch_id",
  "days_json",
];

export default function EditEmployeePage({
  params,
}: {
  params: { id: string };
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { edgestore } = useEdgeStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const { data: employeeData, isLoading: isFetching } = useEmployeeData(params.id);


  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    mode: "onChange",
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
      fathers_first_name: "",
      fathers_middle_name: "",
      fathers_last_name: "",
      mothers_first_name: "",
      mothers_middle_name: "",
      mothers_last_name: "",
      guardian_first_name: "",
      guardian_middle_name: "",
      guardian_last_name: "",
      elementary: "",
      highSchool: "",
      seniorHighSchool: "",
      seniorHighStrand: "",
      tvlCourse: "",
      universityCollege: "",
      course: "",
      highestDegree: "",
      certificates: [],
      mastersCertificates: [],
      doctorateCertificates: [],
     
      masters: "",
      mastersCourse: "",
      mastersYear: "",
   
      doctorate: "",
      doctorateCourse: "",
      doctorateYear: "",
    
      hired_at: "",
      department_id: "",
      job_id: "",
      branch_id: "",
      salary_grade_id: "",
      batch_id: "",
      days_json: [],
    },
  });

  const processCertificates = async (
    certificates: (string | File)[] = []
  ): Promise<string[]> => {
    const processed = await Promise.all(
      certificates.map(async (cert) => {
        if (!cert) return null;

        if (cert instanceof File) {
          const result = await edgestore.publicFiles.upload({
            file: cert,
            options: {
              temporary: false,
            },
          });
          return result.url;
        }
        return cert; // If it's already a string URL, return it directly
      })
    );

    return processed.filter((url): url is string => url !== null);
  };

  const fetchEmployeeData = useCallback(async () => {
    if (!employeeData) return;

    try {
      // Process days_json
      let daysArray: string[] = [];
      if (employeeData.dim_schedules?.[0]?.days_json) {
        try {
          const daysJson = employeeData.dim_schedules[0].days_json;
          daysArray = typeof daysJson === "string" ? JSON.parse(daysJson) : daysJson;
        } catch (error) {
          console.error("Error parsing days_json:", error);
        }
      }

      // Process educational background
      const educationalBg = typeof employeeData.educational_bg_json === "string"
        ? JSON.parse(employeeData.educational_bg_json || "{}")
        : employeeData.educational_bg_json || {};

      // Process family background
      const familyBg = typeof employeeData.family_bg_json === "string"
        ? JSON.parse(employeeData.family_bg_json || "{}")
        : employeeData.family_bg_json || {};

      // Extract certificates as simple arrays of URLs
      const certificates = Array.isArray(educationalBg.certificates) ? educationalBg.certificates : [];
      const mastersCertificates = Array.isArray(educationalBg.mastersCertificates) ? educationalBg.mastersCertificates : [];
      const doctorateCertificates = Array.isArray(educationalBg.doctorateCertificates) ? educationalBg.doctorateCertificates : [];

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
        salary_grade_id: employeeData.salary_grade_id?.toString() || "",
        employement_status_id: employeeData.employement_status_id?.toString() || "",
        ...familyBg,
        ...educationalBg,
        certificates,
        mastersCertificates,
        doctorateCertificates,
        batch_id:
          employeeData.dim_schedules?.[0]?.ref_batch_schedules?.id?.toString() ||
          "",
        days_json: daysArray,
      });
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employee data. Please try again.",
        duration: 5000,
      });
    }
  }, [employeeData, methods, toast]);

  useEffect(() => {
    if (employeeData) {
      fetchEmployeeData();
    }
  }, [employeeData, fetchEmployeeData]);

  const handleFormSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      // Handle picture upload
      let pictureUrl = typeof data.picture === "string" ? data.picture : "";
      if (data.picture instanceof File) {
        const result = await edgestore.publicFiles.upload({
          file: data.picture,
        });
        pictureUrl = result.url;
      }
  
      // Process all certificate types
      const [certificates, mastersCertificates, doctorateCertificates] = await Promise.all([
        processCertificates(data.certificates),
        processCertificates(data.mastersCertificates),
        processCertificates(data.doctorateCertificates),
      ]);

  
      const educationalBackground = {
        elementary: data.elementary,
        highSchool: data.highSchool,
        seniorHighSchool: data.seniorHighSchool,
        seniorHighStrand: data.seniorHighStrand,
        tvlCourse: data.tvlCourse,
        universityCollege: data.universityCollege,
        course: data.course,
        highestDegree: data.highestDegree,
        certificates, // Now just an array of URLs
        masters: data.masters,
        mastersCourse: data.mastersCourse,
        mastersYear: data.mastersYear,
        mastersCertificates, // Now just an array of URLs
        doctorate: data.doctorate,
        doctorateCourse: data.doctorateCourse,
        doctorateYear: data.doctorateYear,
        doctorateCertificates, // Now just an array of URLs
      };
  
      const familyBackground = {
        fathers_first_name: data.fathers_first_name,
        fathers_middle_name: data.fathers_middle_name,
        fathers_last_name: data.fathers_last_name,
        mothers_first_name: data.mothers_first_name,
        mothers_middle_name: data.mothers_middle_name,
        mothers_last_name: data.mothers_last_name,
        guardian_first_name: data.guardian_first_name,
        guardian_middle_name: data.guardian_middle_name,
        guardian_last_name: data.guardian_last_name,
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
        salary_grade_id: parseInt(data.salary_grade_id, 10),
        employement_status_id: parseInt(data.employement_status_id, 10),
        educational_bg_json: JSON.stringify(educationalBackground),
        family_bg_json: JSON.stringify(familyBackground),
        batch_id: parseInt(data.batch_id, 10),
        schedules: [
          {
            batch_id: parseInt(data.batch_id, 10),
            days_json: data.days_json,
          },
        ],
      };
  
      const response = await axios.put(
        `/api/employeemanagement/employees?id=${params.id}`,
        fullData
      );
  
      if (response.status === 200) {
        router.push("/employeemanagement/employees");
        toast({
          title: "Success",
          description: "Employee information successfully updated!",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update employee information. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = async (key: string | number) => {
    let fieldsToValidate: EmployeeFields[] = [];
    const selectedTab = key as string;

    switch (activeTab) {
      case "personal":
        fieldsToValidate = personalFields;
        break;
      case "educational":
        fieldsToValidate = educationalFields;
        break;
      case "job":
        fieldsToValidate = jobFields;
        break;
    }

    const result = await methods.trigger(fieldsToValidate);
    if (result) {
      setActiveTab(selectedTab);
    } else {
      toast({
        title: "Validation Error",
        description:
          "Please check all fields in the current tab before proceeding.",
        variant: "danger",
        duration: 3000,
      });
    }
  };

  if (isFetching) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading employee data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="h-full">
          <Tabs
            aria-label="Employee Information Tabs"
            selectedKey={activeTab}
            onSelectionChange={handleTabChange}
            className="w-full"
          >
            <Tab key="personal" title="Personal Information">
              <div className="w-full bg-white">
                <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-6 pb-16">
                  <EditPersonalInformationForm />
                </div>
              </div>
            </Tab>
            <Tab key="educational" title="Educational Background">
              <div className="w-full bg-white">
                <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-6 pb-16">
                  <EditEducationalBackgroundForm />
                </div>
              </div>
            </Tab>
            <Tab key="job" title="Job Information">
              <div className="w-full bg-white">
                <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-6 pb-16">
                  <div className="space-y-4">
                    <EditJobInformationForm />
                    <div className="pt-2 border-t">
                      <h3 className="text-lg font-medium my-2">
                        Work Schedule
                      </h3>
                      <div className="space-y-2">
                        <EditScheduleSelection />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab>
          </Tabs>
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
            <div className="container px-6 py-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const tabs = ["personal", "educational", "job"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
                disabled={activeTab === "personal"}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {activeTab === "job" ? (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    const jobTabValid = await methods.trigger(jobFields);
                    if (!jobTabValid) {
                      toast({
                        title: "Validation Error",
                        description: "Please check all required fields in the Job Information tab.",
                        variant: "danger",
                        duration: 3000,
                      });
                      return;
                    }

                    try {
                      setIsSubmitting(true);
                      await handleFormSubmit(methods.getValues());
                    } catch (error) {
                      console.error("Submission error:", error);
                      toast({
                        title: "Error",
                        description: "Failed to update employee information. Please try again.",
                        variant: "danger",
                        duration: 3000,
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? "Updating..." : "Update Employee"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={async () => {
                    const currentFields =
                      activeTab === "personal"
                        ? personalFields
                        : activeTab === "educational"
                        ? educationalFields
                        : jobFields;

                    const isValid = await methods.trigger(currentFields);
                    if (isValid) {
                      const tabs = ["personal", "educational", "job"];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    } else {
                      toast({
                        title: "Validation Error",
                        description: "Please complete all required fields before proceeding.",
                        variant: "danger",
                        duration: 3000,
                      });
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}