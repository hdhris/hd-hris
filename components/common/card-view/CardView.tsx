import React, {ReactNode} from 'react';
import BorderCard from "@/components/common/BorderCard";
import Typography, {Section} from "@/components/common/typography/Typography";
import {Divider} from "@nextui-org/divider";
import {Button} from "@nextui-org/button";
import BackupRetention from "@/components/admin/defaults/backup/BackupRetention";


interface CardViewProps{
    name: string,
    description?: string
    header?: ReactNode,
    body: ReactNode,
    footer: ReactNode
}
function CardView({header, body, footer}: CardViewProps) {
    return (
        <BorderCard heading={header} className="w-[600px] p-0">
            <Divider className="my-2"/>
            {body}
            <Divider className="my-2"/>
            {footer}
            <Section className="my-2 ms-0 px-2" classNames={{
                base: "ms-0 mx-2",
                heading: "text-medium",
                subHeading: "text-[13px] !text-default-400/80"
            }} title="Danger Zone" subtitle="Sensitive actions that may have significant consequences."/>
            <div className="border rounded mx-3 border-danger/25">
                <div className='ms-3 space-y-5'>
                    <Section className="my-2 ms-0 px-2" classNames={{
                        base: "ms-0 mx-2",
                        heading: "text-sm",
                        subHeading: "text-[12px] !text-default-400/80"
                    }} title="Delete Leave Credit" subtitle="This action may cause a permanent deletion of data.">
                        <Button size='sm' variant='faded'>Backup Now</Button>
                    </Section>
                </div>
                <hr className="border-danger/25"/>
                <Section title='Backup Retention' subtitle='Manage How Long Backups Are Kept'>
                    <BackupRetention/>
                </Section>
            </div>
        </BorderCard>
    );
}

export default CardView;