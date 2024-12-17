import { PrismaClient } from '@prisma/client';
import { toGMT8 } from "../../../../lib/utils/toGMT8";
export async function seedBranches(prisma: any) {
    console.log("Seeding Branch...");
    const branch = [
        {
            "name": "Koronadal",
            "addr_region": 12,
            "addr_province": 1263,
            "addr_municipal": 126306,
            "addr_baranggay": 126306018,
            "is_active": true,
            "created_at": toGMT8().toISOString(),
            "updated_at": toGMT8().toISOString(),
            "deleted_at": null
        }
    ]

    // Upsert privileges concurrently
    await Promise.all(
        branch.map((branch) =>
            prisma.ref_branches.create({
                data: {...branch},
            })
        )
    );

    console.log("Seeding Branch completed successfully.");
}

// // Execute the function if the file runs standalone
// if (require.main === module) {
//     seedSysPrivileges()
//         .then(async () => {
//             await prisma.$disconnect();
//         })
//         .catch(async (e) => {
//             console.error("Error seeding sys_privileges:", e);
//             await prisma.$disconnect();
//             process.exit(1);
//         });
// }
