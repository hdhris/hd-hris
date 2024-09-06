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

const EducationalBackgroundForm = () => {
  const { control, watch, setValue } = useFormContext();
  const [showStrand, setShowStrand] = useState(false);
  const [showCourse, setShowCourse] = useState(false);

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
      </div>
    </div>
  );
};

export default EducationalBackgroundForm;
