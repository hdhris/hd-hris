'use client'
import React, {useState} from 'react';
import {Heading, Section} from "@/components/common/typography/Typography";
import {Button} from "@nextui-org/button";
import {Divider} from "@nextui-org/divider";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    SharedSelection,
    Switch,
    useDisclosure
} from '@nextui-org/react';
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import {ActionButtons} from "@/components/actions/ActionButton";
import {FileDropzone, FileState} from '@/components/ui/fileupload/file';
import {useEdgeStore} from "@/lib/edgestore/edgestore";
import {Key} from "@react-types/shared";


const languages = [{uid: 'en', name: 'English'}]
const regions = [{uid: 'ph', name: 'Philippines'}]
const timezones = [{uid: 'cst', name: 'CST • GMT +08'}]
const text_size = [{uid: 'sm', name: 'Small'}, {uid: 'md', name: 'Medium'}, {uid: 'lg', name: 'Large'}]
const notifications = [{uid: '/notification-sounds/notif1.ogg', name: 'Ohh'}, {uid: 'customize', name: 'Customize'}]


const ColumnOne: React.FC = () => (<div className='space-y-4 pr-4'>
    <Section title='Language & Region'
             subtitle='Set your preferred language and regional settings for a personalized experience.'/>
    <div className='ms-5 space-y-5'>
        <Section title='Language Selection' subtitle='Choose your preferred language for a customized experience.'>
            <SelectionMenu label='English' options={languages} isRequired={false}/>
        </Section>
        <Section title='Region Settings' subtitle='Adjust your regional settings for a tailored experience.'>
            <SelectionMenu label='Philippines' options={regions} isRequired={false}/>
        </Section>
        <Divider/>
    </div>
    <Section title='Timezone Settings' subtitle='Set your preferred timezone for accurate date and time display.'/>
    <div className='ms-5 space-y-5'>
        <Section title='Use Device Timezone' subtitle="Automatically detect and use the device's timezone">
            <Switch defaultSelected size='sm' color="primary"/>
        </Section>
        <Section title='Timezone Selection' subtitle='Select your timezone for accurate date and time display.'>
            <SelectionMenu label='CST • GMT +08' options={timezones} isRequired={false}/>
        </Section>
    </div>
</div>);

const ColumnTwo: React.FC = () => {
    const {onClose, onOpen, onOpenChange, isOpen} = useDisclosure()
    const [ringtone, setRingtone] = useState<FileState[]>([])
    const {edgestore} = useEdgeStore();

    const handleNotiificationSelection = async (key: SharedSelection) => {
        if(key.anchorKey === 'customize') {
            onOpen();
        } else {
            let audio = new Audio(key.anchorKey);
            await audio.play();
        }
    }
    function updateFileProgress(key: string, progress: FileState['progress']) {
        setRingtone((fileStates) => {
            const newFileStates = structuredClone(fileStates);
            const fileState = newFileStates.find((fileState) => fileState.key === key,);
            if (fileState) {
                fileState.progress = progress;
            }
            return newFileStates;
        });
    }

    const handleOnClose = React.useCallback(() => {
        setRingtone([])
        onClose();
    }, [onClose])


    return (<>
        <div className='pl-4 space-y-4'>
            <Section title='Accessibility Options'
                     subtitle='Offers features to improve accessibility for users with disabilities or special needs.'/>
            <div className='ms-5 space-y-5'>
                <Section title='Text Size Adjustment' subtitle="Adjust the text size for better readability.">
                    <SelectionMenu label='Medium' options={text_size} isRequired={false}/>
                </Section>
                <Divider/>
            </div>
            <Section title='Notification Settings' subtitle='Customize your notification preferences.'/>
            <div className='ms-5 space-y-5'>
                <Section title='Allow Email Notification'
                         subtitle="Opt in to receive notifications via email for updates and alerts.">
                    <Switch size='sm' color="primary"/>
                </Section>
                <Section title='Allow Push Notifications' subtitle='Enable push notifications to receive alerts.'>
                    <Switch size='sm' color="primary"/>
                </Section>
                <Section title='Do Not Disturb'
                         subtitle='Turn on Do Not Disturb to silence notifications during specific times or periods.'>
                    <Switch size='sm' color="primary"/>
                </Section>
                <Section title='Notification Sound' subtitle='Choose a sound for your notifications.'>
                    {/*<Button size='sm' variant='faded' >Configure</Button>*/}
                    <SelectionMenu label='Medium' options={notifications} onSelectionChange={handleNotiificationSelection} isRequired={false}/>
                </Section>
            </div>
        </div>
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top-center"
        >
            <ModalContent>

                <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
                <ModalBody>
                    <FileDropzone
                        value={ringtone}
                        onChange={setRingtone}
                        onFilesAdded={async (addedFiles) => {
                            setRingtone(addedFiles);
                            await Promise.all(addedFiles.map(async (addedFileState) => {
                                try {
                                    const res = await edgestore.publicFiles.upload({
                                        file: addedFileState.file, onProgressChange: async (progress) => {
                                            updateFileProgress(addedFileState.key, progress);
                                            if (progress === 100) {
                                                // wait 1 second to set it to complete
                                                // so that the user can see the progress bar at 100%
                                                await new Promise((resolve) => setTimeout(resolve, 1000));
                                                updateFileProgress(addedFileState.key, 'COMPLETE');
                                            }
                                        },
                                    });
                                    console.log(res);
                                } catch (err) {
                                    updateFileProgress(addedFileState.key, 'ERROR');
                                }
                            }),);
                        }}
                        dropzoneOptions={{
                            maxFiles: 1,
                            // accept: {'audio': ['.mp3', '.wav', '.mp4a', '.ogg', '.m4r']},
                            // maxSize: 100 * 1024
                        }}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="flat" onPress={handleOnClose}>
                        Close
                    </Button>
                    <Button color="primary" onPress={handleOnClose}>
                        Sign in
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>)
};

function Page() {
    return (<section className='h-full flex flex-col gap-4'>
        <Heading as='h1' className='text-3xl font-bold'>Preferences</Heading>
        <div className='grid grid-cols-2 gap-4 w-full h-4/5'>
            <ColumnOne/>
            <ColumnTwo/>
        </div>
        <ActionButtons label='Apply Changes'/>
    </section>);
}

export default Page;
