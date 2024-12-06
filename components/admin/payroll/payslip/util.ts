import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";
import { PayslipPayhead } from "@/types/payroll/payrollType";

export function isAffected(employee: UserEmployee, payhead: PayslipPayhead) {
  try{
    const mandatory = payhead.affected_json.mandatory;
    const department = payhead.affected_json.departments;
    const roles = payhead.affected_json.job_classes;
    const employees = payhead.affected_json.employees;


    // If not automatically for every employee
    if(mandatory != "all"){
      // Return false if also not included in the selected roles
      if(mandatory.length > 0){
        if(!mandatory.includes(employee.ref_employment_status.id)) return false

      } else { // If not mandatory, check if included in the selected employees
      
        // If not automatically for every employee
        if(employees != "all"){
          // Return false if also not included in the selected employees
          if(!employees.includes(employee.id))  return false
        }
      }
    }

    // If not automatically for every employee
    if(department != "all"){
      // Return false if also not included in the selected departments
      if(!department.includes(employee.ref_departments.id))  return false
    }

    // If not automatically for every employee
    if(roles != "all"){
      // Return false if also not included in the selected roles
      if(!roles.includes(employee.ref_job_classes.id))  return false
    }

    // If all constraints has passed, return true
    return true;

  } catch (error){
    return false;
  }
}

//51 Basic Salary
//53 Cash Disbursement
//54 Cash Repayment
