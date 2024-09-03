'use client'
import React, {useCallback, useState} from 'react';
import {
    Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Selection, TimeInput, TimeInputValue, useDisclosure
} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {Section} from "@/components/common/typography/Typography";
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import {ActionButtons} from "@/components/actions/ActionButton";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";
import {parseAbsoluteToLocal, ZonedDateTime} from "@internationalized/date";
import dayjs from "dayjs";
import {Case, Switch} from "@/components/common/Switch";


function BackupFrequency() {
    const {toast} = useToast()
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure()
    const [timePeriod, setTimePeriod] = useState<Selection>(new Set(['weekly']))
    const [loading, setLoading] = useState<boolean>(false)
    const backupFrequency = [{uid: 'off', name: 'Off'}, {uid: 'daily', name: 'daily'}, {
        uid: 'weekly', name: 'weekly'
    }, {uid: 'monthly', name: 'Monthly'}];

    let [value, setValue] = React.useState<TimeInputValue>(parseAbsoluteToLocal(new Date(dayjs().format('YYYY MM DD hh:mm A')).toISOString()));


    const handleOnSave = useCallback(async () => {
        setLoading(true)
        const backupTime = value instanceof ZonedDateTime ? dayjs(value.toDate ? value.toDate() : value.toString()) : dayjs(value?.toString());
        // console.log(a.format('h:mm A'))
        const values = {
            backupFrequency: Array.from(timePeriod)[0], backupTime: backupTime.format('h:mm A')
        }
        try {
            const res = await axiosInstance.put('/api/admin/backup/frequency', values)
            if (res.status === 200) {
                toast({
                    title: 'Success', description: res.data.message, variant: 'success'
                })
            }
        } catch (err: any) {
            console.log('Error while uploading retention policies. ', err)
            toast({
                title: 'Error', description: err.message, variant: 'danger'
            })
        }
        setLoading(false)
    }, [value, timePeriod, toast])

    return (<>
        <Button size='sm' variant='faded' onPress={onOpen}>Set Up</Button>
        <Modal
            placement='center'
            onOpenChange={onOpenChange}
            isOpen={isOpen}
            size='xl'
            isDismissable={false}
        >
            <ModalContent>
                <ModalHeader>Set Backup Frequency</ModalHeader>
                <ModalBody className='space-y-4'>
                    <Section title='Time Periods'
                             subtitle='Set the timeframes for how long backups are stored.'>
                        <SelectionMenu placeholder='Weekly'
                                       defaultSelectedKeys={['weekly']}
                                       selectedKeys={timePeriod}
                                       options={backupFrequency}
                                       isRequired={false}
                                       onSelectionChange={setTimePeriod}/>
                    </Section>
                    <Section title='Backup Time'
                             className={timePeriod !== 'all' && timePeriod.has('off') ? 'opacity-50 cursor-not-allowed' : ''}
                             subtitle='Specify the time schedule for your backups.'>
                        <TimeInput aria-label='Backup Time' isDisabled={timePeriod !== 'all' && timePeriod.has('off')} value={value} hideTimeZone onChange={setValue}
                                   variant='bordered'/>
                    </Section>
                </ModalBody>
                <ModalFooter>
                    <ActionButtons label='Apply' onCancel={onClose} onSave={handleOnSave} isLoading={loading}/>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>);
}

export default BackupFrequency;