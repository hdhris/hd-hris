import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create some users
    const user1 = await prisma.user.create({
        data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '1234567890',
            picture: 'https://example.com/john.png',
            accounts: {
                create: [
                    {
                        username: 'john.doe',
                        provider: 'credentials',
                        providerAccountId: 'john.doe@example.com',
                        type: 'credentials',
                        password: "7tUlw+Az1jzLbUsDU8qBQ9pATGxA1omv",
                        privilege: 'FULL_ACCESS',
                        role: 'ADMIN',
                        sessions: {
                            create: {
                                sessionToken: 'abc123',
                                expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // expires in 1 day
                                ipAddress: '192.168.1.1'
                            }
                        },
                        authenticators: {
                            create: {
                                credentialID: 'authID123',
                                credentialPublicKey: 'publicKey123',
                                counter: 1,
                                credentialDeviceType: 'single-device',
                                credentialBackedUp: true
                            }
                        }
                    }
                ]
            }
        }
    });

    const user2 = await prisma.user.create({
        data: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            picture: 'https://example.com/jane.png',
            accounts: {
                create: [
                    {
                        username: 'jane.smith',
                        provider: 'credentials',
                        providerAccountId: 'jane.smith@example.com',
                        type: 'credentials',
                        password: "I9RkMXml3ine+xIQW7M3V5fyPfsY4W8V",
                        privilege: 'LIMITED_ACCESS',
                        role: 'USER',
                        sessions: {
                            create: {
                                sessionToken: 'def456',
                                expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
                                ipAddress: '192.168.1.2'
                            }
                        }
                    }
                ]
            }
        }
    });

    console.log({ user1, user2 });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
