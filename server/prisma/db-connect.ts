import prisma from "@/prisma/prisma"
export default async function connectToDatabase() {

    try {
        await prisma.$connect();

        console.log('Database connected successfully!');

    } catch (error) {

        console.error('Failed to connect to database:', error);
        // Handle error globally (e.g., display error message, log to error service)

    }

}
