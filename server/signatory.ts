import prisma from "@/prisma/prisma";
import {employee_basic_details} from "@/server/employee-details-map/employee-details-map";
import {toGMT8} from "@/lib/utils/toGMT8";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import { emp_rev_include } from "@/helper/include-emp-and-reviewr/include";
import { Evaluations } from "@/types/leaves/leave-evaluators-types";

// export const getSignatory = async (path: string, applicant_id: number, is_auto_approved: boolean) => {
//     try {
//         const [signatories, applicant] = await Promise.all([prisma.trans_signatories.findMany({
//             where: {
//                 ref_signatory_paths: {
//                     signatories_path: path
//                 }, deleted_at: null
//             }, include: {
//                 ref_signatory_paths: true,
//                 ref_signatory_roles: true,
//                 ref_job_classes: true
//             },
//         }),
//             prisma.trans_employees.findUnique({
//             where: {
//                 id: applicant_id,
//                 deleted_at: null
//             }, select: {
//                 ...employee_basic_details, ref_departments: {
//                     select: {
//                         id: true, name: true
//                     }
//                 }, ref_job_classes: {
//                     select: {
//                         id: true, name: true
//                     }
//                 }
//             }
//         })]);
//
//
//         const jobIds = signatories.map((job) => job.job_id);
//         // Filter signatories that apply to all employees, regardless of department
//         const getIsApplyToAllSignatory = signatories
//             .filter((item) => item.is_apply_to_all_signatory)
//             .map((job) => job.job_id);
//
//         if (!jobIds.length || !applicant?.ref_departments?.id) {
//             console.log("No Job ID and Applicant")
//             return null
//         }
//         let employeeIds: number[] = [];
//         if (!is_auto_approved) {
//             const empJobDepartment = await prisma.trans_employees.groupBy({
//                 by: ["job_id", "department_id", "id"], where: {
//                     job_id: {
//                         in: jobIds,
//                     }, department_id: applicant.ref_departments.id,
//                 },
//             });
//
//             if (!empJobDepartment.length) {
//                 console.log("No Job Dep")
//                 return null
//             }
//             employeeIds = empJobDepartment.map((record) => record.id);
//         }
//
//         const isAutoApproved = is_auto_approved ? [{job_id: {in: getIsApplyToAllSignatory}}] : [{id: {in: employeeIds}}, {job_id: {in: getIsApplyToAllSignatory}}]
//         const employeeDetails = await prisma.trans_employees.findMany({
//             where: {
//                 AND: isAutoApproved,
//             }, select: {
//                 ...employee_basic_details, ref_departments: {
//                     select: {
//                         id: true, name: true,
//                     },
//                 }, ref_job_classes: {
//                     select: {
//                         id: true, name: true, trans_signatories: {
//                             where: {
//                                 ref_signatory_paths: {
//                                     signatories_path: path
//                                 }, deleted_at: null
//                             }, select: {
//                                 ref_signatory_roles: {
//                                     select: {
//                                         signatory_role_name: true,
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 },
//             },
//         });
//
//         const data = {
//             users: [...employeeDetails.map((employee) => ({
//                 id: String(employee.id),
//                 name: getEmpFullName(employee),
//                 email: employee.email,
//                 picture: employee.picture,
//                 employee_id: employee.id,
//                 role: employee.ref_job_classes?.trans_signatories
//                     .map((signatory) => signatory.ref_signatory_roles?.signatory_role_name)
//                     .filter(Boolean)
//                     .join(", ") || "applicant",
//                 position: employee.ref_job_classes?.name,
//                 department: employee.ref_departments?.name,
//             })),
//                 {
//                     id: applicant.id,
//                     name: getEmpFullName(applicant),
//                     email: applicant.email,
//                     picture: applicant.picture,
//                     position: applicant.ref_job_classes?.name,
//                     department: applicant.ref_departments?.name,
//                     role: "applicant",
//                 }],
//             comments: [], // Add comment data dynamically if applicable
//             evaluators: employeeDetails
//                 .reduce((acc, employee) => {
//                     const roles = employee.ref_job_classes?.trans_signatories.map(
//                         (signatory) => signatory.ref_signatory_roles?.signatory_role_name
//                     );
//
//                     roles?.forEach((role) => {
//                         if (role) {
//                             const matchingSignatory = signatories.find(
//                                 (item) => item.ref_signatory_roles?.signatory_role_name === role
//                             );
//
//                             if (matchingSignatory) {
//                                 acc.push({
//                                     role,
//                                     evaluated_by: employee.id,
//                                     decision: {
//                                         is_decided: is_auto_approved || null,
//                                         rejectedReason: null,
//                                         decisionDate: is_auto_approved ? toGMT8().toISOString() : null,
//                                     },
//                                     order_number: matchingSignatory.order_number,
//                                 });
//                             }
//                         }
//                     });
//
//                     return acc;
//                 }, [] as Evaluator[]) // Ensure the accumulator is of the correct type
//                 .sort((a, b) => a.order_number - b.order_number), // Sort by order_number
//             is_automatic_approved: is_auto_approved,
//         }
//         console.log("Data: ", data)
//         return data
//     } catch (error) {
//         console.log("Error: ", error)
//         return null
//     }
// }
//

type getSignatoriesType = {
    path: string;
    applicant_id: number;
    include_applicant?: boolean;
    is_auto_approved?: boolean;
};
export const getSignatory = async ({ path, applicant_id, include_applicant, is_auto_approved }: getSignatoriesType) => {
    const signatories = (await prisma.trans_signatories.findMany({
        where: {
            ref_signatory_paths: {
                signatories_path: path,
            },
            deleted_at: null,
        },
        select: {
            job_id: true,
            order_number: true,
            is_apply_to_all_signatory: true,
            ref_signatory_roles: {
                select: {
                    signatory_role_name: true,
                }
            }
        },
    })).sort((a,b)=> a.order_number - b.order_number); // Sort Ascending

    const [foundUsers, applicant] = await Promise.all([
        Promise.all(
            signatories.map(sign => 
                prisma.trans_employees.findFirst({
                    where: {
                        job_id: sign.job_id,
                        ...(sign.is_apply_to_all_signatory ? {} : {
                            ref_departments: {
                                trans_employees: {
                                    some: { id: applicant_id },
                                }
                            }
                        })
                    },
                    select: emp_rev_include.minor_detail.select,
                })
            )
        ),
        prisma.trans_employees.findFirst({
            where: { id: applicant_id },
            select: emp_rev_include.minor_detail.select,
        }),
    ]);

    const is_applicant_in_signatory = foundUsers.some(user => user?.id === applicant_id);

    let users:User[]  = [{
        id: applicant!.id,
        department: applicant!.ref_departments?.name ?? "",
        email: applicant!.email ?? "",
        name: getEmpFullName(applicant),
        position: applicant!.ref_job_classes?.name ?? "",
        role: "applicant",
        employee_id: applicant?.id,
        picture: applicant!.picture ?? "",
    }];
    
    let foundApplicantInSignatoryFlag = false;
    foundUsers.filter(user => !!user).forEach(user => {
        if(is_applicant_in_signatory && !foundApplicantInSignatoryFlag){
            if(user.id != applicant_id){
                return;
            }
            foundApplicantInSignatoryFlag = true;
            return;
        }
        users.push({
            id: user.id,
            department: user.ref_departments?.name ?? "",
            email: user.email ?? "",
            name: getEmpFullName(user),
            position: user.ref_job_classes?.name ?? "",
            role: signatories.find(sign=> sign.job_id === user.ref_job_classes?.id)?.ref_signatory_roles?.signatory_role_name ?? ""
        })
    })

    const roleCount = new Map<string, number>();
    let duplicateRole: string | undefined;

    for (const item of signatories) {
        const roleName = item.ref_signatory_roles.signatory_role_name;
        const count = (roleCount.get(roleName) || 0) + 1;
        roleCount.set(roleName, count);
        if (count > 1) {
            duplicateRole = roleName;
            break; // Stop as soon as we find a duplicate
        }
    }

    let evaluators :Evaluator[]= include_applicant ? [{
        decision: {
            decisionDate: null,
            is_decided: null,
            rejectedReason: null,
        },
        evaluated_by: applicant_id,
        order_number: 0,
        role: "Applicant"
    }]:[]

    foundApplicantInSignatoryFlag = false; // Refresh flag for evaluators
    for (const sign of signatories) {
        const user = foundUsers.find(user => user?.ref_job_classes?.id === sign.job_id);
        if (!user) {
            continue;
        }
        if (!include_applicant && user.id === applicant?.id){
            continue;
        }

        if (is_applicant_in_signatory && !foundApplicantInSignatoryFlag) {
            if (user.id !== applicant_id) {
                continue;
            }
            foundApplicantInSignatoryFlag = true;
        }

        evaluators.push({
            decision: {
                decisionDate: null,
                is_decided: null,
                rejectedReason: null,
            },
            evaluated_by: user.id,
            role: sign.ref_signatory_roles.signatory_role_name,
            order_number: sign.order_number,
        });

        if (sign.ref_signatory_roles.signatory_role_name === duplicateRole) {
            break;
        }
    }

    const evaluator_json:Evaluations = {
        users,
        comments: [],
        evaluators,
        is_automatic_approved: is_auto_approved ?? false,
    }

    console.log(evaluator_json);

    return evaluator_json;
};

type User = {
    id: number;
    name: string;
    role: string;
    email: string;
    picture?: string; // Optional as some users may not have a picture
    employee_id?: number; // Optional to account for missing data
    position: string
    department: string
}

interface Evaluator {
    role: string;
    decision: {
        is_decided: boolean | null;
        decisionDate: string | null;
        rejectedReason: string | null;
    };
    evaluated_by: number; // Reference to a user (employee_id)
    order_number: number;
}
