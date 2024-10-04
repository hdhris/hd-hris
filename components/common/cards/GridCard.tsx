
import { CheckCircle2, XCircle } from "lucide-react"
import {Badge, Card} from "@nextui-org/react";
import {CardBody, CardHeader} from "@nextui-org/card";
import Typography from "@/components/common/typography/Typography";
import gradient from "random-gradient";
import {Chip} from "@nextui-org/chip";

const bgGradient = (name: string) => {
    return {
        style: {
            background: gradient(name)
        }
    }
}

interface LeaveTypeProps {
    name: string
    duration: string
    code: string
    carryForward: boolean
    isActive: boolean
}

export default function GridCard({ name, duration, code, carryForward, isActive }: LeaveTypeProps = {
    name: "Annual Leave",
    duration: "20 days",
    code: "AL",
    carryForward: true,
    isActive: true
}) {
    return (
        <Card className="max-w-sm h-[270px]" isHoverable>
            <CardHeader className="p-0">
                <div {...bgGradient(name)} className="relative flex w-full h-28 rounded-b-sm rounded-r-sm">
                    {/* Chip positioned top-left */}
                    <div className="absolute top-2 right-2 h-fit ">
                        <Chip color="success" variant="shadow">Active</Chip>
                    </div>

                    {/* Name positioned bottom-left */}
                    <div className="flex items-end p-2 w-full h-full">
                        <Typography
                            className="w-full text-2xl font-extrabold text-gray-700 mix-blend-overlay stroke-2 break-words overflow-hidden text-pretty">
                            {name}
                        </Typography>
                    </div>
                </div>


                {/*<div className="flex items-center justify-between">*/}
                {/*    <Typography>{name}</Typography>*/}
                {/*    <Badge color={isActive ? "default" : "secondary"}>*/}
                {/*        {isActive ? "Active" : "Inactive"}*/}
                {/*    </Badge>*/}
                {/*</div>*/}
            </CardHeader>
            <CardBody>
                <div className="grid gap-2">
                    <div className="flex justify-between">
                        <span className="font-medium">Duration:</span>
                        <span>{duration}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Code:</span>
                        <span>{code}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Carry Forward:</span>
                        {carryForward ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}