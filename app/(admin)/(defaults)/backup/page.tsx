import React from 'react';
import Title from "@/components/common/typography/Title";
import {Heading} from "@/components/common/typography/Text";
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import {Button} from "@nextui-org/button";
import {Divider} from "@nextui-org/divider";


const backupFrequencyOptions = [{
    uid: '1', name: 'Daily',
}, {
    uid: '2', name: 'Weekly',
}, {
    uid: '3', name: 'Monthly',
}, {
    uid: '4', name: 'Yearly',
},]
const backupSelectionOptions = [{
    uid: '1', name: 'All',
}, {
    uid: '2', name: 'Employee',
}, {
    uid: '3', name: 'Attendance',
}, {
    uid: '4', name: 'Salary',
},]

function Page() {
    return (<section className='space-y-5'>
        <Heading as='h1' className='text-3xl font-bold'>Data Backup</Heading>
        <div className='grid grid-cols-2 gap-4 w-full'>
            <div className='ms-5 space-y-5'>
                <Title heading='Backup Settings'
                       subHeading='Ensure your information is safe with regular data backups.'/>
                <div className='ms-10 space-y-5'>
                    <Title heading='Backup Frequency' subHeading='Set how often your data is backed up.'>
                        <SelectionMenu label='Weekly' options={backupFrequencyOptions} isRequired={false}/>
                    </Title>

                    <Title heading='Backup Locations' subHeading='Choose where your backups are stored.'>
                        <Button size='sm' variant='faded'>Configure</Button>
                    </Title>
                    <Title heading='Data Selection' subHeading='Select which data to include in backups.'>
                        <SelectionMenu label='All' options={backupSelectionOptions} isRequired={false}/>
                    </Title>
                </div>
                <Divider/>
                <Title heading='Backup Management'
                       subHeading='Manage your backup settings and storage options.'/>
                <div className='ms-10 space-y-5'>
                    <Title heading='Manual Backup' subHeading='Initiate a manual data backup at any time.'>
                        <Button size='sm' variant='faded'>Backup Now</Button>
                    </Title>
                    <Title heading='Scheduled Backups' subHeading='Set up automatic backups on a regular schedule.'>
                        <Button size='sm' variant='faded'>Configure</Button>
                    </Title>

                </div>

            </div>
            <div className='space-y-5'>
                <Title heading='Restore Management'
                       subHeading='Manage and restore data from backups when needed.'/>
                <div className='ms-10 space-y-5'>
                    <Title heading='Restore Options'
                           subHeading='Choose from various restore options to recover your data.'>
                        <Button size='sm' variant='faded' as='label' htmlFor='dropzone-file'>
                            <input id="dropzone-file"
                                   type="file"
                                   name='pic'
                                   className="hidden"
                                   accept="image/*"
                                // onChange={(e) => {
                                // const files = e.target.files;
                                // if (!files || files.length === 0) {
                                //     setFileError("No file selected")
                                //     return;
                                // }
                                //
                                // const file = files[0];
                                //
                                // // Validate file size up to 5MB
                                // if (file.size > 1024 * 1024 * 5) {
                                //     setFileError("File size must be less than 5MB")
                                //     return
                                // }
                                //
                                // // File is valid, continue with your logic
                                // setImage(file && URL.createObjectURL(file))
                                //}}
                            />
                            Upload
                        </Button>
                    </Title>

                </div>
            </div>
        </div>
    </section>);
}

export default Page;