'use client'
import React from 'react';
import {AvatarProps, Skeleton, Spinner} from "@nextui-org/react";
import {useAuditSignatories} from "@/services/queries";
import {Avatar} from "@nextui-org/avatar";
import {ScrollShadow} from "@nextui-org/scroll-shadow";

const statusColorMap: Record<string, AvatarProps["color"]> = {
    approved: "success", declined: "danger", pending: "warning",
};


// const statusContentMap: Record<string, ReactNode> = {
//     approved: <LuThumbsUp />,
//     declined: <LuThumbsDown />,
//     pending: <LuOrbit />,
// };

function AuditSignatories() {
    const {data: signatories, isLoading} = useAuditSignatories();

    return (<div className="flex gap-3 mb-1.5">
            {!isLoading ? signatories?.map((signatory) => (// <Badge key={signatory.id} content={statusContentMap[signatory.status]} color={statusColorMap[signatory.status]} shape="circle" placement="bottom-right">
                <Avatar key={signatory.id} isBordered color={statusColorMap[signatory.status]} src={signatory.picture} size="sm"
                        showFallback
                        fallback={<Skeleton className="flex rounded-full"/>}/>
            )) : <Spinner size="sm"/>}
        </div>

    );
}

export default AuditSignatories;