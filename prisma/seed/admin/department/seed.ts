import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDepartments(prisma: any) {
    console.log('Seeding Departments...');

    const departments = [
        { name: 'Sales', color: '#FF5733', is_active: true },
        { name: 'Warehouse', color: '#33C4FF', is_active: true },
        { name: 'Logistics', color: '#33FF57', is_active: true },
        { name: 'Cabinet', color: '#FFC300', is_active: true },
        { name: 'Accounting', color: '#FF33A8', is_active: true },
        { name: 'Admin', color: '#A833FF', is_active: true },
    ];

    // Use async map for concurrent database writes
    await Promise.all(
        departments.map((department) =>
            prisma.ref_departments.create({
                data: {
                    name: department.name,
                    color: department.color,
                    is_active: department.is_active,
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null,
                },
            })
        )
    );

    console.log('Departments seeded successfully.');
}

// // Run the function if executed directly
// if (require.main === module) {
//     seedDepartments()
//         .catch((e) => {
//             console.error('Error while seeding:', e);
//             process.exit(1);
//         })
//         .finally(async () => {
//             await prisma.$disconnect();
//         });
// }
