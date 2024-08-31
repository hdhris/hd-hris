import {NextResponse} from "next/server";
import {BackupEntry} from "@/types/routes/default/types";

const dummyData:BackupEntry[] = [
    { id: 1, date: '2024-08-31', time: '08:30 AM', type: 'Full Backup', size: '2.5 GB', status: 'Completed' },
    { id: 2, date: '2024-08-30', time: '07:45 AM', type: 'Incremental', size: '750 MB', status: 'Completed' },
    { id: 3, date: '2024-08-29', time: '09:10 AM', type: 'Differential', size: '1.2 GB', status: 'Completed' },
    { id: 4, date: '2024-08-28', time: '06:00 AM', type: 'Full Backup', size: '3.0 GB', status: 'Failed' },
    { id: 5, date: '2024-08-27', time: '10:30 AM', type: 'Incremental', size: '500 MB', status: 'Completed' },
    { id: 6, date: '2024-08-26', time: '11:45 AM', type: 'Differential', size: '1.0 GB', status: 'Completed' },
    { id: 7, date: '2024-08-25', time: '08:15 AM', type: 'Full Backup', size: '2.8 GB', status: 'Completed' },
    { id: 8, date: '2024-08-24', time: '09:00 AM', type: 'Incremental', size: '600 MB', status: 'Completed' },
    { id: 9, date: '2024-08-23', time: '07:30 AM', type: 'Differential', size: '1.1 GB', status: 'Completed' },
    { id: 10, date: '2024-08-22', time: '10:45 AM', type: 'Full Backup', size: '2.6 GB', status: 'Completed' },
    { id: 11, date: '2024-08-21', time: '08:00 AM', type: 'Incremental', size: '700 MB', status: 'Failed' },
    { id: 12, date: '2024-08-20', time: '07:15 AM', type: 'Differential', size: '1.3 GB', status: 'Completed' },
    { id: 13, date: '2024-08-19', time: '06:45 AM', type: 'Full Backup', size: '2.9 GB', status: 'Completed' },
    { id: 14, date: '2024-08-18', time: '09:30 AM', type: 'Incremental', size: '550 MB', status: 'Completed' },
    { id: 15, date: '2024-08-17', time: '11:00 AM', type: 'Differential', size: '1.2 GB', status: 'Completed' },
    { id: 16, date: '2024-08-16', time: '07:00 AM', type: 'Full Backup', size: '3.1 GB', status: 'Failed' },
    { id: 17, date: '2024-08-15', time: '10:15 AM', type: 'Incremental', size: '620 MB', status: 'Completed' },
    { id: 18, date: '2024-08-14', time: '09:45 AM', type: 'Differential', size: '1.0 GB', status: 'Completed' },
    { id: 19, date: '2024-08-13', time: '08:00 AM', type: 'Full Backup', size: '2.7 GB', status: 'Completed' },
    { id: 20, date: '2024-08-12', time: '06:30 AM', type: 'Incremental', size: '580 MB', status: 'Completed' },
];


export async function GET(){
    try{
        return NextResponse.json(dummyData)
    } catch (e: any){
        return NextResponse.error()
    }
}