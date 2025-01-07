"use client";
import React, { useMemo, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import {
  useDepartmentsData,
  useJobpositionData,
  useBranchesData,
  useSalaryGradeData,
  useEmploymentStatusData,
  useEmployeesData,
  usePrivilegesData,
} from "@/services/queries";
import { parseAbsoluteToLocal } from "@internationalized/date";
import dayjs from "dayjs";

const JobInformationForm: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const selectedDepartmentId = watch("department_id");
  const selectedJobId = watch("job_id");
  const currentSalaryId = watch("salary_grade_id");

  const { data: departments = [] } = useDepartmentsData();
  const { data: jobTitles = [] } = useJobpositionData();
  const { data: branches = [] } = useBranchesData();
  const { data: salaries = [] } = useSalaryGradeData();
  const { data: empstatuses = [] } = useEmploymentStatusData();
  const { data: employees = [] } = useEmployeesData();
  const { data: privileges = [] } = usePrivilegesData();

  // Get selected job's salary range
  const selectedJob = useMemo(() => {
    return jobTitles.find((job) => job.id === Number(selectedJobId));
  }, [jobTitles, selectedJobId]);

  // Reset job_id when department changes
  useEffect(() => {
    if (selectedDepartmentId) {
      const currentJob = jobTitles.find(job => job.id === Number(selectedJobId));
      if (currentJob && currentJob.department_id !== Number(selectedDepartmentId)) {
        setValue("job_id", "");
        setValue("salary_grade_id", "");
      }
    }
  }, [selectedDepartmentId, jobTitles, selectedJobId, setValue]);

  // Reset salary_grade_id when job changes
  useEffect(() => {
    if (selectedJobId && selectedJob) {
      const currentSalary = salaries.find(s => s.id === Number(currentSalaryId));
      if (currentSalary) {
        const isValidSalary = Number(currentSalary.amount) >= Number(selectedJob.min_salary) && 
                             Number(currentSalary.amount) <= Number(selectedJob.max_salary);
        if (!isValidSalary) {
          setValue("salary_grade_id", "");
        }
      }
    }
  }, [selectedJobId, selectedJob, currentSalaryId, salaries, setValue]);

  const departmentOptions = useMemo(() => departments.reduce((acc: any[], dept) => {
    if (dept && dept.id && dept.name && dept.is_active) {
      acc.push({ value: dept.id.toString(), label: dept.name });
    }
    return acc;
  }, []), [departments]);

  const jobOptions = useMemo(() => {
    return jobTitles
      .filter(items => items.department_id === Number(watch("department_id")))
      .reduce((acc: any[], job) => {
        if (job && job.id && job.name && job.is_active) {
          // Check if there are any active employees for the job position
          const hasActiveEmployees = employees.some(
            (employee) =>
              Number(employee.job_id) === job.id &&
              employee.resignation_json.length === 0 &&
              employee.termination_json.length === 0
          );

          if (!hasActiveEmployees || Number(watch("job_id")) === job.id) {
            if (
              job.max_department_instances !== null &&
              job.max_department_instances > 0
            ) {
              const activeDepartmentInstanceCount = employees.filter(
                (employee) =>
                  Number(employee.job_id) === job.id &&
                  Number(employee.department_id) === Number(watch("department_id")) &&
                  employee.resignation_json.length === 0 &&
                  employee.termination_json.length === 0
              ).length;

              if (
                activeDepartmentInstanceCount >= job.max_department_instances &&
                Number(watch("job_id")) !== job.id
              ) {
                return acc;
              }
            }

            if (job.is_superior) {
              const hasActiveSuperiorInDepartment = employees.some(
                (employee) =>
                  Number(employee.department_id) === Number(watch("department_id")) &&
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
                    Number(employee.department_id) === Number(watch("department_id")) &&
                    Number(employee.job_id) === job.id &&
                    employee.resignation_json.length === 0 &&
                    employee.termination_json.length === 0
                )
              ) {
                return acc;
              }
            }

            acc.push({ value: job.id.toString(), label: job.name });
          }
        }
        return acc;
      }, []);
  }, [jobTitles, employees, watch]);

  // Filter salary grades based on selected job's salary range
  const salaryGradeOptions = useMemo(() => {
    if (!selectedJob) return [];
    
    return salaries
      .filter(salary => {
        const salaryAmount = Number(salary.amount);
        return salaryAmount >= Number(selectedJob.min_salary) && 
               salaryAmount <= Number(selectedJob.max_salary);
      })
      .sort((a, b) => Number(a.amount) - Number(b.amount))
      .map(salary => ({
        value: salary.id.toString(),
        label: `${salary.name}: ₱${Number(salary.amount).toLocaleString()}`
      }));
  }, [salaries, selectedJob]);

  const branchOptions = useMemo(() => branches.reduce((acc: any[], branch) => {
    if (branch && branch.id && branch.name && branch.is_active) {
      acc.push({ value: branch.id.toString(), label: branch.name });
    }
    return acc;
  }, []), [branches]);

  const employmentstatusOptions = empstatuses.reduce((acc: any[], empstatuses) => {
    if (empstatuses && empstatuses.id && empstatuses.name) {
      acc.push({ value: empstatuses.id.toString(), label: empstatuses.name });
    }
    return acc;
  }, []);

  const privilegeOptions = privileges.reduce((acc: any[], privilege) => {
    if (privilege && privilege.id && privilege.name) {
      acc.push({ value: privilege.id.toString(), label: privilege.name });
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
        description: !selectedDepartmentId ? "Please select a department first" : undefined,
        isDisabled: !selectedDepartmentId,
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
        placeholder: selectedJob 
          ? `Select salary grade (₱${Number(selectedJob.min_salary).toLocaleString()} - ₱${Number(selectedJob.max_salary).toLocaleString()})`
          : "Please select a job position first",
        options: salaryGradeOptions,
        description: selectedJob 
          ? `Available salary grades for this position: ₱${Number(selectedJob.min_salary).toLocaleString()} - ₱${Number(selectedJob.max_salary).toLocaleString()}`
          : "Salary range will be shown after selecting a job position",
        isDisabled: !selectedJob,
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
    {
      name: "privilege_id",
      label: "Access Level",
      type: "auto-complete",
      isRequired: true,
      config: {
        placeholder: "Select Access Level",
        options: privilegeOptions,
        description: "This will be used for the employee's account access"
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