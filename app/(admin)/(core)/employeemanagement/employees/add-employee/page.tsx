"use client";
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeFormData } from "./schema";
import { useToast } from "@/components/ui/use-toast";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { mutate } from "swr";
import { useRouter } from "next/navigation";
import AddAccount from "@/components/admin/employeescomponent/store/AddAccount";
import EducationalBackgroundForm from "@/components/admin/employeescomponent/store/EducationalBackgroundForm";
import JobInformationForm from "@/components/admin/employeescomponent/store/JobInformation";
import PersonalInformationForm from "@/components/admin/employeescomponent/store/PersonalInformationForm";
import ScheduleSelection from "@/components/admin/employeescomponent/store/ScheduleSelection";
import { Tabs, Tab } from "@nextui-org/react";
import { ChevronRight, ChevronLeft } from "lucide-react";

type EmployeeFields = keyof EmployeeFormData;

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
  "is_regular",
  "branch_id",
  "batch_id",
  "days_json",
];

const accountFields: EmployeeFields[] = ["username", "password"];

export default function AddEmployeePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { edgestore } = useEdgeStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");

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
      is_regular: false,
      department_id: "",
      job_id: "",
      branch_id: "",
      batch_id: "",
      days_json: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      username: "",
      password: "password",
    },
    mode: "onChange",
  });

  const handleNext = async () => {
    let fieldsToValidate: EmployeeFields[] = [];

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
      case "account":
        fieldsToValidate = accountFields;
        break;
    }

    const result = await methods.trigger(fieldsToValidate);

    if (result) {
      const tabs = ["personal", "educational", "job", "account"];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    } else {
      toast({
        title: "Validation Error",
        variant: "danger",
        description: "Please check the fields before proceeding.",
        duration: 3000,
      });
    }
  };

  const handleFormSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting",
      description: "Adding new employee...",
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
        (data.certificates || []).map(async (cert) => {
          if (!cert) return null;
          if (cert.url instanceof File) {
            const result = await edgestore.publicFiles.upload({
              file: cert.url,
              options: { temporary: false },
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
                cert.fileName || cert.name || result.url.split("/").pop() || "",
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
                cert.fileName || cert.name || result.url.split("/").pop() || "",
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

      let accountResponse;
      try {
        accountResponse = await axios.post(
          "/api/employeemanagement/employees/create-with-credentials",
          {
            employee: {
              first_name: data.first_name,
              email: data.email,
            },
            credentials: {
              username: data.username,
              password: data.password,
            },
          }
        );
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to create user account"
          : "Failed to create user account";
        throw new Error(errorMessage);
      }

      if (accountResponse.status !== 201 || !accountResponse.data.userId) {
        throw new Error("Failed to create user account - no user ID returned");
      }

      const fullData = {
        user_id: accountResponse.data.userId,
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
        family_bg_json: JSON.stringify(familyBackground),
        department_id: parseInt(data.department_id, 10),
        job_id: parseInt(data.job_id, 10),
        is_regular: Boolean(data.is_regular),
        branch_id: parseInt(data.branch_id, 10),
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
        fullData
      );

      if (response.status === 201) {
        router.push("/employeemanagement/employees");
        toast({
          title: "Success",
          description: "Employee added and credentials sent to their email!",
          duration: 3000,
        });
        mutate("/api/employeemanagement/employees");
      }
    } catch (error) {
      console.error("Error:", error);
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to create employee",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description:
            (error as Error).message || "An unexpected error occurred",
          duration: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <Tabs
        aria-label="Employee Information Tabs"
        selectedKey={activeTab}
        onSelectionChange={async (key) => {
          const selectedTab = key as string;
          let fieldsToValidate: EmployeeFields[] = [];

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
            case "account":
              fieldsToValidate = accountFields;
              break;
          }

          const result = await methods.trigger(fieldsToValidate);
          if (result) {
            setActiveTab(selectedTab);
          } else {
            // Display an error message or prevent the tab change
            toast({
              title: "Validation Error",
              variant: "danger",
              description:
                "Please check the fields on the current tab before proceeding.",
              duration: 3000,
            });
          }
        }}
        className="w-full"
      >
        <Tab key="personal" title="Personal Information">
          <div className="w-full bg-white">
            <Form {...methods}>
              <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
                <FormProvider {...methods}>
                  <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-6 pb-16">
                    <PersonalInformationForm />
                  </div>
                </FormProvider>
              </form>
            </Form>
          </div>
        </Tab>

        <Tab key="educational" title="Educational Background">
          <div className="w-full bg-white">
            <Form {...methods}>
              <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
                <FormProvider {...methods}>
                  <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-6 pb-16">
                    <EducationalBackgroundForm />
                  </div>
                </FormProvider>
              </form>
            </Form>
          </div>
        </Tab>

        <Tab key="job" title="Job Information">
          <div className="w-full bg-white">
            <Form {...methods}>
              <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
                <FormProvider {...methods}>
                  <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-6 pb-16">
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
                  </div>
                </FormProvider>
              </form>
            </Form>
          </div>
        </Tab>

        <Tab key="account" title="Account">
          <div className="w-full bg-white">
            <Form {...methods}>
              <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
                <FormProvider {...methods}>
                  <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 py-6 pb-16">
                    <AddAccount userId="" email={methods.watch("email")} />
                  </div>
                </FormProvider>
              </form>
            </Form>
          </div>
        </Tab>
      </Tabs>

      <div className="fixed bottom-0 left-0 right-0">
        <div className="px-6 py-4 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const tabs = ["personal", "educational", "job", "account"];
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

          {activeTab === "account" ? (
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={async (e) => {
                e.preventDefault();
                const result = await methods.trigger();
                if (result) {
                  methods.handleSubmit(handleFormSubmit)();
                }
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
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
