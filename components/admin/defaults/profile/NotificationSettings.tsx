'use client'
import React, {useCallback} from "react";
import {Section} from "@/components/common/typography/Typography";
import {SharedSelection, Switch} from "@nextui-org/react";
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import {ScrollShadow} from "@nextui-org/scroll-shadow";

const NotificationSettings: React.FC = () => {
    const notifications = [{
        uid: '/notification-sounds/best message.mp3', name: 'Best Message'
    }, {
        uid: '/notification-sounds/huawei bongo notification.mp3', name: 'Huawei Bongo'
    }, {
        uid: '/notification-sounds/I love you message tone.mp3', name: 'I Love You'
    }, {
        uid: '/notification-sounds/Iphone Notification.mp3', name: 'Iphone'
    }, {
        uid: '/notification-sounds/Mario notification.mp3', name: 'Mario'
    }, {
        uid: '/notification-sounds/messenger notification sound.mp3', name: 'Messenger'
    }, {
        uid: '/notification-sounds/Pikachu notification.mp3', name: 'Pickachu'
    }, {
        uid: '/notification-sounds/samsung notification sound.mp3', name: 'Samsung'
    }, {uid: '/notification-sounds/whooo.wav', name: 'Whoha'}, {
        uid: '/notification-sounds/xiaomi notification.mp3', name: 'Xiaomi'
    }]

    const handleNotificationSelection = useCallback(async (value: SharedSelection) => {
        await new Audio(value.anchorKey).play()
    }, [])
    return (<ScrollShadow size={10} className='h-[200px] space-y-4 pr-4'>
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
                <SelectionMenu placeholder='Best Message' options={notifications}
                               onSelectionChange={handleNotificationSelection} isRequired={false}/>
            </Section>
        </div>
    </ScrollShadow>)
}

export default NotificationSettings