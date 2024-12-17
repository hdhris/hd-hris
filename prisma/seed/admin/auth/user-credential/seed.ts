import { PrismaClient } from '@prisma/client';
import { toGMT8 } from "../../../../../lib/utils/toGMT8"; // Adjust path based on your setup

export async function seedAuthCredentials(prisma: any) {
    console.log("Seeding users and credential...");



    await prisma.trans_users.create({
        data:{
            name: 'Admin',
            email: 'admin@example.com',
            emailVerified: toGMT8().toISOString(), // Optional, depending on your app logic
            image: 'https://www.example.com/images/johndoe.png', // Optional field
            createdAt: toGMT8().toISOString(), // Automatically set the creation date
            updatedAt: toGMT8().toISOString(), // Updated timestamp
            preferences: {},
            auth_credentials: {
                create: {
                    username: 'admin',  // Using email as username (could be different)
                    password: "yKURmlV86w3oRh2wDj8iJg==:AgUP0SV4EVIafSOqOxtbqA==",  // Hashing the password
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            },
            acl_user_access_control: {
                create: {
                    created_at: toGMT8().toISOString(), // Automatically set the creation date
                    update_at: toGMT8().toISOString(), // Updated timestamp
                    sys_privileges: {
                        create: {
                            name: "Admin Access",
                            accessibility: {web_access: true, path: []},
                            created_at: toGMT8().toISOString(),
                            updated_at: toGMT8().toISOString(),
                        }
                    }
                }
            }
        }
    })


    console.log("Seeding users and credential completed successfully.");
}

// // Execute the function if the file runs standalone
// if (require.main === module) {
//     seedAuthCredentials()
//         .then(async () => {
//             await prisma.$disconnect();
//         })
//         .catch(async (e) => {
//             console.error("Error seeding auth_credentials:", e);
//             await prisma.$disconnect();
//             process.exit(1);
//         });
// }
