import React from 'react';
import BorderCard from "@/components/common/BorderCard";
import {LuDownload} from 'react-icons/lu';
import {Button} from "@nextui-org/react";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {icon_size_sm} from "@/lib/utils";
import FileIcon from "@/components/common/file-extension/FileIcon";
import Typography from '../../typography/Typography';
import Link from "next/link";

export interface FileCardProps {
    fileName: string
    fileSize: string
    fileType: string
    downloadUrl?: string
}

function FileAttachments({fileName, fileSize, fileType, downloadUrl}: FileCardProps) {
    return (<BorderCard heading={<div className="flex gap-4 mb-2"><FileIcon extension={fileType}/> <Typography className="font-semibold text-sm">{fileName}</Typography></div>} subHeading={`${fileSize} • ${fileType.toUpperCase()}`} className="p-4" endContent={
            <Button {...uniformStyle({variant: "light"})} isIconOnly as={Link} href={downloadUrl}><LuDownload className={icon_size_sm}/></Button>}>
            <></>
        </BorderCard>

    );
}

export default FileAttachments;