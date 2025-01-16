export async function credential(prisma: any){
    console.log("Credential Credentials");
    await prisma.auth_credentials.create({
        data: {
            username: 'admin',
            password: 'yKURmlV86w3oRh2wDj8iJg==:AgUP0SV4EVIafSOqOxtbqA==',
            created_at: new Date(),
            updated_at: null,
            user_id: '00a29860-665d-4794-88eb-c12d183b76b3',
        }
    })
    console.log("Finished Credentials")
}