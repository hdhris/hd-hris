'use client'
import React, { useState } from 'react';
import { Heading, Section } from "@/components/common/typography/Typography";
import { Switch, Tab, Tabs } from '@nextui-org/react';
import { Card, CardBody } from "@nextui-org/card";
import { LuCalendarRange, LuCloud, LuDatabase } from "react-icons/lu";
import Text from "@/components/Text";
import BorderCard from "@/components/common/BorderCard";
import { Avatar } from "@nextui-org/avatar";
import RenderList from "@/components/util/RenderList";

const ColumnOne: React.FC = () => {
    const [selected, setSelected] = useState("all");
    const items = [{
        key: "tidb",
        avatarSrc: "https://static.pingcap.com/files/2023/07/09063705/TiDB-logo.png",
        title: 'TiDB',
        subtitle: 'an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics',
    }, {
        key: "zkteco",
        avatarSrc: "https://logovectorseek.com/wp-content/uploads/2020/04/zkteco-logo-vector.png",
        title: 'ZKTeco',
        subtitle: 'globally renowned provider of biometric verification algorithm techniques, sensors and software platforms.',
    }, {
        key: "cloudinary",
        avatarSrc: "https://storage.googleapis.com/clean-finder-353810/$HRokgbx8Dplf8fWi1w8E2hyYx6qmhxmXMIQqXvvaNYeZr84881PBxe",
        title: 'Cloudinary',
        subtitle: 'an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics',
    }, {
        key: "cloudinary",
        avatarSrc: "https://storage.googleapis.com/clean-finder-353810/$HRokgbx8Dplf8fWi1w8E2hyYx6qmhxmXMIQqXvvaNYeZr84881PBxe",
        title: 'Cloudinary',
        subtitle: 'an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics',
    }, {
        key: "cloudinary",
        avatarSrc: "https://storage.googleapis.com/clean-finder-353810/$HRokgbx8Dplf8fWi1w8E2hyYx6qmhxmXMIQqXvvaNYeZr84881PBxe",
        title: 'Cloudinary',
        subtitle: 'an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics',
    }, {
        key: "cloudinary",
        avatarSrc: "https://storage.googleapis.com/clean-finder-353810/$HRokgbx8Dplf8fWi1w8E2hyYx6qmhxmXMIQqXvvaNYeZr84881PBxe",
        title: 'Cloudinary',
        subtitle: 'an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics',
    },];

    return (
        <div className='space-y-4 pr-4'>
            <Section
                title='Third-Party Services'
                subtitle='Link your account with third-party services for extended functionality.'
            />
            <div className='ms-16 space-y-5'>
                <Tabs
                    aria-label="Integrations"
                    selectedKey={selected}
                    onSelectionChange={(key) => setSelected(key as string)}
                >
                    <Tab key="all" title="All">
                        <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
                            <RenderList items={items}
                                        map={(item, key) => (
                                            <BorderCard heading='' className='w-full' key={key}>
                                                <div className='flex items-center'>
                                                    <div className='flex-shrink-0'>
                                                        <Avatar
                                                            src={item.avatarSrc}
                                                            size='md'
                                                        />
                                                    </div>
                                                    <Section
                                                        className='ms-2 flex-1'
                                                        classNames={{
                                                            subHeading: 'text-ellipsis'
                                                        }}
                                                        title={item.title}
                                                        subtitle={item.subtitle}
                                                    >
                                                        <Switch defaultSelected size='sm' color="primary"/>
                                                    </Section>
                                                </div>
                                            </BorderCard>
                                        )}
                            />
                        </div>

                    </Tab>
                    <Tab key="database" title={<div className="flex flex-row items-center space-x-2">
                        <LuDatabase/>
                        <Text>Database</Text>
                    </div>}>
                        <Card>
                            <CardBody>
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                                commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                                dolore eu fugiat nulla pariatur.
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="cloud_storage" title={<div className="flex flex-row items-center space-x-2">
                        <LuCloud/>
                        <Text>Cloud Storage</Text>
                    </div>}>
                        <Card>
                            <CardBody>
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                                mollit anim id est laborum.
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="attendance_monitoring" title={<div className="flex flex-row items-center space-x-2">
                        <LuCalendarRange />
                        <Text>Attendance Monitoring</Text>
                    </div>}>
                        <Card>
                            <CardBody>
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                                mollit anim id est laborum.
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
};

function Page() {
    return (
        <section className='h-full flex flex-col gap-4 w-full'>
            <Heading as='h1' className='text-3xl font-bold'>Integrations</Heading>
            <div className='flex flex-wrap gap-4 w-full h-4/5'>
                <ColumnOne />
            </div>
        </section>
    );
}

export default Page;
