import { Prisma } from "@prisma/client";

export async function job(prisma: any){
    console.log("Creating Job...");
    const jobData = [
        {
            "id": 1,
            "name": "Chief Executive Officer",
            "superior_id": null,
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "max_employees": 1,
            "max_department_instances": 1,
            "is_superior": true,
            "min_salary": 19365,
            "max_salary": 30000,
            "department_id": 1,
        },
        {
            "id": 2,
            "name": "Human Resource Manager",
            "superior_id": null,
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "max_employees": 2,
            "max_department_instances": null,
            "is_superior": true,
            "min_salary": 19365,
            "max_salary": 30000,
            "department_id": 2,
        },
        {
            "id": 3,
            "name": "Immediate Supervisor",
            "superior_id": null,
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "max_employees": null,
            "max_department_instances": 1,
            "is_superior": true,
            "min_salary": 20534,
            "max_salary": 30000,
            "department_id": 3,
        },
        {
            "id": 4,
            "name": "Rank in File",
            "superior_id": null,
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "max_employees": 0,
            "max_department_instances": 0,
            "is_superior": false,
            "min_salary": 0,
            "max_salary": 0,
            "department_id": 2,
        }
    ]
    await prisma.ref_job_classes.createMany({
        data: jobData,
    });

    console.log("Finished Job...");
}