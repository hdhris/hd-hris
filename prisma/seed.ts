import prisma from "./prisma";


async function main() {
    await prisma.sys_privileges.createMany({
        data: [
            {
                accessibility: JSON.stringify({ /* your JSON data */ }),
                name: 'Privilege 1',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
            },
            {
                accessibility: JSON.stringify({ /* your JSON data */ }),
                name: 'Privilege 2',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
            },
            // Add more entries as needed
        ],
    });

    console.log('Data seeded');
}

main()
    .catch(e => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
