import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { FileState, FileDropzone } from "@/components/ui/fileupload/file";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { SharedSelection } from "@nextui-org/react";

interface Certificate {
    fileName: string;
    fileUrl: string;
  }
  
const EditEducationalBackgroundForm = () => {
  const { control, watch, setValue } = useFormContext();
  const [showStrand, setShowStrand] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const { edgestore } = useEdgeStore();
  const [select, setSelect] = useState<string | null>(null);

  // Watch form fields
  const elementary = watch("elementary");
  const highSchool = watch("highSchool");
  const seniorHighSchool = watch("seniorHighSchool");
  const universityCollege = watch("universityCollege");
  const seniorHighStrand = watch("seniorHighStrand");

  
  // Show Strand field when Senior High School is entered
  useEffect(() => {
    setShowStrand(!!seniorHighSchool);
  }, [seniorHighSchool]);

  useEffect(() => {
    const initialSelect = seniorHighStrand || null;
    setSelect(initialSelect);
    setShowCourse(initialSelect === "tvl");
  }, [seniorHighStrand]);

  // Update showCourse based on select state
  useEffect(() => {
    setShowCourse(select === "tvl");
  }, [select]);

  // Determine the highest degree based on entered fields
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

  const handleSelect = (keys: SharedSelection) => {
    const value = Array.from(keys)[0] as string;
    setSelect(value);
    setValue("seniorHighStrand", value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Elementary School */}
        <FormField
          name="elementary"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Elementary School</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter Elementary School"
                  variant="bordered"
                  className="border rounded"
                  isRequired
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* High School */}
        <FormField
          name="highSchool"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>High School</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter High School"
                  variant="bordered"
                  className="border rounded"
                  isRequired
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Senior High School */}
        <FormField
          name="seniorHighSchool"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senior High School</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter Senior High School"
                  variant="bordered"
                  className="border rounded"
                  isRequired
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Senior High Strand - Show when Senior High School is entered */}
        {showStrand && (
          <FormField
            name="seniorHighStrand"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senior High School Strand</FormLabel>
                <FormControl>
                  <Select
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      handleSelect(keys);
                      const value = Array.from(keys)[0];
                      field.onChange(value);
                    }}
                    placeholder="Select Strand"
                    variant="bordered"
                    className="border rounded"
                  >
                    <SelectItem key="humss" value="HUMSS">
                      HUMSS
                    </SelectItem>
                    <SelectItem key="abm" value="ABM">
                      ABM
                    </SelectItem>
                    <SelectItem key="stem" value="STEM">
                      STEM
                    </SelectItem>
                    <SelectItem key="gas" value="GAS">
                      GAS
                    </SelectItem>
                    <SelectItem key="tvl" value="TVL">
                      TVL
                    </SelectItem>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* TVL Course - Show only when "TVL" is selected */}
        {showCourse && (
          <FormField
            name="tvlCourse"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>TVL Course</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter TVL Course"
                    variant="bordered"
                    className="border rounded"
                    isRequired
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* University/College */}
        <FormField
          name="universityCollege"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>University/College</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter University/College"
                  variant="bordered"
                  className="border rounded"
                  isRequired
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Course - Show if University/College is entered */}
        {showCourse && (
          <FormField
            name="course"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter Course"
                    variant="bordered"
                    className="border rounded"
                    isRequired
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Highest Degree Attainment */}
        <FormField
          name="highestDegree"
          control={control}
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Highest Degree Attainment</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Highest Degree"
                  variant="bordered"
                  className="border rounded"
                  isReadOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        {/* Certificate Upload */}
        <FormField
          name="certificates"
          control={control}
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Certificates</FormLabel>
              <FormControl>
                <FileDropzone
                  value={fileStates}
                  onChange={(files) => {
                    setFileStates(files);
                    field.onChange(files.map((f) => f.file));
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
                          console.log(res);
                        } catch (err) {
                          console.error(err);
                          updateFileProgress(addedFileState.key, "ERROR");
                        }
                      })
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default EditEducationalBackgroundForm;
