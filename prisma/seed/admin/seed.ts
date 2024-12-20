import { PrismaClient } from '@prisma/client';
import { seedDepartments } from './department/seed';
import { seedEmploymentStatuses } from './employee_status/seed';
import { seedJobClasses } from './job/seed';
import { seedPayheads } from './payroll/payheads/payhead-seeder';
import { seedSysPrivileges } from './privilege/seed';
import { seedAuthCredentials } from './auth/user-credential/seed';
import { seedBranches } from "./branch/seed";
import { seedAddress } from "./address/seed";
import { seedSalaryGrade } from "./salary-grade/seed";
import { seedSchedule } from "./schedule/seed";
import { seedLeaveTypes } from "./leaves/leave-types/leave-type-seeder";
import { seedNotificationTypes } from "./notification-types/seed";

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seeding...');

    try {
        // Start a transaction
        await prisma.$transaction(async (prisma) => {
            // Execute each seeder sequentially within the transaction
            await seedAuthCredentials(prisma);
            await seedBranches(prisma);
            await seedAddress(prisma);
            await seedSchedule(prisma);
            await seedSalaryGrade(prisma);
            await seedLeaveTypes(prisma);
            await seedSysPrivileges(prisma);
            await seedDepartments(prisma);
            await seedEmploymentStatuses(prisma);
            await seedJobClasses(prisma);
            await seedPayheads(prisma);
            await seedNotificationTypes(prisma);
        }, {timeout: 10000});

        console.log('🎉 All seeders completed successfully.');
    } catch (e) {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
