export async function signatories(prisma: any){
    console.log("Creating Signatory...");

    const signatoriesData = [
        {
            "job_id": 1,
            "signatory_role_id": 1,
            "signatory_path_id": 1,
            "order_number": 2,
            "updated_at": new Date(),
            "created_at": new Date(),
            "deleted_at": null,
            "is_apply_to_all_signatory": true
        },{
            "job_id": 2,
            "signatory_role_id": 1,
            "signatory_path_id": 1,
            "order_number": 2,
            "updated_at": new Date(),
            "created_at": new Date(),
            "deleted_at": null,
            "is_apply_to_all_signatory": true
        },
        {
            "job_id": 3,
            "signatory_role_id": 2,
            "signatory_path_id": 1,
            "order_number": 2,
            "updated_at": new Date(),
            "created_at": new Date(),
            "deleted_at": null,
            "is_apply_to_all_signatory": false
        }, {

            "job_id": 1,
            "signatory_role_id": 1,
            "signatory_path_id": 2,
            "order_number": 2,
            "updated_at": new Date(),
            "created_at": new Date(),
            "deleted_at": null,
            "is_apply_to_all_signatory": true
        },{
            "job_id": 2,
            "signatory_role_id": 1,
            "signatory_path_id": 2,
            "order_number": 2,
            "updated_at": new Date(),
            "created_at": new Date(),
            "deleted_at": null,
            "is_apply_to_all_signatory": true
        },
        {
            "job_id": 3,
            "signatory_role_id": 2,
            "signatory_path_id": 2,
            "order_number": 2,
            "updated_at": new Date(),
            "created_at": new Date(),
            "deleted_at": null,
            "is_apply_to_all_signatory": false
        },{
            "job_id": 1,
            "signatory_role_id": 1,
            "signatory_path_id": 4,
            "order_number": 2,
            "updated_at": new Date(),
            "created_at": new Date(),
            "deleted_at": null,
            "is_apply_to_all_signatory": true
        },
    ]

    await prisma.trans_signatories.createMany({
        data: signatoriesData
    })

    console.log("Finished Signatory...");

}