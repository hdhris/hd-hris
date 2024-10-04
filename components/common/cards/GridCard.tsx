import {CheckCircle2, XCircle} from "lucide-react"
import {Card, cn} from "@nextui-org/react";
import {CardBody, CardHeader} from "@nextui-org/card";
import Typography from "@/components/common/typography/Typography";
import gradient from "random-gradient";
import Pulse from "@/components/common/effects/Pulse";
import uniqolor from "uniqolor";


const bgGradient = (name: string) => {
    return {
        style: {
            background: uniqolor(name).color
        }
    }
}

export interface LeaveTypeProps {
    key?: number | string
    name: string
    duration: string
    code: string
    carryForward: boolean
    isActive: boolean
}

export default function GridCard({name, duration, code, carryForward, isActive, key}: LeaveTypeProps = {
    name: "Annual Leave", duration: "20 days", code: "AL", carryForward: true, isActive: true
}) {
    const isLight = uniqolor(name).isLight;
    return (<Card className="w-[270px] h-fit" isHoverable key={key}>
            <CardHeader className="p-0">
                <div {...bgGradient(name)}
                     className={cn("relative flex w-full h-28 rounded-b-sm rounded-r-sm", !isLight ? "shadow-[inset_-1px_-121px_75px_-52px_rgba(0,0,0,0.49)]" : "shadow-[inset_-1px_-121px_75px_-52px_rgba(255,255,255,0.49)]")}> {/* shadow-[inset_-1px_-121px_75px_-52px_rgba(0,0,0,0.49)] */}
                    {/* Name positioned bottom-left */}
                    <div className="flex items-end p-2 gap-4 w-full h-full">
                        <Pulse color={isActive ? "success" : "danger"}/>
                        <Typography
                            className={cn("w-full text-2xl font-extrabold break-words overflow-hidden text-pretty", isLight ? "text-black" : "text-white")}>
                            {name}
                        </Typography>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="overflow-hidden">

                <div className="grid gap-2">
                    <div className="flex justify-between">
                        <span className="font-medium text-medium">Duration:</span>
                        <span className="font-semibold text-medium ">{duration}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-sm">Code:</span>
                        <span>{code}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Carry Forward:</span>
                        {carryForward ? (<CheckCircle2 className="h-5 w-5 text-green-500"/>) : (
                            <XCircle className="h-5 w-5 text-red-500"/>)}
                    </div>
                </div>
            </CardBody>
        </Card>)
}