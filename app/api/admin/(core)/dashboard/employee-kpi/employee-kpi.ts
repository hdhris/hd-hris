import {toGMT8} from "@/lib/utils/toGMT8";
import prisma from "@/prisma/prisma";
import {isEmployeeAvailable} from "@/helper/employee/unavailableEmployee";


export const employeeKpi = async () => {

    const count_employee = await prisma.trans_employees.findMany({
        select: {
            id: true,
            hired_at: true,
            termination_json: true,
            resignation_json: true,
            suspension_json: true,
        }
    })

    const now = toGMT8(); // Current date in GMT+8
    const startOfMonth = now.clone().startOf('month'); // First day of the current month
    const endOfMonth = now.clone().endOf('month'); // Last day of the current month

    const newlyHired = count_employee.filter(emp => {
        const hiredAt = toGMT8(emp.hired_at!); // Ensure the hired_at date is properly parsed

        return hiredAt.isSameOrAfter(startOfMonth) && hiredAt.isSameOrBefore(endOfMonth);
    });

    const lastMonthLeftEmployee = new Set<number>();
    for(let current = new Date(startOfMonth.subtract(1,'month').toDate()); current <= endOfMonth.subtract(1,"month").toDate();  current.setDate(current.getDate() + 1)) {
        count_employee.forEach(employee => {
            if(!isEmployeeAvailable({employee: employee, find: ["termination", "resignation"], date: current.toISOString()} )){
                lastMonthLeftEmployee.add(employee.id);
            }
        })
    }

    const thisMonthLeftEmployee = new Set<number>();
    for(let current = new Date(startOfMonth.toDate()); current <= endOfMonth.toDate();  current.setDate(current.getDate() + 1)) {
        count_employee.forEach(employee => {
            if(!isEmployeeAvailable({employee: employee, find: ["termination", "resignation"], date: current.toISOString()} )){
                thisMonthLeftEmployee.add(employee.id);
            }
        })
    }

    const empAvailable = count_employee.filter(emp => isEmployeeAvailable({employee: emp, find: ["termination", "resignation"]}))
    return {
        total_employees: empAvailable.length,
        newly_hired_employees: newlyHired.length,
        left_employees: thisMonthLeftEmployee.difference(lastMonthLeftEmployee).size,
    }
}