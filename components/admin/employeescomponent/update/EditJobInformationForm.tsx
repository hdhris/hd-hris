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
  useEmployeeData,
} from "@/services/queries";
import { parseAbsoluteToLocal } from "@internationalized/date";
import dayjs from "dayjs";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";

const EditJobInformationForm: React.FC = () => {
  const params = useParams();
  const employeeId = params?.id as string;
  const { data: employeeData } = useEmployeeData(employeeId ?? '');
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

  const selectedJob = useMemo(() => {
    return jobTitles.find(job => job.id === Number(selectedJobId));
  }, [jobTitles, selectedJobId]);

  useEffect(() => {
    if (selectedDepartmentId) {
      const currentJob = jobTitles.find(job => job.id === Number(selectedJobId));
      if (currentJob && currentJob.department_id !== Number(selectedDepartmentId)) {
        setValue("job_id", "");
        setValue("salary_grade_id", "");
        setValue("batch_id", "");
        
        const currentSchedule = employeeData?.dim_schedules?.find(schedule => !schedule.end_date);
        const existingDaysJson = currentSchedule?.days_json 
          ? (typeof currentSchedule.days_json === 'string' 
              ? JSON.parse(currentSchedule.days_json) 
              : currentSchedule.days_json)
          : [];
        
        setValue("days_json", existingDaysJson);
      }
    }
  }, [selectedDepartmentId, jobTitles, selectedJobId, setValue, employeeData]);

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

      // Only set default schedules if job is changed after initial load
      if (!employeeData?.dim_schedules?.length || selectedJobId !== employeeData?.job_id?.toString()) {
        const jobDays = selectedJob.days_json || [];
        setValue("days_json", jobDays, {
          shouldValidate: true,
          shouldDirty: true,
        });
    
        if (selectedJob.batch_id) {
          setValue("batch_id", selectedJob.batch_id.toString(), {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    }
  }, [selectedJobId, selectedJob, currentSalaryId, salaries, setValue, employeeData]);

  useEffect(() => {
    if (employeeData) {
      const currentSchedule = employeeData.dim_schedules?.find(schedule => !schedule.end_date);
      
      const existingBatchId = currentSchedule?.ref_batch_schedules?.id?.toString();
      if (existingBatchId) {
        setValue("batch_id", existingBatchId);
      }
      
      const existingDaysJson = currentSchedule?.days_json 
        ? (typeof currentSchedule.days_json === 'string' 
            ? JSON.parse(currentSchedule.days_json) 
            : currentSchedule.days_json)
        : [];
      
      setValue("days_json", existingDaysJson);
    }
  }, [employeeData, setValue]);

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
      if (job.max_employees) {
        const activeEmployeeCount = employees.filter(
          (employee) =>
            Number(employee.job_id) === job.id &&
            employee.resignation_json.length === 0 &&
            employee.termination_json.length === 0
        ).length;

        if (activeEmployeeCount >= job.max_employees) {
          return acc;
        }
      }

      if (job.max_department_instances && job.max_department_instances > 0) {
        const activeDepartmentInstanceCount = employees.filter(
          (employee) =>
            Number(employee.job_id) === job.id &&
            Number(employee.department_id) === Number(selectedDepartmentId) &&
            employee.resignation_json.length === 0 &&
            employee.termination_json.length === 0
        ).length;

        if (activeDepartmentInstanceCount >= job.max_department_instances) {
          return acc;
        }
      }

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
          return acc;
        }
      }

      acc.push({ value: job.id.toString(), label: job.name });
    }
    return acc;
  }, []);

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

  const branchOptions = useMemo(() => {
    return branches.reduce((acc: any[], branch) => {
      if (branch && branch.id && branch.name && branch.is_active) {
        acc.push({ value: branch.id.toString(), label: branch.name });
      }
      return acc;
    }, []);
  }, [branches]);

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

export default EditJobInformationForm;