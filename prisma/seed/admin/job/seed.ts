import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedJobClasses(prisma: any) {
    console.log('Seeding Job Classes...');

    const jobClasses = [
        {
            name: 'CEO',
            superior_id: null,
            is_active: true,
            is_superior: true,
            max_employees: 1,
            max_department_instances: 1,
        },
        {
            name: 'Human Resource Manager',
            superior_id: null,
            is_active: true,
            is_superior: true,
            max_employees: 1,
            max_department_instances: 1,
        },
        {
            name: 'Immediate Superior',
            superior_id: null,
            is_active: true,
            is_superior: true,
            max_employees: null,
            max_department_instances: 1,
        }
    ];

    // Use Promise.all with map for concurrent writes
    await Promise.all(
        jobClasses.map((jobClass) =>
            prisma.ref_job_classes.create({
                data: {
                    name: jobClass.name,
                    superior_id: jobClass.superior_id,
                    is_active: jobClass.is_active,
                    is_superior: jobClass.is_superior,
                    max_employees: jobClass.max_employees,
                    max_department_instances: jobClass.max_department_instances,
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null,
                },
            })
        )
    );

    console.log('Seeding Job Classes completed successfully.');
}
//
// // Run the function if executed directly
// if (require.main === module) {
//     seedJobClasses()
//         .catch((e) => {
//             console.error('Error while seeding ref_job_classes:', e);
//             process.exit(1);
//         })
//         .finally(async () => {
//             await prisma.$disconnect();
//         });
// }
