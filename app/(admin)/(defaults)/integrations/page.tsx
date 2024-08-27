'use client'
import React, { useState, useEffect } from 'react';
import { Heading, Section } from "@/components/common/typography/Typography";
import { Switch, Tab, Tabs } from '@nextui-org/react';
import { Card, CardBody } from "@nextui-org/card";
import { LuCalendarRange, LuCloud, LuDatabase } from "react-icons/lu";
import Text from "@/components/Text";
import BorderCard from "@/components/common/BorderCard";
import { Avatar } from "@nextui-org/avatar";
import RenderList from "@/components/util/RenderList";
import { useIntegrations } from "@/services/queries";
import {Integrations} from "@/types/routes/default/types";

const ColumnOne: React.FC = () => {
    const [selected, setSelected] = useState<string>("all");
    const [items, setItems] = useState<Integrations[]>([]);
    const { data, isLoading } = useIntegrations();

    useEffect(() => {
        if (data) {
            setItems(data);
        }
    }, [data]);

    const filterItems = (type: string) => {
        if (type === "all") {
            return items;
        }
        return items.filter(item => item.type === type);
    };

    const IntegrationLists = React.useMemo(() => {
        return (
            <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
                <RenderList items={filterItems(selected)}
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
        );
    }, [filterItems, selected]);

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
                        {IntegrationLists}
                    </Tab>
                    <Tab key="database" title={<div className="flex flex-row items-center space-x-2">
                        <LuDatabase/>
                        <Text>Database</Text>
                    </div>}>
                        {IntegrationLists}
                    </Tab>
                    <Tab key="cloud_storage" title={<div className="flex flex-row items-center space-x-2">
                        <LuCloud/>
                        <Text>Cloud Storage</Text>
                    </div>}>
                        {IntegrationLists}
                    </Tab>
                    <Tab key="attendance_monitoring" title={<div className="flex flex-row items-center space-x-2">
                        <LuCalendarRange />
                        <Text>Attendance Monitoring</Text>
                    </div>}>
                        {IntegrationLists}
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
