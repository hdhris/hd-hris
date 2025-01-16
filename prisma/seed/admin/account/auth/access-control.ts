export async function accessControl(prisma: any){

    console.log("Creating Access Control");
    await prisma.acl_user_access_control.create({
        data: {
            employee_id: null,
            privilege_id: 5,
            banned_til: null,
            created_at: new Date(),
            update_at: null,
            user_id: '00a29860-665d-4794-88eb-c12d183b76b3',
        },
    });
    console.log("Finished Access Control");
}