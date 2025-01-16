export async function employmentStatus(prisma: any){
    console.log("Creating Employment Status...");
    const employmentStatusData = [
        {
            "id": 1,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "name": "Regular",
            "appraisal_interval": 4,
            "superior_id": null
        },
        {
            "id": 2,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "name": "Probationary",
            "appraisal_interval": 6,
            "superior_id": 23
        }
    ]

    await prisma.ref_employment_status.createMany({
        data: employmentStatusData
    })

    console.log("Finished Employment Status...");
}