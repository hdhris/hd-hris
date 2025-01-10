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
import { useToast } from "@/components/ui/use-toast";

const EditJobInformationForm: React.FC = () => {
  const { watch, setValue, trigger } = useFormContext();
  const selectedDepartmentId = watch("department_id");
  const selectedJobId = watch("job_id");
  const currentSalaryId = watch("salary_grade_id");
  const { toast } = useToast();

  const { data: departments = [] } = useDepartmentsData();
  const { data: jobTitles = [] } = useJobpositionData();
  const { data: branches = [] } = useBranchesData();
  const { data: salaries = [] } = useSalaryGradeData();
  const { data: empstatuses = [] } = useEmploymentStatusData();
  const { data: employees = [] } = useEmployeesData();
  const { data: privileges = [] } = usePrivilegesData();

  // Get selected job's salary range
  const selectedJob = useMemo(() => {
    return jobTitles.find(job => job.id === Number(selectedJobId));
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

  // Reset and validate salary_grade_id when job changes
  useEffect(() => {
    if (selectedJobId && selectedJob) {
      const currentSalary = salaries.find(s => s.id === Number(currentSalaryId));
      const isCurrentSalaryValid = currentSalary && 
        Number(currentSalary.amount) >= Number(selectedJob.min_salary) &&
        Number(currentSalary.amount) <= Number(selectedJob.max_salary);

      if (!isCurrentSalaryValid) {
        setValue("salary_grade_id", "");
        toast({
          title: "Salary Reset",
          description: "Previous salary grade is not within the new job position's range",
          duration: 3000,
        });
      }

      // Trigger validation
      trigger(["salary_grade_id"]);
    }
  }, [selectedJobId, selectedJob, currentSalaryId, salaries, setValue, trigger, toast]);

  const departmentOptions = useMemo(() => {
    return departments.reduce((acc: any[], dept) => {
      if (dept && dept.id && dept.name && dept.is_active) {
        acc.push({ value: dept.id.toString(), label: dept.name });
      }
      return acc;
    }, []);
  }, [departments]);

  const jobOptions = jobTitles
  .filter(items => items.department_id === Number(selectedDepartmentId))
  .reduce((acc: any[], job) => {
    if (job && job.id && job.name && job.is_active) {
      // Only do employee count check if max_employees is set
      if (job.max_employees) {
        const activeEmployeeCount = employees.filter(
          (employee) =>
            Number(employee.job_id) === job.id &&
            employee.resignation_json.length === 0 &&
            employee.termination_json.length === 0
        ).length;

        if (activeEmployeeCount >= job.max_employees) {
          return acc; // Skip this job if employee limit reached
        }
      }

      // Check department instances only if limit is set
      if (job.max_department_instances && job.max_department_instances > 0) {
        const activeDepartmentInstanceCount = employees.filter(
          (employee) =>
            Number(employee.job_id) === job.id &&
            Number(employee.department_id) === Number(selectedDepartmentId) &&
            employee.resignation_json.length === 0 &&
            employee.termination_json.length === 0
        ).length;

        if (activeDepartmentInstanceCount >= job.max_department_instances) {
          return acc; // Skip this job if department instance limit reached
        }
      }

      // Check superior position separately
      if (job.is_superior) {
        const hasActiveSuperiorInDepartment = employees.some(
          (employee) =>
            Number(employee.department_id) === Number(selectedDepartmentId) &&
            jobTitles.some(
              (jobTitle) =>
                jobTitle.id === Number(employee.job_id) &&
                jobTitle.is_superior &&
                employee.resignation_json.length === 0 &&
                employee.termination_json.length === 0
            )
        );

        if (hasActiveSuperiorInDepartment) {
          return acc; // Skip if department already has a superior
        }
      }

      // Add job to options if it passed all checks
      acc.push({ value: job.id.toString(), label: job.name });
    }
    return acc;
  }, []);

  const salaryGradeOptions = useMemo(() => {
    if (!selectedJob) return [];
    
    return salaries
      .filter(salary => 
        Number(salary.amount) >= Number(selectedJob.min_salary) &&
        Number(salary.amount) <= Number(selectedJob.max_salary)
      )
      .sort((a, b) => Number(a.amount) - Number(b.amount))
      .map(salary => ({
        value: salary.id.toString(),
        label: `${salary.name}: ₱${Number(salary.amount).toLocaleString()}`
      }));
  }, [salaries, selectedJob]);

  const branchOptions = useMemo(() => {
    return branches.reduce((acc: any[], branch) => {
      if (branch && branch.id && branch.name && branch.is_active) {
        acc.push({ value: branch.id.toString(), label: branch.name });
      }
      return acc;
    }, []);
  }, [branches]);

  const employmentstatusOptions = useMemo(() => {
    return empstatuses.map(status => ({
      value: status.id.toString(),
      label: status.name
    }));
  }, [empstatuses]);

  const privilegeOptions = useMemo(() => {
    return privileges.map(privilege => ({
      value: privilege.id.toString(),
      label: privilege.name
    }));
  }, [privileges]);

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
        validationState: "valid",
        showMonthAndYearPickers: true,
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
          : "Select Job Position first",
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
      <FormFields items={formBasicFields} />
    </div>
  );
};

export default EditJobInformationForm;