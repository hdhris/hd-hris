'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@nextui-org/input';
import { Select, SelectItem } from '@nextui-org/select';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
} from '@/components/ui/form';
import { FileState, FileDropzone } from "@/components/ui/fileupload/file";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { SharedSelection } from '@nextui-org/react';

const EducationalBackgroundForm = () => {
  const { control, watch, setValue } = useFormContext();
  const [showStrand, setShowStrand] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const { edgestore } = useEdgeStore();
  const [select,setSelect]= useState<string>('')

  // Watch form fields
  const elementary = watch('elementary');
  const highSchool = watch('highSchool');
  const seniorHighSchool = watch('seniorHighSchool');
  const universityCollege = watch('universityCollege');

  // Show Strand field when Senior High School is entered
  useEffect(() => {
    setShowStrand(!!seniorHighSchool);
  }, [seniorHighSchool]);

  // Show Course field when University/College is entered
  useEffect(() => {
    setShowCourse(!!universityCollege);
  }, [universityCollege]);

  // Determine the highest degree based on entered fields
  useEffect(() => {
    let highestDegree = 'Elementary School';
    if (highSchool) highestDegree = 'High School';
    if (seniorHighSchool) highestDegree = 'Senior High School';
    if (universityCollege) highestDegree = 'University/College';
    setValue('highestDegree', highestDegree);
  }, [elementary, highSchool, seniorHighSchool, universityCollege, setValue]);

  function updateFileProgress(key: string, progress: FileState['progress']) {
    setFileStates((fileStates) => {
      const newFileStates = structuredClone(fileStates);
      const fileState = newFileStates.find(
        (fileState) => fileState.key === key,
      );
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }

  const handleSelect =(key:SharedSelection) => {
    if(key.anchorKey === 'tvl'){
      setSelect(key as string)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Educational Background</h3>

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
                    {...field}
                    placeholder="Select Strand"
                    variant="bordered"
                    className="border rounded"
                    onSelectionChange={handleSelect}
                  >
                    <SelectItem key="humss" value="HUMSS">HUMSS</SelectItem>
                    <SelectItem key="abm" value="ABM">ABM</SelectItem>
                    <SelectItem key="stem" value="STEM">STEM</SelectItem>
                    <SelectItem key="gas" value="GAS">GAS</SelectItem>
                    <SelectItem key="tvl" value="TVL">TVL</SelectItem>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

         {/* Course - Show if University/College is entered */}
         {select && (
          <FormField
            name="tvlCourse"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>TVL Course</FormLabel>
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
                    field.onChange(files.map(f => f.file));
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
                                await new Promise((resolve) => setTimeout(resolve, 1000));
                                updateFileProgress(addedFileState.key, 'COMPLETE');
                              }
                            },
                          });
                          console.log(res);
                        } catch (err) {
                          console.error(err);
                          updateFileProgress(addedFileState.key, 'ERROR');
                        }
                      }),
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

export default EducationalBackgroundForm;