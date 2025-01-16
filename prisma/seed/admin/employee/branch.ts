export async function branch(prisma: any){
    console.log("Creating Branch...");
    const branchData = [
        {
            "id": 1,
            "name": "Koronadal Branch",
            "addr_region": 12,
            "addr_province": 1263,
            "addr_municipal": 126306,
            "addr_baranggay": 126306018,
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null
        },
        {
            "id": 2,
            "name": "Gensan Branch",
            "addr_region": 12,
            "addr_province": 1263,
            "addr_municipal": 126303,
            "addr_baranggay": 126303004,
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null
        }
    ]
    await prisma.ref_branches.createMany({
        data: branchData,
    });

    console.log("Finished Branch...");
}