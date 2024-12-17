import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { employee_basic_details } from "@/server/employee-details-map/employee-details-map";
import { SignatoryEmployeeDetails, SignatoryPath } from "@/types/signatory/signatory-types";

export const dynamic = "force-dynamic"
// API Handler
export async function GET() {
    try {
        // Group signatories to fetch IDs (job_ids and signatory_path_ids)
        const groupedSignatories = await prisma.trans_signatories.groupBy({
            by: ["signatory_path_id", "job_id"],
            where: { deleted_at: null },
        });

        // Extract IDs
        const signatoryPathIds = groupedSignatories.map(item => item.signatory_path_id);
        const jobIds = groupedSignatories.map(item => item.job_id);

        // Run both queries in parallel
        const [signatoryPaths, employees] = await Promise.all([
            prisma.ref_signatory_paths.findMany({
                where: { id: { in: signatoryPathIds } },
                select: {
                    id: true,
                    signatories_path: true,
                    signatories_name: true,
                    trans_signatories: {
                        select: {
                            job_id: true,
                            order_number: true,
                            is_apply_to_all_signatory: true,
                            ref_signatory_roles: {
                                select: { id: true, signatory_role_name: true },
                            },
                            ref_job_classes: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                },
            }),
            prisma.trans_employees.findMany({
                where: { job_id: { in: jobIds }, deleted_at: null },
                select: {
                    ...employee_basic_details,
                    job_id: true,
                    ref_departments: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
        ]);

        // Create a mapping of job_id to an array of employees
        const employeeMap: Record<number, SignatoryEmployeeDetails[]> = {};

        employees.forEach(employee => {
            if (employee.job_id != null) {
                const departmentName = employee.ref_departments?.name || "";
                const employeeDetails: SignatoryEmployeeDetails = {
                    id: employee.id,
                    picture: employee.picture || null,
                    email: employee.email ?? "",
                    prefix: employee.prefix,
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    middle_name: employee.middle_name,
                    suffix: employee.suffix,
                    job_id: employee.job_id,
                    departments: departmentName,
                };

                if (!employeeMap[employee.job_id]) {
                    employeeMap[employee.job_id] = [];
                }
                employeeMap[employee.job_id].push(employeeDetails);
            }
        });

        // Attach employees array to their corresponding trans_signatories
        const reshapedSignatoryPaths: SignatoryPath[] = signatoryPaths.map(path => ({
            id: path.id,
            name: path.signatories_name,
            signatories_path: path.signatories_path,
            signatories: path.trans_signatories.map(signatory => ({
                job_id: signatory.job_id,
                order_number: signatory.order_number,
                is_apply_to_all_signatory: signatory.is_apply_to_all_signatory,
                signatory_roles: {
                    id: signatory.ref_signatory_roles.id,
                    signatory_role_name: signatory.ref_signatory_roles.signatory_role_name,
                },
                job_classes: {
                    id: signatory.ref_job_classes.id,
                    name: signatory.ref_job_classes.name ?? ""
                },
                employees: employeeMap[signatory.job_id] || [], // Attach employees or empty array
            })),
        }));

        // Return the reshaped data
        return NextResponse.json(reshapedSignatoryPaths);
    } catch (error) {
        console.error("Error fetching and reshaping signatories:", error);
        return NextResponse.json(
            { success: false, message: "Error while fetching data." },
            { status: 500 }
        );
    }
}