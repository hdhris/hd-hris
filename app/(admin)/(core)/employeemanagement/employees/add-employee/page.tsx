"use client";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeFormData } from "./schema";
import { useToast } from "@/components/ui/use-toast";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { Form } from "@/components/ui/form";
import axios, { AxiosError } from "axios";
import { mutate } from "swr";
import { useRouter } from "next/navigation";
import AddAccount from "@/components/admin/employeescomponent/store/AddAccount";
import EducationalBackgroundForm from "@/components/admin/employeescomponent/store/EducationalBackgroundForm";
import JobInformationForm from "@/components/admin/employeescomponent/store/JobInformation";
import PersonalInformationForm from "@/components/admin/employeescomponent/store/PersonalInformationForm";
import ScheduleSelection from "@/components/admin/employeescomponent/store/ScheduleSelection";
import { Tabs, Tab, Spinner, Button } from "@nextui-org/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toGMT8 } from "@/lib/utils/toGMT8";

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
  account: ["username", "password", "privilege_id"] as EmployeeFields[],
};

export default function AddEmployeePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { edgestore } = useEdgeStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");

  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
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
      masters: "",
      mastersCourse: "",
      mastersYear: "",
      mastersCertificates: [],
      doctorate: "",
      doctorateCourse: "",
      doctorateYear: "",
      doctorateCertificates: [],
      hired_at: new Date().toISOString(),
      employement_status_id: "",
      department_id: "",
      job_id: "",
      branch_id: "",
      salary_grade_id: "",
      batch_id: "",
      days_json: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      username: "",
      password: "password",
      privilege_id: "",
    },
    mode: "onChange",
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

  const uploadFile = async (
    file: File
  ): Promise<{ fileName: string; fileUrl: string }> => {
    const result = await edgestore.publicFiles.upload({
      file,
      options: { temporary: false },
    });
    const fileName = result.url.split("/").pop() || "";
    return {
      fileName,
      fileUrl: result.url,
    };
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
    try {
      setIsSubmitting(true);
      toast({
        title: "Submitting",
        description: "Adding new employee...",
      });

      let pictureUrl = typeof data.picture === "string" ? data.picture : "";
      if (data.picture instanceof File) {
        const result = await uploadFile(data.picture);
        pictureUrl = result.fileUrl;
      }
      //handledate
      const handleDate = (dateString: string | null) => {
        if (!dateString) return null;

        // Create a date object and set it to noon GMT+8
        const date = new Date(dateString);
        const gmt8Date = toGMT8(date)
          .hour(12)
          .minute(0)
          .second(0)
          .millisecond(0);

        return gmt8Date.toISOString();
      };

      const [filteredCertificates, mastersCertificates, doctorateCertificates] =
        await Promise.all([
          processCertificates(data.certificates),
          processCertificates(data.mastersCertificates),
          processCertificates(data.doctorateCertificates),
        ]);

      const employeeData = {
        employee: {
          first_name: data.first_name,
          email: data.email,
        },
        credentials: {
          username: data.username,
          password: data.password,
          privilege_id: data.privilege_id,
        },
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
          certificates: filteredCertificates,
          mastersCertificates: mastersCertificates,
          doctorateCertificates: doctorateCertificates,
          masters: data.masters,
          mastersCourse: data.mastersCourse,
          mastersYear: data.mastersYear,

          doctorate: data.doctorate,
          doctorateCourse: data.doctorateCourse,
          doctorateYear: data.doctorateYear,
        }),
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
        schedules: [
          {
            days_json: data.days_json,
            batch_id: parseInt(data.batch_id, 10),
          },
        ],
      };

      const response = await axios.post(
        "/api/employeemanagement/employees",
        employeeData
      );

      if (response.status === 201) {
        router.push("/employeemanagement/employees");
        toast({
          title: "Success",
          description: "Employee added successfully!",
          duration: 3000,
        });
        mutate("/api/employeemanagement/employees");
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred";

      if (!navigator.onLine) {
        errorMessage = "Please check your internet connection and try again";
      } else if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || "Failed to create employee";

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

  const renderTabContent = (tabKey: string) => {
    return (
      <div className="w-full bg-white">
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
            <FormProvider {...methods}>
              <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-6 pb-16">
                {tabKey === "personal" && (
                  <>
                    <PersonalInformationForm />
                  </>
                )}
                {tabKey === "educational" && (
                  <>
                    <EducationalBackgroundForm />
                  </>
                )}
                {tabKey === "job" && (
                  <div className="space-y-4">
                    <JobInformationForm />
                    <div className="pt-2 border-t">
                      <h3 className="text-lg font-medium my-2">
                        Work Schedule
                      </h3>
                      <div className="space-y-2">
                        <ScheduleSelection />
                      </div>
                    </div>
                  </div>
                )}
                {tabKey === "account" && (
                  <AddAccount userId="" email={methods.watch("email")} />
                )}
              </div>
            </FormProvider>
          </form>
        </Form>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full">
      <Tabs
        aria-label="Employee Information Tabs"
        selectedKey={activeTab}
        onSelectionChange={(key) => handleTabChange(key as string)}
        className="w-full"
      >
        <Tab key="personal" title="Personal Information">
          {renderTabContent("personal")}
        </Tab>
        <Tab key="educational" title="Educational Background">
          {renderTabContent("educational")}
        </Tab>
        <Tab key="job" title="Job Information">
          {renderTabContent("job")}
        </Tab>
        <Tab key="account" title="Account">
          {renderTabContent("account")}
        </Tab>
      </Tabs>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="container px-6 py-4 flex justify-end items-center gap-4">
          <Button
            type="button"
            variant="bordered"
            onPress={handlePrevious}
            disabled={activeTab === "personal"}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {activeTab === "account" ? (
            <Button
              type="submit"
              color="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              onPress={async (e) => {
                //removing preventDefault
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
              {isSubmitting ? "Submitting" : "Submit"}
            </Button>
          ) : (
            <Button
              type="button"
              color="primary"
              onPress={handleNext}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
