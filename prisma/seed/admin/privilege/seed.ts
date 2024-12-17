import { PrismaClient } from '@prisma/client';
import { toGMT8 } from "../../../../lib/utils/toGMT8"; // Adjust path based on your setup

const prisma = new PrismaClient();

export async function seedSysPrivileges(prisma: any) {
    console.log("Seeding System Privileges...");

    // Sample privileges data
    const privileges = [
        {
            name: "Read-Only Access",
            accessibility: {web_access: true, path: []},
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
        },
        {
            name: "HR Management",
            accessibility: {web_access: true, path: []},
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
        },
        {
            name: "Finance Access",
            accessibility: {web_access: true, path: []},
            created_at: toGMT8().toISOString(),
            updated_at: toGMT8().toISOString(),
        },
    ];

    // Upsert privileges concurrently
    await Promise.all(
        privileges.map((privilege) =>
            prisma.sys_privileges.create({
                data: {...privilege },
            })
        )
    );

    console.log("Seeding System Privileges completed successfully.");
}

// Execute the function if the file runs standalone
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
