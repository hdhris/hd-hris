export async function user(prisma: any){
    console.log("Creating User");
    await prisma.trans_users.create({
        data: {
            id: '00a29860-665d-4794-88eb-c12d183b76b3',
            name: 'Admin',
            email: 'admin@gmail.com',
            emailVerified: null,
            image: 'https://files.edgestore.dev/6bc0cgi3ynpz46db/publicFiles/_public/7f0e37fb-e9f5-4f09-8047-ce3b33d53904.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: {},
        },
    });
    console.log("Finished User");
}