// edit-employee/[id]/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeFormData } from "../schema";
import { useToast } from "@/components/ui/use-toast";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { Form } from "@/components/ui/form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Tabs, Tab, Spinner, Button } from "@nextui-org/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useEmployeeData } from "@/services/queries";
import EditPersonalInformationForm from "@/components/admin/employeescomponent/update/EditPersonalInformationForm";
import EditEducationalBackgroundForm from "@/components/admin/employeescomponent/update/EditEducationalBackgroundForm";
import EditJobInformationForm from "@/components/admin/employeescomponent/update/EditJobInformationForm";
import EditScheduleSelection from "@/components/admin/employeescomponent/update/EditScheduleSelection";
import EditAccountForm from "@/components/admin/employeescomponent/update/EditAccount";

type EmployeeFields = keyof EmployeeFormData;

const tabFieldsMap = {
  personal: [
    "prefix",
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
    "picture",
  ] as EmployeeFields[],
  educational: [
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
  ] as EmployeeFields[],
  job: [
    "hired_at",
    "department_id",
    "job_id",
    "employement_status_id",
    "branch_id",
    "salary_grade_id",
    "batch_id",
    "days_json",
  ] as EmployeeFields[],
};

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
  const { data: employeeData, isLoading: isFetching } = useEmployeeData(
    params.id
  );

  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    mode: "onChange",
    defaultValues: {
      prefix: "",
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

  const validateCurrentTab = async (tabKey: string): Promise<boolean> => {
    const fieldsToValidate =
      tabFieldsMap[tabKey as keyof typeof tabFieldsMap] || [];
    return await methods.trigger(fieldsToValidate);
  };

  const handleTabChange = async (newTab: string) => {
    const tabs = ["personal", "educational", "job", "account"];
    const currentIndex = tabs.indexOf(activeTab);
    const newIndex = tabs.indexOf(newTab);

    if (newIndex > currentIndex) {
      const isValid = await validateCurrentTab(activeTab);
      if (!isValid) {
        toast({
          title: "Validation Error",
          variant: "danger",
          description: "Please fill in all required fields before proceeding.",
          duration: 3000,
        });
        return;
      }
    }

    setActiveTab(newTab);
  };

  const handleNext = async () => {
    const tabs = ["personal", "educational", "job", "account"];
    const currentIndex = tabs.indexOf(activeTab);

    const isValid = await validateCurrentTab(activeTab);
    if (isValid && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (!isValid) {
      toast({
        title: "Validation Error",
        variant: "danger",
        description: "Please fill in all required fields before proceeding.",
        duration: 3000,
      });
    }
  };

  const handlePrevious = () => {
    const tabs = ["personal", "educational", "job", "account"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

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
        return cert;
      })
    );

    return processed.filter((url): url is string => url !== null);
  };

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

      // Process all certificates in parallel
      const [certificates, mastersCertificates, doctorateCertificates] =
        await Promise.all([
          processCertificates(data.certificates),
          processCertificates(data.mastersCertificates),
          processCertificates(data.doctorateCertificates),
        ]);

      // Prepare schedule data
      const schedules = data.batch_id
        ? [
            {
              batch_id: parseInt(data.batch_id),
              days_json: Array.isArray(data.days_json) ? data.days_json : [],
            },
          ]
        : [];

      // Prepare the main employee update data
      const employeeData = {
        picture: pictureUrl,
        prefix: data.prefix,
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

        educational_bg_json: {
          elementary: data.elementary,
          highSchool: data.highSchool,
          seniorHighSchool: data.seniorHighSchool,
          seniorHighStrand: data.seniorHighStrand,
          tvlCourse: data.tvlCourse,
          universityCollege: data.universityCollege,
          course: data.course,
          highestDegree: data.highestDegree,
          certificates,
          masters: data.masters,
          mastersCourse: data.mastersCourse,
          mastersYear: data.mastersYear,
          mastersCertificates,
          doctorate: data.doctorate,
          doctorateCourse: data.doctorateCourse,
          doctorateYear: data.doctorateYear,
          doctorateCertificates,
        },

        family_bg_json: {
          fathers_first_name: data.fathers_first_name,
          fathers_middle_name: data.fathers_middle_name,
          fathers_last_name: data.fathers_last_name,
          mothers_first_name: data.mothers_first_name,
          mothers_middle_name: data.mothers_middle_name,
          mothers_last_name: data.mothers_last_name,
          guardian_first_name: data.guardian_first_name,
          guardian_middle_name: data.guardian_middle_name,
          guardian_last_name: data.guardian_last_name,
        },

        // Add reference connections for valid IDs
        ...(data.branch_id && {
          ref_branches: { connect: { id: parseInt(data.branch_id) } },
        }),

        ...(data.privilege_id && {
          sys_privileges: { connect: { id: parseInt(data.privilege_id) } },
        }),
        ...(data.department_id && {
          ref_departments: { connect: { id: parseInt(data.department_id) } },
        }),
        ...(data.job_id && {
          ref_job_classes: { connect: { id: parseInt(data.job_id) } },
        }),
        ...(data.employement_status_id && {
          ref_employment_status: {
            connect: { id: parseInt(data.employement_status_id) },
          },
        }),
        ...(data.salary_grade_id && {
          ref_salary_grades: {
            connect: { id: parseInt(data.salary_grade_id) },
          },
        }),
        ...(data.addr_region && {
          ref_addresses_trans_employees_addr_regionToref_addresses: {
            connect: { id: parseInt(data.addr_region) },
          },
        }),
        ...(data.addr_province && {
          ref_addresses_trans_employees_addr_provinceToref_addresses: {
            connect: { id: parseInt(data.addr_province) },
          },
        }),
        ...(data.addr_municipal && {
          ref_addresses_trans_employees_addr_municipalToref_addresses: {
            connect: { id: parseInt(data.addr_municipal) },
          },
        }),
        ...(data.addr_baranggay && {
          ref_addresses_trans_employees_addr_baranggayToref_addresses: {
            connect: { id: parseInt(data.addr_baranggay) },
          },
        }),

        // Include schedules array
        schedules,
      };

      // First update employee data
      const employeeUpdateResponse = await axios.put(
        `/api/employeemanagement/employees?id=${params.id}`,
        employeeData
      );

      if (employeeUpdateResponse.status === 200) {
        router.push("/employeemanagement/employees");
        toast({
          title: "Success",
          description: "Employee information updated successfully!",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update employee",
        variant: "danger",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchEmployeeData = useCallback(async () => {
    if (!employeeData) return;

    try {
      const accountData = employeeData.userAccount?.auth_credentials || null;
      const privilegeData = employeeData.acl_user_access_control || null;
  
      // Log to check if we're getting the privilege data
      // console.log("Privilege Data:", privilegeData);
  

      let daysArray: string[] = [];
      if (employeeData.dim_schedules?.[0]?.days_json) {
        try {
          const daysJson = employeeData.dim_schedules[0].days_json;
          daysArray =
            typeof daysJson === "string" ? JSON.parse(daysJson) : daysJson;
        } catch (error) {
          console.error("Error parsing days_json:", error);
        }
      }

      // Process educational background
      const educationalBg =
        typeof employeeData.educational_bg_json === "string"
          ? JSON.parse(employeeData.educational_bg_json || "{}")
          : employeeData.educational_bg_json || {};

      // Process family background
      const familyBg =
        typeof employeeData.family_bg_json === "string"
          ? JSON.parse(employeeData.family_bg_json || "{}")
          : employeeData.family_bg_json || {};

      // Process certificates
      const certificates = educationalBg.certificates || [];
      const mastersCertificates = educationalBg.mastersCertificates || [];
      const doctorateCertificates = educationalBg.doctorateCertificates || [];

      // Get batch schedule
      const batchId =
        employeeData.dim_schedules?.[0]?.ref_batch_schedules?.id?.toString() ||
        "";

      // Get user account data
      const userAccount = employeeData.userAccount;

      // Reset form with all data
      methods.reset({
        picture: employeeData.picture || "",
        prefix: employeeData.prefix || "",
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
        employement_status_id:
          employeeData.employement_status_id?.toString() || "",
        // Educational background
        elementary: educationalBg.elementary || "",
        highSchool: educationalBg.highSchool || "",
        seniorHighSchool: educationalBg.seniorHighSchool || "",
        seniorHighStrand: educationalBg.seniorHighStrand || "",
        tvlCourse: educationalBg.tvlCourse || "",
        universityCollege: educationalBg.universityCollege || "",
        course: educationalBg.course || "",
        highestDegree: educationalBg.highestDegree || "",
        certificates: certificates,
        masters: educationalBg.masters || "",
        mastersCourse: educationalBg.mastersCourse || "",
        mastersYear: educationalBg.mastersYear || "",
        mastersCertificates: mastersCertificates,
        doctorate: educationalBg.doctorate || "",
        doctorateCourse: educationalBg.doctorateCourse || "",
        doctorateYear: educationalBg.doctorateYear || "",
        doctorateCertificates: doctorateCertificates,
        // Family background
        fathers_first_name: familyBg.fathers_first_name || "",
        fathers_middle_name: familyBg.fathers_middle_name || "",
        fathers_last_name: familyBg.fathers_last_name || "",
        mothers_first_name: familyBg.mothers_first_name || "",
        mothers_middle_name: familyBg.mothers_middle_name || "",
        mothers_last_name: familyBg.mothers_last_name || "",
        guardian_first_name: familyBg.guardian_first_name || "",
        guardian_middle_name: familyBg.guardian_middle_name || "",
        guardian_last_name: familyBg.guardian_last_name || "",
        // Schedule
        batch_id: batchId,
        days_json: daysArray,
        // Account
        privilege_id: privilegeData?.privilege_id?.toString() || "",
        username: accountData?.username || "",
      } as EmployeeFormData);
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

  if (isFetching) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleFormSubmit)}
          className="h-full"
        >
          <Tabs
            aria-label="Employee Information Tabs"
            selectedKey={activeTab}
            onSelectionChange={(key) => handleTabChange(key as string)}
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

            <Tab key="account" title="Account">
              <div className="w-full bg-white">
                <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-6 pb-16">
                  <EditAccountForm
                    userId={params.id}
                    email={employeeData?.email || ""}
                    hasAccount={
                      !!employeeData?.userAccount?.auth_credentials?.username
                    }
                    currentPrivilegeId={employeeData?.acl_user_access_control?.privilege_id || ""}
                  />
                </div>
              </div>
            </Tab>
          </Tabs>

          {activeTab !== "account" && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
              <div className="container px-6 py-4 flex justify-end items-center gap-4">
                {activeTab === "personal" && (
                  <Button
                    type="button"
                    color="primary"
                    onClick={() => handleTabChange("educational")}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                {activeTab === "educational" && (
                  <>
                    <Button
                      type="button"
                      variant="bordered"
                      onClick={() => handleTabChange("personal")}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      color="primary"
                      onClick={() => handleTabChange("job")}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {activeTab === "job" && (
                  <>
                    <Button
                      type="button"
                      variant="bordered"
                      onClick={() => handleTabChange("educational")}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      isLoading={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting ? "Updating..." : "Update Employee"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
}
