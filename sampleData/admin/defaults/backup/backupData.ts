import dayjs from "dayjs";
import {getRandomDateTime} from "@/lib/utils/dateFormatter";

export type TableProps = {
    id: number
    backupFiles: string
    timestamps: string
    destination: string
    status: 'success' | 'error' | 'pending' | 'processing'
}

export const backupData: TableProps[] = [{
    id: 1,
    backupFiles: 'Employee Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 2,
    backupFiles: 'Attendance Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 3,
    backupFiles: 'Salary Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 4,
    backupFiles: 'Leave Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}, {
    id: 5,
    backupFiles: 'Payroll Files',
    timestamps: dayjs(getRandomDateTime(new Date('2022-01-01'), new Date('2022-02-01'))).format('YYYY DD MMM hh:mm A'),
    destination: 'Destination',
    status: 'success'
}

]