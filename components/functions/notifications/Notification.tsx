'use client'
import React, {useEffect, useRef, useState} from 'react';
import {useNotification} from "@/services/queries";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Bell, Check, Settings} from "lucide-react";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Loading from "@/components/spinner/Loading";
import {formatTimeAgo} from "@/lib/utils/numberFormat";
import {Badge, Button} from "@nextui-org/react";
import {Chip} from "@nextui-org/chip";
import {NotificationList} from "@/components/functions/notifications/received-notifications/received-notification";
import {AnimatedList} from "@/components/ui/animated-list";
import {ScrollArea} from "@/components/ui/scroll-area";
import toast from "react-hot-toast";
import {isEqual} from "lodash";
import {SystemNotification} from "@/types/notifications/notification-types";
import {HiOutlineBellSnooze} from "react-icons/hi2";


function InAppNotification({data, isLoading}: {data: SystemNotification, isLoading: boolean}) {

    const [isOpen, setIsOpen] = useState(false)

    const unreadCount = data?.notifications.filter((n) => !n.is_read).length ?? 0

    return (<Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
            <Button variant="light" isIconOnly size="sm">
                <Badge isInvisible={unreadCount === 0} content={""} color="danger" size="md" shape="circle">
                    <Bell className="size-6"/>
                </Badge>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
            <Card className="border-0 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                            <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                            {unreadCount > 0 && <Chip className="text-xs" color="danger" size="sm">
                                {unreadCount}
                            </Chip>}
                        </div>
                        <Button variant="light" size="sm"
                            // onClick={markAllAsRead}
                        >
                            <Check className="mr-2 h-4 w-4"/>
                            Mark all as read
                        </Button>

                    </div>

                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? <Loading/> :

                            <ScrollArea className="h-[300px] pr-4">
                                {data?.count === 0 ?
                                    <div className="h-[300px] w-full grid place-items-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <HiOutlineBellSnooze className="size-10 text-default-400"/>
                                            <p className="text-medium text-muted-foreground">No notifications yet.</p>
                                        </div>

                                    </div> :  <AnimatedList>
                                        {data?.notifications.map((notification) => (
                                            <NotificationList key={notification.id} src={notification.from.picture}
                                                              name={notification.title} is_unread={!notification.is_read}
                                                              time={formatTimeAgo(notification.timestamp)}/>))}
                                    </AnimatedList>
                                }
                        </ScrollArea>}
                </CardContent>
                <CardFooter className="p-2">
                    <Button variant="light" size="sm"
                        // onClick={openNotificationSettings}
                    >
                       View all notifications
                    </Button>
                    <Button variant="light" size="sm" isIconOnly className="ml-auto mr-2"
                        // onClick={openNotificationSettings}
                    >
                        <Settings className="h-4 w-4"/>
                    </Button>
                </CardFooter>
            </Card>
        </PopoverContent>
    </Popover>);
}

export default InAppNotification;