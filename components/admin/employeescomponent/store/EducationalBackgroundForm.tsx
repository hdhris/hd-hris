"use client";

import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { SharedSelection } from "@nextui-org/react";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { FileState, FileDropzone } from "@/components/ui/fileupload/file";
import { Divider } from "@nextui-org/react";
import Text from "@/components/Text";

const EducationalBackgroundForm = () => {
  const { watch, setValue } = useFormContext();
  const [showStrand, setShowStrand] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const [showMastersCertificates, setShowMastersCertificates] = useState(false);
  const [showDoctoratesCertificates, setShowDoctoratesCertificates] =
    useState(false);
  const [basicFileStates, setBasicFileStates] = useState<FileState[]>([]);
  const [mastersFileStates, setMastersFileStates] = useState<FileState[]>([]);
  const [doctorateFileStates, setDoctorateFileStates] = useState<FileState[]>(
    []
  );
  const { edgestore } = useEdgeStore();
  const [select, setSelect] = useState<string>("");

  // Watch form fields
  const elementary = watch("elementary");
  const highSchool = watch("highSchool");
  const seniorHighSchool = watch("seniorHighSchool");
  const universityCollege = watch("universityCollege");
  const masters = watch("masters");
  const doctorate = watch("doctorate");

  useEffect(() => {
    setShowStrand(!!seniorHighSchool);
  }, [seniorHighSchool]);

  useEffect(() => {
    setShowCourse(!!universityCollege);
  }, [universityCollege]);

  useEffect(() => {
    setShowMastersCertificates(!!masters);
  }, [masters]);

  useEffect(() => {
    setShowDoctoratesCertificates(!!doctorate);
  }, [doctorate]);

  useEffect(() => {
    let highestDegree = "Nothing Input";
    if (elementary) highestDegree = "Elementary";
    if (highSchool) highestDegree = "High School";
    if (seniorHighSchool) highestDegree = "Senior High School";
    if (universityCollege) highestDegree = "University/College";
    if (masters) highestDegree = "Masters";
    if (doctorate) highestDegree = "Doctorate";
    setValue("highestDegree", highestDegree);
  }, [
    elementary,
    highSchool,
    seniorHighSchool,
    universityCollege,
    masters,
    doctorate,
    setValue,
  ]);

  function updateFileProgress(
    key: string,
    progress: FileState["progress"],
    fileType: "basic" | "masters" | "doctorate"
  ) {
    const setFileStates = {
      basic: setBasicFileStates,
      masters: setMastersFileStates,
      doctorate: setDoctorateFileStates,
    }[fileType];

    setFileStates((currentFileStates) => {
      const newFileStates = structuredClone(currentFileStates);
      const fileState = newFileStates.find(
        (fileState) => fileState.key === key
      );
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }

  const handleSelect = (key: SharedSelection) => {
    if (key.anchorKey === "tvl") {
      setSelect(key as string);
    }
  };

  const formFields: FormInputProps[] = [
    {
      name: "elementary",
      label: "Elementary",
      type: "text",
      placeholder: "Enter Elementary School",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "highSchool",
      label: "High School",
      type: "text",
      placeholder: "Enter High School",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "seniorHighSchool",
      label: "Senior High School",
      type: "text",
      placeholder: "Enter Senior High School",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "seniorHighStrand",
      label: "Senior High School Strand",
      type: "auto-complete",
      isVisible: showStrand,
      placeholder: "Select Strand",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
        options: [
          { value: "HUMSS", label: "HUMSS" },
          { value: "ABM", label: "ABM" },
          { value: "STEM", label: "STEM" },
          { value: "GAS", label: "GAS" },
          { value: "TVL", label: "TVL" },
        ],
        onSelectionChange: handleSelect,
      },
    },
    {
      name: "tvlCourse",
      label: "TVL Course",
      type: "text",
      isVisible: select === "tvl",
      placeholder: "Enter TVL Course",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "universityCollege",
      label: "University/College",
      type: "text",
      placeholder: "Enter University/College",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "course",
      label: "Course",
      type: "text",
      isVisible: showCourse,
      placeholder: "Enter Course",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "masters",
      label: "Masters",
      type: "text",
      placeholder: "Enter Masters Institution",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "mastersCourse",
      label: "Masters Course",
      type: "text",
      isVisible: !!masters,
      placeholder: "Enter Masters Course",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "mastersYear",
      label: "Masters Graduated Academic Year",
      type: "text",
      isVisible: !!masters,
      placeholder: "Enter Year (e.g., 2021-2022)",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    // {
    //   name: "mastersStartDate",
    //   label: "Masters Start Date",
    //   type: "date",
    //   isVisible: !!masters,
    //   config: {
    //     variant: "bordered",
    //     labelPlacement: "outside",
    //   },
    // },
    // {
    //   name: "mastersEndDate",
    //   label: "Masters End Date",
    //   type: "date",
    //   isVisible: !!masters,
    //   config: {
    //     variant: "bordered",
    //     labelPlacement: "outside",
    //   },
    // },
    {
      name: "doctorate",
      label: "Doctorate",
      type: "text",
      placeholder: "Enter Doctorate Institution",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "doctorateCourse",
      label: "Doctorate Course",
      type: "text",
      isVisible: !!doctorate,
      placeholder: "Enter Doctorate Course",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    // {
    //   name: "doctorateStartDate",
    //   label: "Doctorate Start Date",
    //   type: "date",
    //   isVisible: !!doctorate,
    //   config: {
    //     variant: "bordered",
    //     labelPlacement: "outside",
    //   },
    // },
    // {
    //   name: "doctorateEndDate",
    //   label: "Doctorate End Date",
    //   type: "date",
    //   isVisible: !!doctorate,
    //   config: {
    //     variant: "bordered",
    //     labelPlacement: "outside",
    //   },
    // },
    {
      name: "doctorateYear",
      label: "Doctorate Year",
      type: "text",
      isVisible: !!doctorate,
      placeholder: "Enter Year (e.g., 2021-2022)",
      config: {
        variant: "bordered",
        labelPlacement: "outside",
      },
    },
    {
      name: "highestDegree",
      label: "Highest Degree Attainment",
      type: "text",
      config: {
        variant: "flat",
        isReadOnly: true,
        disabled: true,
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormFields items={formFields} />
      </div>

      <Divider />
      <Text className="text-medium font-semibold">Certificates</Text>

      <FormFields
        items={[
          {
            name: "certificates",
            label: "Basic Certificates",
            type: "text",
            Component: ({ onChange }) => (
              <FileDropzone
                value={basicFileStates}
                onChange={(files) => {
                  setBasicFileStates(files);
                  onChange(files.map((f) => f.file));
                }}
                onFilesAdded={async (addedFiles) => {
                  setBasicFileStates([...basicFileStates, ...addedFiles]);
                  await Promise.all(
                    addedFiles.map(async (addedFileState) => {
                      try {
                        const res = await edgestore.publicFiles.upload({
                          file: addedFileState.file,
                          onProgressChange: async (progress) => {
                            updateFileProgress(
                              addedFileState.key,
                              progress,
                              "basic"
                            );
                            if (progress === 100) {
                              await new Promise((resolve) =>
                                setTimeout(resolve, 1000)
                              );
                              updateFileProgress(
                                addedFileState.key,
                                "COMPLETE",
                                "basic"
                              );
                            }
                          },
                        });
                      } catch (err) {
                        console.error(err);
                        updateFileProgress(
                          addedFileState.key,
                          "ERROR",
                          "basic"
                        );
                      }
                    })
                  );
                }}
              />
            ),
          },
        ]}
      />

      {masters && (
        <>
          <Divider />
          <Text className="text-medium font-semibold">
            Masters Certificates
          </Text>

          <FormFields
            items={[
              {
                name: "mastersCertificates",
                label: "Masters Certificates",
                type: "text",
                Component: ({ onChange }) => (
                  <FileDropzone
                    value={mastersFileStates}
                    onChange={(files) => {
                      setMastersFileStates(files);
                      onChange(files.map((f) => f.file));
                    }}
                    onFilesAdded={async (addedFiles) => {
                      setMastersFileStates([...mastersFileStates, ...addedFiles]);
                      await Promise.all(
                        addedFiles.map(async (addedFileState) => {
                          try {
                            const res = await edgestore.publicFiles.upload({
                              file: addedFileState.file,
                              onProgressChange: async (progress) => {
                                updateFileProgress(
                                  addedFileState.key,
                                  progress,
                                  "masters"
                                );
                                if (progress === 100) {
                                  await new Promise((resolve) =>
                                    setTimeout(resolve, 1000)
                                  );
                                  updateFileProgress(
                                    addedFileState.key,
                                    "COMPLETE",
                                    "masters"
                                  );
                                }
                              },
                            });
                          } catch (err) {
                            console.error(err);
                            updateFileProgress(
                              addedFileState.key,
                              "ERROR",
                              "masters"
                            );
                          }
                        })
                      );
                    }}
                  />
                ),
              },
            ]}
          />
        </>
      )}

      {doctorate && (
        <>
          <Divider />
          <Text className="text-medium font-semibold">
            Doctorate Certificates
          </Text>

          <FormFields
            items={[
              {
                name: "doctorateCertificates",
                label: "Doctorate Certificates",
                type: "text",
                Component: ({ onChange }) => (
                  <FileDropzone
                    value={doctorateFileStates}
                    onChange={(files) => {
                      setDoctorateFileStates(files);
                      onChange(files.map((f) => f.file));
                    }}
                    onFilesAdded={async (addedFiles) => {
                      setDoctorateFileStates([...doctorateFileStates, ...addedFiles]);
                      await Promise.all(
                        addedFiles.map(async (addedFileState) => {
                          try {
                            const res = await edgestore.publicFiles.upload({
                              file: addedFileState.file,
                              onProgressChange: async (progress) => {
                                updateFileProgress(
                                  addedFileState.key,
                                  progress,
                                  "doctorate"
                                );
                                if (progress === 100) {
                                  await new Promise((resolve) =>
                                    setTimeout(resolve, 1000)
                                  );
                                  updateFileProgress(
                                    addedFileState.key,
                                    "COMPLETE",
                                    "doctorate"
                                  );
                                }
                              },
                            });
                          } catch (err) {
                            console.error(err);
                            updateFileProgress(
                              addedFileState.key,
                              "ERROR",
                              "doctorate"
                            );
                          }
                        })
                      );
                    }}
                  />
                ),
              },
            ]}
          />
        </>
      )}
    </div>
  );
};

export default EducationalBackgroundForm;
