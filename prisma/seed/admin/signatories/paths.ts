export async function paths(prisma: any) {
    console.log("Creating Signatory Path...");

    const signatory_paths = [{
        "id": 1,
        "signatories_path": "/overtime/requests",
        "created_at": new Date(),
        "updated_at": new Date(),
        "signatories_name": "Overtime"
    }, {
        "id": 2,
        "signatories_path": "/leaves/leave-requests",
        "created_at": new Date(),
        "updated_at": new Date(),
        "signatories_name": "Leave Request"
    }, {

        "id": 3,
        "signatories_path": "/reports",
        "created_at": new Date(),
        "updated_at": new Date(),
        "signatories_name": "Reports"
    }, {
        "id": 4,
        "signatories_path": "/payroll/cash-advance",
        "created_at": new Date(),
        "updated_at": new Date(),
        "signatories_name": "Cash Advance"
    }]

    await prisma.ref_signatory_paths.createMany({
        data: signatory_paths
    })

    console.log("Finished Signatory Path...");

}