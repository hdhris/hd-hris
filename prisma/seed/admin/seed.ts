import {PrismaClient} from '@prisma/client';
import {user} from "../admin/account/auth/user-seed"
import {privilege} from "../admin/account/auth/privilege"
import {credential} from "../admin/account/auth/credential-seed"
import {accessControl} from "../admin/account/auth/access-control"
import {address} from "../admin/employee/address"
import {branch} from "../admin/employee/branch"
import {departments} from "../admin/employee/departments"
import {employmentStatus} from "../admin/employee/employment-status"
import {job} from "../admin/employee/job"
import {salaryGrade} from "../admin/employee/salary-grade"
import {schedule} from "../admin/employee/schedule"
import {leaveEmploymentStatusTypes} from "../admin/leaves/leave-employment-status-types"
import {leaveTypes} from "../admin/leaves/leave-types"
import {statutoryPlans} from "../admin/benefits/statutory-plans"
import {contributionTable} from "../admin/benefits/contribution-table"
import {payheads} from "../admin/payroll/payheads"
import {notificationTypes} from "../admin/notifications/notification-types"
import {signatories} from "../admin/signatories/signatories"
import {paths} from "../admin/signatories/paths"
import {roles} from "../admin/signatories/roles"
const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeding process...');

    await prisma.$transaction(async (tx) => {
        //auth
        await privilege(tx)
        await user(tx)
        await accessControl(tx)
        await credential(tx)

        //emp
        await address(tx)
        await branch(tx)
        await departments(tx)
        await employmentStatus(tx)
        await job(tx)
        await salaryGrade(tx)
        await schedule(tx)

        //leaves
        await leaveTypes(tx)
        await leaveEmploymentStatusTypes(tx)

        //payheads
        await payheads(tx)

        //benefits
        await statutoryPlans(tx)
        await contributionTable(tx)

        //notifications
        await notificationTypes(tx)

        //signatories
        await roles(tx)
        await paths(tx)
        await signatories(tx)
    }, {
        timeout: 60000
    });

    console.log('Seeding process completed successfully.');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });