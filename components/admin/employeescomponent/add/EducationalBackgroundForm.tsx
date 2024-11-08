"use client";

import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { SharedSelection } from "@nextui-org/react";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { FileState, FileDropzone } from "@/components/ui/fileupload/file";
import { Divider } from "@nextui-org/react";
import Text from "@/components/Text";

const EducationalBackgroundForm = () => {
  const { watch, setValue } = useFormContext();
  const [showStrand, setShowStrand] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const { edgestore } = useEdgeStore();
  const [select, setSelect] = useState<string>("");

  // Watch form fields
  const elementary = watch("elementary");
  const highSchool = watch("highSchool");
  const seniorHighSchool = watch("seniorHighSchool");
  const universityCollege = watch("universityCollege");
//
  useEffect(() => {
    setShowStrand(!!seniorHighSchool);
  }, [seniorHighSchool]);

  useEffect(() => {
    setShowCourse(!!universityCollege);
  }, [universityCollege]);

  useEffect(() => {
    let highestDegree = "Elementary School";
    if (highSchool) highestDegree = "High School";
    if (seniorHighSchool) highestDegree = "Senior High School";
    if (universityCollege) highestDegree = "University/College";
    setValue("highestDegree", highestDegree);
  }, [elementary, highSchool, seniorHighSchool, universityCollege, setValue]);

  function updateFileProgress(key: string, progress: FileState["progress"]) {
    setFileStates((fileStates) => {
      const newFileStates = structuredClone(fileStates);
      const fileState = newFileStates.find(
        (fileState) => fileState.key === key
      );
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }
//
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
      name: "highestDegree",
      label: "Highest Degree Attainment",
      type: "text",
      config: {
        variant: "bordered",
        isReadOnly: true,
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
            label: "Certificates",
            type: "text",
            Component: ({ onChange }) => (
              <FileDropzone
                value={fileStates}
                onChange={(files) => {
                  setFileStates(files);
                  onChange(files.map((f) => f.file));
                }}
                onFilesAdded={async (addedFiles) => {
                  setFileStates([...fileStates, ...addedFiles]);
                  await Promise.all(
                    addedFiles.map(async (addedFileState) => {
                      try {
                        const res = await edgestore.publicFiles.upload({
                          file: addedFileState.file,
                          onProgressChange: async (progress) => {
                            updateFileProgress(addedFileState.key, progress);
                            if (progress === 100) {
                              await new Promise((resolve) =>
                                setTimeout(resolve, 1000)
                              );
                              updateFileProgress(
                                addedFileState.key,
                                "COMPLETE"
                              );
                            }
                          },
                        });
                        // console.log(res);
                      } catch (err) {
                        console.error(err);
                        updateFileProgress(addedFileState.key, "ERROR");
                      }
                    })
                  );
                }}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default EducationalBackgroundForm;