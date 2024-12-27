"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import FormFields, {
  FormInputProps,
} from "@/components/common/forms/FormFields";
import {
  useDepartmentsData,
  useJobpositionData,
  useBranchesData,
  useSalaryGradeData,
  useEmploymentStatusData,
  useEmployeesData,
} from "@/services/queries";
import { DateStyle } from "@/lib/custom/styles/InputStyle";
import { parseAbsoluteToLocal } from "@internationalized/date";
import dayjs from "dayjs";
const EditJobInformationForm: React.FC = () => {
  const { watch } = useFormContext();

  const { data: departments = [] } = useDepartmentsData();
  const { data: jobTitles = [] } = useJobpositionData();
  const { data: branches = [] } = useBranchesData();
  const { data: salaries = [] } = useSalaryGradeData();
  const { data: empstatuses = [] } = useEmploymentStatusData();
  const { data: employees = [] } = useEmployeesData();

  const departmentOptions = departments.reduce((acc: any[], dept) => {
    if (dept && dept.id && dept.name && dept.is_active) {
      acc.push({ value: dept.id.toString(), label: dept.name });
    }
    return acc;
  }, []);

  const jobOptions = jobTitles.reduce((acc: any[], job) => {
    if (job && job.id && job.name && job.is_active) {
      // Check if there are any active employees for the job position
      const hasActiveEmployees = employees.some(
        (employee) =>
          Number(employee.job_id) === job.id &&
          employee.resignation_json.length === 0 &&
          employee.termination_json.length === 0
      );
  
      // Add the job position to the options if there are no active employees
      // or if the current employee's job position matches
      if (!hasActiveEmployees || Number(watch("job_id")) === job.id) {
        // Check if max_department_instances limit is reached for the selected department
        if (
          job.max_department_instances !== null &&
          job.max_department_instances > 0
        ) {
          const selectedDepartmentId = Number(watch("department_id"));
  
          // Count the number of active employees assigned to this job position in the selected department
          const activeDepartmentInstanceCount = employees.filter(
            (employee) =>
              Number(employee.job_id) === job.id &&
              Number(employee.department_id) === selectedDepartmentId &&
              employee.resignation_json.length === 0 &&
              employee.termination_json.length === 0
          ).length;
  
          if (
            activeDepartmentInstanceCount >= job.max_department_instances &&
            Number(watch("job_id")) !== job.id
          ) {
            // Skip adding this job position to the options
            return acc;
          }
        }
  
        // Check if the job position is marked as "is_superior"
        if (job.is_superior) {
          const selectedDepartmentId = Number(watch("department_id"));
  
          // Check if there is already an active employee assigned to a superior position in the selected department
          const hasActiveSuperiorInDepartment = employees.some(
            (employee) =>
              Number(employee.department_id) === selectedDepartmentId &&
              jobTitles.some(
                (jobTitle) =>
                  jobTitle.id === Number(employee.job_id) &&
                  jobTitle.is_superior &&
                  employee.resignation_json.length === 0 &&
                  employee.termination_json.length === 0
              )
          );
  
          if (
            hasActiveSuperiorInDepartment &&
            !employees.some(
              (employee) =>
                Number(employee.department_id) === selectedDepartmentId &&
                Number(employee.job_id) === job.id &&
                employee.resignation_json.length === 0 &&
                employee.termination_json.length === 0
            )
          ) {
            // Skip adding this job position to the options
            return acc;
          }
        }
  
        // Add the job position to the options
        acc.push({ value: job.id.toString(), label: job.name });
      }
    }
    return acc;
  }, []);

  const branchOptions = branches.reduce((acc: any[], branch) => {
    if (branch && branch.id && branch.name && branch.is_active) {
      acc.push({ value: branch.id.toString(), label: branch.name });
    }
    return acc;
  }, []);

  const employmentstatusOptions = empstatuses.reduce(
    (acc: any[], empstatuses) => {
      if (empstatuses && empstatuses.id && empstatuses.name) {
        acc.push({ value: empstatuses.id.toString(), label: empstatuses.name });
      }
      return acc;
    },
    []
  );

  const salaryGradeOptions = salaries.reduce((acc: any[], salary) => {
    if (salary && salary.id && salary.name && salary.amount) {
      acc.push({
        value: salary.id.toString(),
        label: `${salary.name}: ₱${Number(salary.amount).toFixed(2)}`,
      });
    }
    return acc;
  }, []);

  const formBasicFields: FormInputProps[] = [
    {
      name: "department_id",
      label: "Department",
      type: "auto-complete",
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
        maxValue: parseAbsoluteToLocal(dayjs().endOf("day").toISOString()),
        // defaultValue: null,
        // classNames: DateStyle,
        validationState: "valid",
      },
    },
    {
      name: "job_id",
      label: "Job Position",
      type: "auto-complete",
      isRequired: true,
      config: {
        placeholder: "Select Job Position",
        options: jobOptions,
      },
    },
    {
      name: "employement_status_id",
      label: "Employment status",
      type: "auto-complete",
      isRequired: true,
      config: {
        placeholder: "Select employment status",
        options: employmentstatusOptions,
      },
    },
    {
      name: "salary_grade_id",
      label: "Salary Grade",
      type: "auto-complete",
      isRequired: true,
      config: {
        placeholder: "Select Salary Grade",
        options: salaryGradeOptions,
      },
    },
    {
      name: "branch_id",
      label: "Branch",
      type: "auto-complete",
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
