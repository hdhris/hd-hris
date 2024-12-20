import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedEmploymentStatuses(prisma: any) {
    console.log('Seeding Employment Status...');

    const employmentStatuses = [
        { name: 'Full-Time' },
        { name: 'Part-Time' },
        { name: 'Contract' },
        { name: 'Probation' },
        { name: 'Temporary' },
        { name: 'Intern' },
    ];

    // Use async map for concurrent database writes
    await Promise.all(
        employmentStatuses.map((status) =>
            prisma.ref_employment_status.create({
                data: {
                    name: status.name,
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null,
                },
            })
        )
    );

    console.log('Seeding Employment Status completed successfully.');
}

// // Run the function if executed directly
// if (require.main === module) {
//     seedEmploymentStatuses()
//         .catch((e) => {
//             console.error('Error while seeding ref_employment_status:', e);
//             process.exit(1);
//         })
//         .finally(async () => {
//             await prisma.$disconnect();
//         });
// }
