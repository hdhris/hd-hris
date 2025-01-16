export async function salaryGrade(prisma: any){
    console.log("Creating Salary Grade...");
    const salary_grade = [
        {
            "id": 1,
            "name": "SG1",
            "amount": 18255,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "rate_per_hour": 0
        },
        {
            "id": 2,
            "name": "SG2",
            "amount": 19365,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "rate_per_hour": 0
        },
        {
            "id": 3,
            "name": "SG3",
            "amount": 20534,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "rate_per_hour": 0
        },
        {
            "id": 4,
            "name": "SG4",
            "amount": 22219,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "rate_per_hour": 0
        }
    ]


    await prisma.ref_salary_grades.createMany({
        data: salary_grade
    })

    console.log("Finished Salary Grade...");
}