'use client'
import React, {useState} from 'react';
import {Heading, Section} from "@/components/common/typography/Typography";
import {Switch, Tab, Tabs} from '@nextui-org/react';
import {Card, CardBody} from "@nextui-org/card";
import {LuCalendarRange, LuCloud, LuDatabase} from "react-icons/lu";
import Text from "@/components/Text";
import BorderCard from "@/components/common/BorderCard";
import {Avatar} from "@nextui-org/avatar";


const ColumnOne: React.FC = () => {
    const [selected, setSelected] = useState("all");
    return <div className='space-y-4 pr-4'>
        <Section title='Third-Party Services'
                 subtitle='Link your account with third-party services for extended functionality.'
        />

        <div className='ms-16 space-y-5 h-[250px] overflow-hidden'>
            <Tabs
                aria-label="Integrations"
                selectedKey={selected}
                onSelectionChange={(key) => setSelected(key as string)}
            >
                <Tab key="all" title="All">
                    <div className='grid grid-cols-3 gap-4'>
                        <BorderCard heading='' className='w-[440px]'>
                            <div className='flex justify-between'>
                                <div>
                                    <Avatar src="https://static.pingcap.com/files/2023/07/09063705/TiDB-logo.png"
                                            size='md'/>
                                </div>
                                <Section
                                    className='ms-2 w-full'
                                    classNames={{
                                        subHeading: 'max-w-64 whitespace-nowrap overflow-hidden text-ellipsis'
                                    }}
                                    title='ZKTeco'
                                    subtitle='an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics'>
                                    <Switch defaultSelected size='sm' color="primary"/>
                                </Section>
                            </div>
                        </BorderCard>
                        <BorderCard heading='' className='w-[440px]'>
                            <div className='flex justify-between'>
                                <div>
                                    <Avatar
                                        src="https://logovectorseek.com/wp-content/uploads/2020/04/zkteco-logo-vector.png"
                                        size='md'/>
                                </div>
                                <Section
                                    className='ms-2 w-full'
                                    classNames={{
                                        subHeading: 'max-w-64 whitespace-nowrap overflow-hidden text-ellipsis'
                                    }}
                                    title='ZKTeco'
                                    subtitle='globally renowned provider of biometric verification algorithm techniques, sensors and software platforms.'>
                                    <Switch defaultSelected size='sm' color="primary"/>
                                </Section>
                            </div>
                        </BorderCard>
                        <BorderCard heading='' className='w-[440px]'>
                            <div className='flex justify-between'>
                                <div>
                                    <Avatar
                                        src="https://storage.googleapis.com/clean-finder-353810/$HRokgbx8Dplf8fWi1w8E2hyYx6qmhxmXMIQqXvvaNYeZr84881PBxe"
                                        size='md'/>
                                </div>
                                <Section
                                    className='ms-2 w-full'
                                    classNames={{
                                        subHeading: 'max-w-64 whitespace-nowrap overflow-hidden text-ellipsis'
                                    }}
                                    title='Cloudinary'
                                    subtitle='an open-source, cloud-native, distributed, MySQL-Compatible database for elastic scale and real-time analytics'>
                                    <Switch defaultSelected size='sm' color="primary"/>
                                </Section>
                            </div>
                        </BorderCard>
                    </div>
                </Tab>
                <Tab key="database" title={<div className="flex flex-row items-center space-x-2">
                    <LuDatabase/>
                    <Text>Database</Text>
                </div>}>
                    <Card>
                        <CardBody>
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                            commodo
                            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                            fugiat nulla pariatur.
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="cloud_storage" title={<div className="flex flex-row items-center space-x-2">
                    <LuCloud/>
                    <Text>Cloud Storage</Text>
                </div>}>
                    <Card>
                        <CardBody>
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
                            anim
                            id est laborum.
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="attendance_monitoring" title={<div className="flex flex-row items-center space-x-2">
                    <LuCalendarRange/>
                    <Text>Attendance Monitoring</Text>
                </div>}>
                    <Card>
                        <CardBody>
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
                            anim
                            id est laborum.
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>

    </div>
};


function Page() {
    return (<section className='h-full flex flex-col gap-4'>
        <Heading as='h1' className='text-3xl font-bold'>Integrations</Heading>
        <div className='grid grid-flow-col-dense gap-4 w-full h-4/5'>
            <ColumnOne/>
        </div>
    </section>);
}

export default Page;
