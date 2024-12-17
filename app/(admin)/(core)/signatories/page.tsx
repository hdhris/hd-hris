"use client"
import React, {useMemo} from 'react';
import DataDisplay from '@/components/common/data-display/data-display';
import {useSignatories} from "@/services/queries";
import BorderCard from "@/components/common/BorderCard";
import Typography, {Section} from "@/components/common/typography/Typography";
import {AnimatedList} from "@/components/ui/animated-list";
import {Accordion, AccordionItem, Avatar, ScrollShadow} from '@nextui-org/react';
import {capitalize} from "@nextui-org/shared-utils";
import {LuSettings2} from 'react-icons/lu';
import CardTable from '@/components/common/card-view/card-table';
import {Tooltip} from "@nextui-org/tooltip";
import {getEmpFullName} from "@/lib/utils/nameFormatter";

function Page() {
    const {data, isLoading} = useSignatories()

    const signatories = useMemo(() => {
        if (data) {
            console.log("Data: ", data)
            return data
        }

        return []
    }, [data])
    return (<DataDisplay
        isLoading={isLoading}
        data={signatories}
        defaultDisplay="grid"
        onGridDisplay={(data, key) => {
            return (<>
                <BorderCard className="w-full h-96 overflow-hidden">
                    <Section className="ms-0" title={data.name} subtitle=""/>
                    <AnimatedList className="mt-2">
                        <Accordion variant="splitted" selectionMode="multiple">
                            {data.signatories.sort((a, b) => a.order_number - b.order_number).map((item, index) => (
                                <AccordionItem key={index} aria-label={data.name} indicator={<LuSettings2/>}
                                               title={<div className="flex justify-between items-center">
                                                   <Typography
                                                       className="font-semibold text-sm">{item.order_number}</Typography>
                                                   <Typography
                                                       className="font-semibold text-sm">{item.job_classes.name}</Typography>
                                                   <Typography
                                                       className="font-semibold text-sm">{capitalize(item.signatory_roles.signatory_role_name)}</Typography>
                                               </div>}>
                                    <hr className="border"/>
                                    <div className="mt-2">
                                        {/*<Tooltip key={index} content={emp.departments}>*/}
                                        {/*    <Avatar size="sm" isBordered src={emp.picture || ""}/>*/}
                                        {/*</Tooltip>*/}
                                        <ScrollShadow size={20} className="h-42 overflow-y-auto">
                                            <CardTable data={item.employees.map((emp, index) => ({
                                                label:  (<Tooltip key={index} content={emp.departments}>
                                                    <Avatar size="sm" isBordered src={emp.picture || ""}/>
                                                </Tooltip>),
                                                value: <Typography>{getEmpFullName(emp)}</Typography>
                                            }))}/>
                                        </ScrollShadow>



                                    </div>
                                </AccordionItem>))}
                        </Accordion>
                    </AnimatedList>

                </BorderCard>
            </>)
        }}
    />);
}

export default Page;
