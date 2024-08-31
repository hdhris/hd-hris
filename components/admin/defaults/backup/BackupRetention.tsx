'use client'
import React, {useCallback, useEffect, useState} from 'react';
import {
    Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Selection, Switch, useDisclosure
} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {Section} from "@/components/common/typography/Typography";
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import {ActionButtons} from "@/components/actions/ActionButton";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";


function BackupRetention() {
    const {toast} = useToast()
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure()
    const [retentionPeriod, setRetentionPeriod] = useState<Selection>(new Set(['weekly']))
    const [isAutoDelete, setIsAutoDelete] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const retentionPeriods = [{uid: 'off', name: 'Off'}, {uid: 'weekly', name: '1 week'}, {
        uid: 'bi-weekly',
        name: '2 weeks'
    }, {uid: 'monthly', name: '1 month'}, {uid: 'quarterly', name: '3 months'}, {
        uid: 'semi-annual',
        name: '6 months'
    }, {uid: 'yearly', name: '1 year'},];

    const handleOnSave = useCallback(async () => {
        setLoading(true)
        const values = {
            retentionPeriod: Array.from(retentionPeriod)[0],
            isAutoDelete
        }
        console.log(values)
        try {
            const res = await axiosInstance.put('/api/admin/backup/retention', values)
            if(res.status === 200){
                toast({
                    title: 'Success',
                    description: res.data.message,
                    variant: 'success'
                })
            }
        }catch (err: any){
            console.log('Error while uploading retention policies. ', err)
            toast({
                title: 'Error',
                description: err.message,
                variant: 'danger'
            })
        }
        setLoading(false)
    }, [retentionPeriod, isAutoDelete, toast])

    return (<>
            <Button size='sm' variant='faded' onPress={onOpen}>Set Retention Policy</Button>
            <Modal
                placement='center'
                onOpenChange={onOpenChange}
                isOpen={isOpen}
                size='xl'
                isDismissable={false}
            >
                <ModalContent>
                    <ModalHeader>Set Retention Policy</ModalHeader>
                    <ModalBody className='space-y-4'>
                        <Section title='Retention Period'
                                 subtitle='Set how long backups are kept before being deleted.'>
                            <SelectionMenu placeholder='Weekly'
                                           defaultSelectedKeys={['weekly']}
                                           selectedKeys={retentionPeriod}
                                           options={retentionPeriods}
                                           isRequired={false}
                                           onSelectionChange={setRetentionPeriod}/>
                        </Section>
                        <Section title='Auto-Deletion'
                                 subtitle='Automatically delete backups that exceed the retention period.'>
                            <Switch isSelected={isAutoDelete} onValueChange={setIsAutoDelete} size='sm' color="primary"/>
                        </Section>
                    </ModalBody>
                    <ModalFooter>
                        <ActionButtons label='Apply' onCancel={onClose} onSave={handleOnSave} isLoading={loading}/>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>);
}

export default BackupRetention;