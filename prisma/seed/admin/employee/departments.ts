
export async function departments(prisma: any) {
    console.log("Creating Departments...");
    const departmentData = [
        {
            "id": 1,
            "name": "Executive",
            "color": "#4f46e5",
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null
        },
        {
            "id": 2,
            "name": "Human Resource",
            "color": "#4f46e5",
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null
        },
        {
            "id": 3,
            "name": "Sales",
            "color": "#33C4FF",
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null
        }

    ]

    await prisma.ref_departments.createMany({
        data: departmentData
    })

    console.log("Finished Departments...");
}