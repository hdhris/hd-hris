import { PayslipEmployee, PayslipPayhead } from "@/types/payroll/payrollType";
import { Decimal } from "@prisma/client/runtime/library";

export function isAffected(employee: PayslipEmployee, payhead: PayslipPayhead) {
  try{
    const affected = payhead?.affected_json;
    // Find mandatory level...

    if (affected.department?.length) {
      // If by department affected
      if (!affected.department.includes(employee?.ref_departments?.id!))
        return false;
    }
    if (affected.job_classes.length) {
      // If by role affected as well
      if (!affected.job_classes.includes(employee?.ref_job_classes?.id!))
        return false;
    }

    if (affected.mandatory.probationary) {
      if (!employee.is_regular) return true;
    }
    if (affected.mandatory.regular) {
      if (employee.is_regular) return true;
    }

    // If not mandatory, check if affected selectively...
    return employee.dim_payhead_affecteds.some(
      (affect) => affect.payhead_id === payhead.id
    );
  } catch (error){
    // console.log(error);
    // console.log(employee);
    return false;
  }
}

//51 Basic Salary
//53 Cash Disbursement
//54 Cash Repayment
