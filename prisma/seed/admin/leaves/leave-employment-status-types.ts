export async function leaveEmploymentStatusTypes(prisma: any){
    console.log("Creating Employment Status Leave Types...");
    const leave_employment_status = [
        {
            "leave_type_details_id": 1,
            "employment_status_id": 1,
            "created_at": new Date(),
            "updated_at": new Date(),
        },
        {
            "leave_type_details_id": 2,
            "employment_status_id": 1,
            "created_at": new Date(),
            "updated_at": new Date(),
        },{
            "leave_type_details_id": 2,
            "employment_status_id": 2,
            "created_at": new Date(),
            "updated_at": new Date(),
        },
        {
            "leave_type_details_id": 3,
            "employment_status_id": 1,
            "created_at": new Date(),
            "updated_at": new Date(),
        }, {
            "leave_type_details_id": 3,
            "employment_status_id": 2,
            "created_at": new Date(),
            "updated_at": new Date(),
        },
        {
            "leave_type_details_id": 4,
            "employment_status_id": 1,
            "created_at": new Date(),
            "updated_at": new Date(),
        }, {
            "leave_type_details_id": 4,
            "employment_status_id": 2,
            "created_at": new Date(),
            "updated_at": new Date(),
        },
        {
            "leave_type_details_id": 5,
            "employment_status_id": 1,
            "created_at": new Date(),
            "updated_at": new Date(),
        },{
            "leave_type_details_id": 5,
            "employment_status_id": 2,
            "created_at": new Date(),
            "updated_at": new Date(),
        },
        {
            "leave_type_details_id": 6,
            "employment_status_id": 1,
            "created_at": new Date(),
            "updated_at": new Date(),
        }, {
            "leave_type_details_id": 6,
            "employment_status_id": 2,
            "created_at": new Date(),
            "updated_at": new Date(),
        },
    ]

    await prisma?.trans_leave_types.createMany({
        data: leave_employment_status
    })
    console.log("Finished Employment Status Leave Types...");
}