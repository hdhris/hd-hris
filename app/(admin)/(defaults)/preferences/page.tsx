'use client'
import React, {useCallback} from 'react';
import {Heading, Section} from "@/components/common/typography/Typography";
import {Divider} from "@nextui-org/divider";
import {SharedSelection, Switch} from '@nextui-org/react';
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import {ActionButtons} from "@/components/actions/ActionButton";


const languages = [{uid: 'en', name: 'English'}]
const regions = [{uid: 'ph', name: 'Philippines'}]
const timezones = [{uid: 'cst', name: 'CST • GMT +08'}]
const text_size = [{uid: 'sm', name: 'Small'}, {uid: 'md', name: 'Medium'}, {uid: 'lg', name: 'Large'}]
const notifications = [{
    uid: '/notification-sounds/best message.mp3',
    name: 'Best Message'
}, {
    uid: '/notification-sounds/huawei bongo notification.mp3',
    name: 'Huawei Bongo'
}, {
    uid: '/notification-sounds/I love you message tone.mp3',
    name: 'I Love You'
}, {
    uid: '/notification-sounds/Iphone Notification.mp3',
    name: 'Iphone'
}, {
    uid: '/notification-sounds/Mario notification.mp3',
    name: 'Mario'
}, {
    uid: '/notification-sounds/messenger notification sound.mp3',
    name: 'Messenger'
}, {
    uid: '/notification-sounds/Pikachu notification.mp3',
    name: 'Pickachu'
}, {
    uid: '/notification-sounds/samsung notification sound.mp3',
    name: 'Samsung'
}, {uid: '/notification-sounds/whooo.wav', name: 'Whoha'}, {
    uid: '/notification-sounds/xiaomi notification.mp3',
    name: 'Xiaomi'
}]


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
    const handleNotificationSelection = useCallback((value: SharedSelection) => {
        new Audio(value.anchorKey).play()
    }, [])
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
                    <SelectionMenu label='Best Message' options={notifications}
                                   onSelectionChange={handleNotificationSelection} isRequired={false}/>
                </Section>
            </div>
        </div>
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
