import { PrismaClient } from "@prisma/client";
import { withPulse } from '@prisma/extension-pulse/node';

const prismaClientSingleton = () => {
    // return new PrismaClient() //.$extends(withPulse({ apiKey: process.env.PULSE_API_KEY }));
    return new PrismaClient().$extends(withPulse({ apiKey: process.env.PULSE_API_KEY || '' }));
};

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma_server = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma_server;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma_server;
