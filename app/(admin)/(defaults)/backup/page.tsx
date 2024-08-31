'use client'
import React from 'react';
import {Heading, Section} from "@/components/common/typography/Typography";
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import {Button} from "@nextui-org/button";
import BackupFiles from "@/components/admin/defaults/backup/BackupFiles";
import {Chip, cn} from '@nextui-org/react';
import BorderCard from "@/components/common/BorderCard";


const backupFrequencyOptions = [{uid: '1', name: 'Daily'}, {uid: '2', name: 'Weekly'}, {
    uid: '3', name: 'Monthly'
}, {uid: '4', name: 'Yearly'},];

const backupSelectionOptions = [{uid: '1', name: 'All'}, {uid: '2', name: 'Employee'}, {
    uid: '3', name: 'Attendance'
}, {uid: '4', name: 'Salary'},];


const BackupSettings: React.FC = () => {
    return (<div className='space-y-4 pr-4'>
        <Section title='Backup Settings' subtitle='Ensure your information is safe with regular data backups.'/>
        <div className='ms-5 space-y-5'>
            <Section title='Backup Frequency' subtitle='Set how often your data is backed up.'>
                <SelectionMenu label='Weekly' options={backupFrequencyOptions} isRequired={false}/>
            </Section>
            <Section title='Data Selection' subtitle='Select which data to include in backups.'>
                <Button size='sm' variant='faded'>Configure</Button>
            </Section>
        </div>

    </div>)
};

const RestoreManagement: React.FC = () => (<div className='pl-4 space-y-4'>
    {/*<Section title='Backup Management' subtitle='Manage your backup settings and storage options.'/>*/}
    {/*<div className='ms-5 space-y-5'>*/}
    {/*    <Section title='Manual Backup' subtitle='Initiate a manual data backup at any time.'>*/}

    {/*        <Button size='sm' variant='faded'>Backup Now</Button>*/}
    {/*    </Section>*/}
    {/*    <Section title='Scheduled Backups' subtitle='Set up automatic backups on a regular schedule.'>*/}
    {/*        <Button size='sm' variant='faded'>Configure</Button>*/}
    {/*    </Section>*/}
    {/*</div>*/}
    <Section title='Restore Management' subtitle='Manage and restore data from backups when needed.'/>
    <div className='ms-5 space-y-5'>
        <Section title='Restore Options' subtitle='Choose from various restore options to recover your data.'>
            <Button size='sm' variant='faded' as='label' htmlFor='dropzone-file'>
                <input
                    id='dropzone-file'
                    type='file'
                    name='pic'
                    className='hidden'
                    accept='image/*'
                />
                Upload
            </Button>
        </Section>
        {/*<BorderCard className='p-2'>*/}
        {/*    <div className='h-80 overflow-hidden'>*/}
        {/*        <BackupFiles/>*/}
        {/*    </div>*/}
        {/*</BorderCard>*/}
    </div>
</div>);

function Page() {
    return (<section className='h-full flex flex-col gap-4 w-full'>
        <Heading as='h1' className='text-3xl font-bold'>Data Backup</Heading>
        <div className='grid grid-cols-2 gap-4 w-full h-4/5'>
            <BackupSettings/>
            <RestoreManagement/>
        </div>
        <div className='flex flex-col gap-2'>
            <div className='flex justify-between'>
                <Section title='Backup History' subtitle='' className='ms-2' classNames={{
                    heading: 'text-lg'
                }}/>
                {/*
                TODO:

                */}
                <Chip color='success' variant='dot' className={cn('border-success')}>Last backup completed successfully on June 15, 2023</Chip>
            </div>

            <BorderCard className='p-2'>
                <div className='h-80 overflow-hidden'>
                    <BackupFiles/>
                </div>
            </BorderCard>
        </div>
    </section>);
}

export default Page;
