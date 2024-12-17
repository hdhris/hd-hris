import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { toGMT8 } from "../../../../lib/utils/toGMT8";

export async function seedSalaryGrade(prisma: any) {
    console.log("Seeding Salary Grade...");
    const salary_grade = [
        {
            "name": "Entry Level",
            "amount": 14_000,
            "created_at": toGMT8().toISOString(),
            "updated_at": toGMT8().toISOString(),
            "deleted_at": null,
            "rate_per_hour": 20
        }
    ]

    // Upsert privileges concurrently
    await Promise.all(
        salary_grade.map((sg) =>
            prisma.ref_salary_grades.create({
                data: {...sg},
            })
        )
    );

    console.log("Seeding Salary Grade completed successfully.");
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
