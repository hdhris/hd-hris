import { PrismaClient } from '@prisma/client';
import { toGMT8 } from "../../../../lib/utils/toGMT8";

export async function seedSchedule(prisma: any) {
    console.log("Seeding Schedule...");
    const sched = [
        {
            "name": "Batch Closing",
            "clock_in": toGMT8("09:00:00").toISOString(),
            "clock_out": toGMT8("18:30:00").toISOString(),
            "is_active": true,
            "created_at": toGMT8().toISOString(),
            "updated_at": toGMT8().toISOString(),
            "deleted_at": null,
            "break_min": 60
        },
        {
            "name": "Batch Opening",
            "clock_in": toGMT8("08:00:00").toISOString(),
            "clock_out": toGMT8("17:00:00").toISOString(),
            "is_active": true,
            "created_at": toGMT8().toISOString(),
            "updated_at": toGMT8().toISOString(),
            "deleted_at": null,
            "break_min": 60
        }
    ]

    // Upsert privileges concurrently
    await Promise.all(
        sched.map((sc) =>
            prisma.ref_batch_schedules.create({
                data: {...sc},
            })
        )
    );

    console.log("Seeding Schedule completed successfully.");
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
