export async function roles(prisma: any){
    console.log("Creating Signatory Roles...");

    const signatory_roles = [
        {
            "id": 1,
            "signatory_role_name": "Approver",
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null
        },
        {
            "id": 2,
            "signatory_role_name": "Reviewer",
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null
        }
    ]

    await prisma.ref_signatory_roles.createMany({
        data: signatory_roles
    })
    console.log("Creating Signatory Roles...");

}