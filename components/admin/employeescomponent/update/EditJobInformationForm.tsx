"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { useDepartmentsData, useJobpositionData, useBranchesData, useSalaryGradeData, useEmploymentStatusData } from "@/services/queries";

const EditJobInformationForm: React.FC = () => {
  const { watch } = useFormContext();

  const { data: departments = [] } = useDepartmentsData();
  const { data: jobTitles = [] } = useJobpositionData();
  const { data: branches = [] } = useBranchesData();
  const { data: salaries = [] } = useSalaryGradeData();
  const { data: empstatuses = [] } = useEmploymentStatusData();

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

  
  const employmentstatusOptions = empstatuses.reduce((acc: any[], empstatuses) => {
    if (empstatuses && empstatuses.id && empstatuses.name) {
      acc.push({ value: empstatuses.id.toString(), label: empstatuses.name });
    }
    return acc;
  }, []);

  const salaryGradeOptions = salaries.reduce((acc: any[], salary) => {
    if (salary && salary.id && salary.name && salary.amount) {
      acc.push({ value: salary.id.toString(), label: `${salary.name}: P${Number(salary.amount).toFixed(2)}` });
    }
    return acc;
  }, []);

  const jobOptions = jobTitles.reduce((acc: any[], job) => {
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
      name: "employement_status_id",
      label: "Employment status",
      type: "select",
      isRequired: true,
      config: {
        placeholder: "Select employment status",
        options: employmentstatusOptions,
      },
    },
    {
      name: "salary_grade_id",
      label: "Salary Grade",
      type: "select",
      isRequired: true,
      config: {
        placeholder: "Select Salary Grade",
        options: salaryGradeOptions,
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
      <FormFields items={formBasicFields} />
    </div>
  );
};

export default EditJobInformationForm;