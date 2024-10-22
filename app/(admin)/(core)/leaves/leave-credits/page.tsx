"use client"
import React, {useMemo} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import DataDisplay from "@/components/common/data-display/data-display";
import {usePaginateQuery} from "@/services/queries";
import {LeaveRequestPaginate} from "@/types/leaves/LeaveTypes";
import {bgColor, getColor, gradientColor, textColor} from "@/helper/background-color-generator/generator";
import {isObjectEmpty} from "@/helper/objects/isObjectEmpty";
import {CardBody, CardHeader} from "@nextui-org/card";
import Typography from "@/components/common/typography/Typography";
import {Chip} from "@nextui-org/chip";
import {Avatar, AvatarGroup, Card, cn, Tooltip} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {LuPencil, LuTrash2} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";
import {Bell, Calendar, Clock, DollarSign, FileCheck, RefreshCcw, Users} from "lucide-react";
import {capitalize} from "@nextui-org/shared-utils";

function Page() {
    // SetNavEndContent(() => <></>);
    const {data, isLoading} = usePaginateQuery<LeaveRequestPaginate>("/api/admin/leaves/leave-types", 1, 10, {
        refreshInterval: 3000
    });
    const leaveData = useMemo(() => {
        if (!data?.data) {
            return []
        } else {
            return data.data
        }
    }, [data])
    return (
        <DataDisplay
            // title="Leave Credits"
            data={leaveData}
            defaultDisplay="grid"
            searchProps={{searchingItemKey: ["name"]}}
            onGridDisplay={(data) => {
                return <p>No grid display available</p>
            }}
        />
    );
}

export default Page;

// const LeaveCreditCard = () => {
//     return (
//         <Card {...gradientColor(props.code, props.name, 0.2)} className="w-[40%] overflow-hidden">
//             {!isObjectEmpty(props) ? (<>
//                     <CardHeader
//                         className="relative flex flex-col gap-2 h-32 border-b bg-white bg-opacity-50 backdrop-blur-sm w-full">
//                         <div className="flex items-center justify-between w-full">
//                             <Typography {...textColor(props.code)}
//                                         className="text-2xl font-bold">{props.name}</Typography>
//                             <Chip style={{
//                                 background: getColor(props.code, 0.2),
//                                 borderColor: getColor(props.code, 0.5),
//                                 color: getColor(props.code)
//                             }} variant="bordered" classNames={{
//                                 content: "font-bold",
//                             }}>
//                                 {props.code}
//                             </Chip>
//                         </div>
//                         <div className="absolute top-12 left-3 right-3 text-pretty break-words h-24">
//                             <Typography className="text-sm text-justify indent-5 h-[4rem]">
//                                 {props.description}
//                             </Typography>
//                             <Avatar {...bgColor(props.code, 0.75)}
//                                     className="float-left mr-3 [clip-path:circle(50%)] [shape-outside:circle(50%)]"
//                                     alt={"system icon"}
//                                     src="../assets/system.png" size="md"/>
//                         </div>
//                     </CardHeader>
//                     <CardBody className="relative grid gap-4 p-6">
//
//                     </CardBody>
//                 </>
//                 // <CardBody className="overflow-hidden">
//                 //     {/*{body(item)}*/}
//                 // </CardBody>
//             ) : (<div className="grid place-items-center h-full"><Typography
//                 className="text-slate-700/50 font-semibold">No
//                 Row Selected</Typography></div>)}
//         </Card>
//     )
// }