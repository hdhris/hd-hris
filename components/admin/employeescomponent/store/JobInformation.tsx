"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { useDepartmentsData, useJobpositionData, useBranchesData } from "@/services/queries";


const JobInformationForm: React.FC = () => {
  const { watch } = useFormContext();

  const { data: departments = [] } = useDepartmentsData();
  const { data: jobTitles = [] } = useJobpositionData();
  const { data: branches = [] } = useBranchesData();

  const departmentOptions = departments.reduce((acc: any[], dept) => {
    if (dept && dept.id && dept.name) {
      acc.push({ value: dept.id.toString(), label: dept.name });
    }
    return acc;
  }, []);

  const branchOptions = branches.reduce((acc: any[], branch) => {
    if (branch && branch.id && branch.name) {
      acc.push({ value: branch.id.toString(), label: branch.name });
    }
    return acc;
  }, []);

  const jobOptions = jobTitles
    .filter((jt) => jt.for_probi === (watch("is_regular") === "false"))
    .reduce((acc: any[], job) => {
      if (job && job.id && job.name) {
        acc.push({ value: job.id.toString(), label: job.name });
      }
      return acc;
    }, []);

  const formBasicFields: FormInputProps[] = [
    {
      name: "department_id",
      label: "Department",
      type: "select",
      isRequired: true,
      config: {
        placeholder: "Select Department",
        options: departmentOptions,
      },
    },
    {
      name: "hired_at",
      label: "Hired Date",
      type: "date-picker",
      isRequired: true,
      config: {
        placeholder: "Select hire date",
        defaultValue: new Date().toISOString(),
      },
    },
    {
      name: "job_id",
      label: "Job Position",
      type: "select",
      isRequired: true,
      config: {
        placeholder: "Select Job Position",
        options: jobOptions,
      },
    },
    {
      name: "is_regular",
      label: "Work Status",
      type: "select",
      isRequired: true,
      config: {
        placeholder: "Select Work Status",
        options: [
          { label: "Regular", value: "true" },
          { label: "Probationary", value: "false" },
        ],
      },
    },
    {
      name: "branch_id",
      label: "Branch",
      type: "select",
      isRequired: true,
      config: {
        placeholder: "Select Branch",
        options: branchOptions,
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        <FormFields items={formBasicFields} />
      </div>
    </div>
  );
};

export default JobInformationForm;