import prisma from "@/prisma/prisma";
import {employee_basic_details} from "@/server/employee-details-map/employee-details-map";
import {Evaluator, Evaluators, LeaveApplicationEvaluations} from "@/types/leaves/leave-evaluators-types";
import {toGMT8} from "@/lib/utils/toGMT8";

export const getSignatory = async (path: string, applicant_id: number, is_auto_approved?: boolean) => {
    try {
        const [signatories, applicant] = await Promise.all([
        prisma.trans_signatories.findMany({
            where: {
                ref_signatory_paths: {
                    signatories_path: path
                },
                deleted_at: null
            }, include: {
                ref_signatory_paths: true,
                ref_signatory_roles: true,
                ref_job_classes: true
            },
        }),
            prisma.trans_employees.findUnique({
                where: {
                    id: applicant_id,
                    deleted_at: null
                }, select: {
                    ...employee_basic_details, ref_departments: {
                        select: {
                            id: true, name: true
                        }
                    }, ref_job_classes: {
                        select: {
                            id: true, name: true
                        }
                    }
                }
            })
    ])




        const jobIds = signatories.map((job) => job.job_id);
        const getIsApplyToAllSignatory = signatories
            .filter((item) => item.is_apply_to_all_signatory)
            .map((job) => job.job_id);

        if (!jobIds.length || !applicant?.ref_departments?.id) {
            return null
        }

        const empJobDepartment = await prisma.trans_employees.groupBy({
            by: ["job_id", "department_id", "id"], where: {
                job_id: {
                    in: jobIds,
                }, department_id: applicant.ref_departments.id,
            },
        });

        if (!empJobDepartment.length) {
            return null
        }

        const employeeIds = empJobDepartment.map((record) => record.id);



        const isAutoApproved = is_auto_approved ? [{job_id: {in: getIsApplyToAllSignatory}}] : [{id: {in: employeeIds}}, {job_id: {in: getIsApplyToAllSignatory}}]
        const employeeDetails = await prisma.trans_employees.findMany({
            where: {
                OR: isAutoApproved,
            }, select: {
                ...employee_basic_details, ref_departments: {
                    select: {
                        id: true, name: true,
                    },
                }, ref_job_classes: {
                    select: {
                        id: true, name: true, trans_signatories: {
                            where: {
                                ref_signatory_paths: {
                                    signatories_path: path
                                }, deleted_at: null
                            }, select: {
                                ref_signatory_roles: {
                                    select: {
                                        signatory_role_name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return {
            evaluators: Object.fromEntries(
                employeeDetails
                    .reduce((acc, employee) => {
                        const roles = employee.ref_job_classes?.trans_signatories.map(
                            (signatory) => signatory.ref_signatory_roles?.signatory_role_name
                        );

                        roles?.forEach((role) => {
                            if (role) {
                                const matchingSignatory = signatories.find(
                                    (item) => item.ref_signatory_roles?.signatory_role_name === role
                                );

                                if (matchingSignatory) {
                                    acc.push([
                                        role, // Key for the evaluator
                                        {
                                            evaluated_by: employee.id,
                                            decision: {
                                                is_decided: is_auto_approved || null,
                                                rejectedReason: null,
                                                decisionDate: is_auto_approved ? toGMT8() : null,
                                            },
                                            order_number: matchingSignatory.order_number,
                                        } as Evaluator, // Explicitly define this as an Evaluator
                                    ]);
                                }
                            }
                        });

                        return acc;
                    }, [] as [string, Evaluator][]) // Ensure the accumulator is of the correct type
                    .sort((a, b) => a[1].order_number - b[1].order_number) // Sort by order_number
            ), // Convert the array to an object
            users: [
                ...employeeDetails.map((employee) => ({
                    id: String(employee.id),
                    name: `${employee.first_name} ${employee.last_name}`,
                    email: employee.email,
                    picture: employee.picture,
                    employee_id: employee.id,
                    role: employee.ref_job_classes?.trans_signatories
                        .map((signatory) => signatory.ref_signatory_roles?.signatory_role_name)
                        .filter(Boolean)
                        .join(", ") || "applicant",
                })),
                {
                    id: applicant.id,
                    name: `${applicant.first_name} ${applicant.last_name}`,
                    email: applicant.email,
                    picture: applicant.picture,
                    role: "applicant",
                },
            ],
            comments: [], // Add comment data dynamically if applicable
            is_automatic_approved: is_auto_approved
        } as LeaveApplicationEvaluations;

    } catch (error){
        console.log("Error: ", error)
        return "Error while fetching data."
    }
}