import {PrismaClient} from '@prisma/client';
import address from "../../../../components/common/forms/address/address.json"

export async function seedAddress(prisma: any) {

    // Upsert privileges concurrently
    await prisma.ref_addresses.createMany({
        data: address, // assuming `address` is an array of objects to be inserted
        skipDuplicates: true, // optional: skip any duplicates (if you want to prevent inserting duplicates)
    });

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
