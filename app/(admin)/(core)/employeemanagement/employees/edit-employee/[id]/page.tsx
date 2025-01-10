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
import { mutate } from "swr";
import { toGMT8 } from "@/lib/utils/toGMT8";
import ScheduleHistory from "@/components/admin/employeescomponent/update/ScheduleHistory";
import { Employee } from "@/types/employeee/EmployeeType";
import EditTrainingSeminars from "@/components/admin/employeescomponent/update/EditTrainingSeminars";

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
  training: [
    "training_type",
    "training_title",
    "training_description",
    "training_venue",
    "training_conductor",
    "training_date",
    "training_start_time",
    "training_end_time",
    "training_region",
    "training_province",
    "training_municipal",
    "training_baranggay",
    "training_certificates",
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
      privilege_id: "", // Add this
      batch_id: "",
      days_json: [],
      training_type: "",
      training_title: "",
      training_description: "",
      training_venue: "",
      training_conductor: "",
      training_startDate: "",
      training_endDate: "",
      trainingDuration: 0,
      trainingDurationType: "",
      training_region: "",
      training_province: "",
      training_municipal: "",
      training_baranggay: "",
      training_certificates: [],
    },
  });

  const validateCurrentTab = async (tabKey: string): Promise<boolean> => {
    const fieldsToValidate =
      tabFieldsMap[tabKey as keyof typeof tabFieldsMap] || [];
    return await methods.trigger(fieldsToValidate);
  };

  const handleTabChange = async (newTab: string) => {
    const tabs = ["personal", "educational", "training", "job", "account"];
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

  const currentEmployee = employeeData as Employee | undefined;

  const handleFormSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);

    try {
      toast({
        title: "Updating",
        description: "Updating employee information...",
      });

      // Handle picture upload
      let pictureUrl = typeof data.picture === "string" ? data.picture : "";
      if (data.picture instanceof File) {
        const result = await edgestore.publicFiles.upload({
          file: data.picture,
          options: { temporary: false },
        });
        pictureUrl = result.url;
      }

      const handleDate = (dateString: string | null) => {
        if (!dateString) return null;

        const date = new Date(dateString);
        const gmt8Date = toGMT8(date)
          .hour(12)
          .minute(0)
          .second(0)
          .millisecond(0);

        return gmt8Date.toISOString();
      };

      // Process all certificates in parallel
      const [certificates, mastersCertificates, doctorateCertificates] =
        await Promise.all([
          processCertificates(data.certificates),
          processCertificates(data.mastersCertificates),
          processCertificates(data.doctorateCertificates),
        ]);

      const currentDays = currentEmployee?.dim_schedules?.[0]?.days_json;
      const normalizedCurrentDays: string[] = currentDays
        ? typeof currentDays === "string"
          ? JSON.parse(currentDays)
          : currentDays
        : [];

      const normalizedNewDays = [...data.days_json].sort();
      const normalizedOldDays = [...normalizedCurrentDays].sort();

      const currentBatchId: string =
        currentEmployee?.dim_schedules?.[0]?.ref_batch_schedules?.id?.toString() ||
        "";
      const trainingData = (data.trainings || []).map((training) => ({
        type: training.training_type || "",
        title: training.training_title || "",
        description: training.training_description || "",
        venue: training.training_venue || "",
        conductor: training.training_conductor || "",
        start_date: training.training_startDate
          ? handleDate(training.training_startDate)
          : null,
        end_date: training.training_endDate
          ? handleDate(training.training_endDate)
          : null,
        duration: training.trainingDuration
          ? Number(training.trainingDuration)
          : null,
        durationType: training.trainingDurationType || null,
        address: {
          addr_region: training.training_region
            ? Number(training.training_region)
            : null,
          addr_province: training.training_province
            ? Number(training.training_province)
            : null,
          addr_municipal: training.training_municipal
            ? Number(training.training_municipal)
            : null,
          addr_baranggay: training.training_baranggay
            ? Number(training.training_baranggay)
            : null,
        },
        certificates: training.training_certificates || [],
      }));

      const hasScheduleChanged: boolean =
        data.batch_id !== currentBatchId ||
        JSON.stringify(normalizedNewDays) !== JSON.stringify(normalizedOldDays);
      // Prepare employee data - similar structure to upsert endpoint
      const employeeData = {
        // Basic Information
        prefix: data.prefix,
        picture: pictureUrl,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        suffix: data.suffix,
        extension: data.extension,
        gender: data.gender,
        email: data.email,
        contact_no: data.contact_no,
        birthdate: handleDate(data.birthdate),
        hired_at: handleDate(data.hired_at),
        addr_region: parseInt(data.addr_region, 10),
        addr_province: parseInt(data.addr_province, 10),
        addr_municipal: parseInt(data.addr_municipal, 10),
        addr_baranggay: parseInt(data.addr_baranggay, 10),
        educational_bg_json: JSON.stringify({
          elementary: data.elementary,
          highSchool: data.highSchool,
          seniorHighSchool: data.seniorHighSchool,
          seniorHighStrand: data.seniorHighStrand,
          tvlCourse: data.tvlCourse,
          universityCollege: data.universityCollege,
          course: data.course,
          highestDegree: data.highestDegree,
          certificates: certificates,
          mastersCertificates: mastersCertificates,
          doctorateCertificates: doctorateCertificates,
          masters: data.masters,
          mastersCourse: data.mastersCourse,
          mastersYear: data.mastersYear,

          doctorate: data.doctorate,
          doctorateCourse: data.doctorateCourse,
          doctorateYear: data.doctorateYear,
        }),
        training_programs_attended_json: JSON.stringify(trainingData),
        family_bg_json: JSON.stringify({
          fathers_first_name: data.fathers_first_name,
          fathers_middle_name: data.fathers_middle_name,
          fathers_last_name: data.fathers_last_name,
          mothers_first_name: data.mothers_first_name,
          mothers_middle_name: data.mothers_middle_name,
          mothers_last_name: data.mothers_last_name,
          guardian_first_name: data.guardian_first_name,
          guardian_middle_name: data.guardian_middle_name,
          guardian_last_name: data.guardian_last_name,
        }),
        department_id: parseInt(data.department_id, 10),
        job_id: parseInt(data.job_id, 10),
        employement_status_id: parseInt(data.employement_status_id, 10),
        branch_id: parseInt(data.branch_id, 10),
        salary_grade_id: parseInt(data.salary_grade_id, 10),
        batch_id: parseInt(data.batch_id, 10),
        privilege_id: parseInt(data.privilege_id, 10),
        schedules: hasScheduleChanged
          ? [
              {
                days_json: data.days_json,
                batch_id: parseInt(data.batch_id, 10),
              },
            ]
          : undefined,
      };

      const response = await axios.put(
        `/api/employeemanagement/employees?id=${params.id}`,
        employeeData
      );

      if (response.status === 200) {
        mutate(
          `/api/employeemanagement/employees?id=${params.id}`,
          response.data
        );
        router.push("/employeemanagement/employees");
        toast({
          title: "Success",
          description: "Employee information updated successfully!",
          duration: 3000,
        });
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred";

      if (!navigator.onLine) {
        errorMessage = "Please check your internet connection and try again";
      } else if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || "Failed to upsert employee";

        if (error.code === "ECONNABORTED") {
          errorMessage = "Request timed out. Please try again";
        } else if (error.response?.status === 409) {
          errorMessage = "Username or email already exists";
        } else if (error.response?.status === 500) {
          errorMessage = "Server error. Please try again later";
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
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
      // Get schedule data
      const currentSchedule = employeeData.dim_schedules?.find(
        (schedule) => !schedule.end_date
      );
      let daysArray: string[] = [];
      if (currentSchedule?.days_json) {
        try {
          daysArray =
            typeof currentSchedule.days_json === "string"
              ? JSON.parse(currentSchedule.days_json)
              : currentSchedule.days_json;
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

      const trainingBg =
        typeof employeeData.training_programs_attended_json === "string"
          ? JSON.parse(employeeData.training_programs_attended_json || "[]")
          : employeeData.training_programs_attended_json || [];

      // Process certificates
      const certificates = educationalBg.certificates || [];
      const mastersCertificates = educationalBg.mastersCertificates || [];
      const doctorateCertificates = educationalBg.doctorateCertificates || [];

      // Get batch schedule
      const currentBatchId =
        currentSchedule?.ref_batch_schedules?.id?.toString() || "";

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
          ? toGMT8(employeeData.birthdate).toISOString().split("T")[0]
          : "",
        hired_at: employeeData.hired_at
          ? toGMT8(employeeData.hired_at).toISOString().split("T")[0]
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
        privilege_id: employeeData.acl_user_access_control?.privilege_id || "",
        batch_id: currentBatchId,
        days_json: daysArray,

        trainings: trainingBg.map((training: any) => ({
          training_type: training.type || "",
          training_title: training.title || "",
          training_description: training.description || "",
          training_venue: training.venue || "",
          training_conductor: training.conductor || "",
          training_startDate: training.start_date
            ? toGMT8(training.start_date).toISOString().split("T")[0]
            : "",
          training_endDate: training.end_date
            ? toGMT8(training.end_date).toISOString().split("T")[0]
            : "",
          trainingDuration: training.duration || 0,
          trainingDurationType: training.durationType || "",
          training_region: training.address?.addr_region?.toString() || "",
          training_province: training.address?.addr_province?.toString() || "",
          training_municipal:
            training.address?.addr_municipal?.toString() || "",
          training_baranggay:
            training.address?.addr_baranggay?.toString() || "",
          training_certificates: training.certificates || [],
        })),
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

            <Tab key="training" title="Training & Seminars">
              <div className="w-full bg-white">
                <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-6 pb-16">
                  <EditTrainingSeminars />
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
                      <div className="space-y-2 pb-6">
                        <EditScheduleSelection employeeId={params.id} />
                      </div>
                      <div className="pt-2 border-t">
                        <ScheduleHistory employeeId={params.id} />
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
                    onPress={() => handleTabChange("educational")}
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
                      onPress={() => handleTabChange("personal")}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      color="primary"
                      onPress={() => handleTabChange("training")}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {activeTab === "training" && (
                  <>
                    <Button
                      type="button"
                      variant="bordered"
                      onPress={() => handleTabChange("educational")}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      color="primary"
                      onPress={() => handleTabChange("job")}
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
                      onPress={() => handleTabChange("training")}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      color="primary"
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      onPress={async () => {
                        const isValid = await methods.trigger();
                        if (isValid) {
                          methods.handleSubmit(handleFormSubmit)();
                        } else {
                          toast({
                            title: "Validation Error",
                            description: "Please fill in all required fields.",
                            variant: "danger",
                            duration: 3000,
                          });
                        }
                      }}
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
