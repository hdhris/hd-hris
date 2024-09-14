'use client';
import React, { useCallback, useEffect, useState } from "react";
import { Section } from "@/components/common/typography/Typography";
import { SharedSelection, Switch } from "@nextui-org/react";
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { ActionButtons } from "@/components/actions/ActionButton";
import { NotificationConfiguration } from "@/types/routes/default/types";
import fetcher, { axiosInstance } from "@/services/fetcher";
import useSWR from "swr";
import {useSession} from "next-auth/react";

const NotificationSettings: React.FC = () => {
    const session = useSession()
    // Default notification configuration values
    const defaultNotificationConfig: NotificationConfiguration = {
        isAllowEmailNotification: false,
        isAllowPushNotification: false,
        isDoNotDisturb: false,
        notificationSound: '/notification-sounds/default.mp3',
    };

    // Fetch data using SWR
    const { data, isLoading } = useSWR<NotificationConfiguration>(
        `/api/admin/notification/notification-configuration/id/${session.data?.user.employee_id}`,
        fetcher
    );

    // State for notification configuration
    const [notificationConfiguration, setNotificationConfiguration] = useState<NotificationConfiguration>(defaultNotificationConfig);

    // Update state when data is fetched
    useEffect(() => {
        if (data) {
            setNotificationConfiguration(data);
        }
    }, [data]);

    // Notification sound options
    const notifications = [
        { uid: '/notification-sounds/best message.mp3', name: 'Best Message' },
        { uid: '/notification-sounds/huawei bongo notification.mp3', name: 'Huawei Bongo' },
        { uid: '/notification-sounds/I love you message tone.mp3', name: 'I Love You' },
        { uid: '/notification-sounds/Iphone Notification.mp3', name: 'Iphone' },
        { uid: '/notification-sounds/Mario notification.mp3', name: 'Mario' },
        { uid: '/notification-sounds/messenger notification sound.mp3', name: 'Messenger' },
        { uid: '/notification-sounds/Pikachu notification.mp3', name: 'Pikachu' },
        { uid: '/notification-sounds/samsung notification sound.mp3', name: 'Samsung' },
        { uid: '/notification-sounds/whooo.wav', name: 'Whoha' },
        { uid: '/notification-sounds/xiaomi notification.mp3', name: 'Xiaomi' }
    ];

    // Handle notification sound selection
    const handleNotificationSelection = useCallback(async (value: SharedSelection) => {
        await new Audio(value.anchorKey).play();
    }, []);

    // Handle saving notification settings
    const handleOnSave = useCallback(async () => {
        if (notificationConfiguration) {
            const res = await axiosInstance.put('/api/admin/notification', notificationConfiguration);
            console.log(res);
        }
    }, [notificationConfiguration]);

    return (
        <div className="space-y-2">
            <ScrollShadow size={10} className='h-[170px] space-y-4 pr-4 py-2'>
                <Section title='Notification Settings' subtitle='Customize your notification preferences.' />
                <div className='ms-5 space-y-5'>
                    <Section title='Allow Email Notification' subtitle="Opt in to receive notifications via email for updates and alerts.">
                        <Switch
                            size='sm'
                            color="primary"
                            isSelected={notificationConfiguration?.isAllowEmailNotification}
                            onValueChange={(e) => setNotificationConfiguration({
                                ...notificationConfiguration,
                                isAllowEmailNotification: e
                            })}
                        />
                    </Section>

                    <Section title='Allow Push Notifications' subtitle='Enable push notifications to receive alerts.'>
                        <Switch
                            size='sm'
                            color="primary"
                            isSelected={notificationConfiguration?.isAllowPushNotification}
                            onValueChange={(e) => setNotificationConfiguration({
                                ...notificationConfiguration,
                                isAllowPushNotification: e
                            })}
                        />
                    </Section>

                    <Section title='Do Not Disturb' subtitle='Turn on Do Not Disturb to silence notifications during specific times or periods.'>
                        <Switch
                            size='sm'
                            color="primary"
                            isSelected={notificationConfiguration?.isDoNotDisturb}
                            onValueChange={(e) => setNotificationConfiguration({
                                ...notificationConfiguration,
                                isDoNotDisturb: e
                            })}
                        />
                    </Section>

                    <Section title='Notification Sound' subtitle='Choose a sound for your notifications.'>
                        <SelectionMenu
                            placeholder='Select a sound'
                            options={notifications}
                            onSelectionChange={async (value) => {
                                await handleNotificationSelection(value);
                                setNotificationConfiguration({
                                    ...notificationConfiguration,
                                    notificationSound: value.anchorKey!
                                });
                            }}
                            isRequired={false}
                        />
                    </Section>
                </div>
            </ScrollShadow>

            <ActionButtons label="Save" onSave={handleOnSave} />
        </div>
    );
};

export default NotificationSettings;
