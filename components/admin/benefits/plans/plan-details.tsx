import {Card, CardFooter, CardHeader} from "@nextui-org/react"
import { CalendarRange, Clock, Heart, Info, Percent, User2 } from "lucide-react"
import Typography from "@/components/common/typography/Typography";
import {Chip} from "@nextui-org/chip";
import {CardBody} from "@nextui-org/card";
import {BenefitPlan} from "@/types/benefits/plans/plansTypes";
import dayjs from "dayjs";

export default function PlanDetails({...props}: BenefitPlan) {
    return (
        <Card className="w-full">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-primary" />
                        <Typography>{props.name}</Typography>
                    </div>
                    <Chip color={props.isActive ? "success" : "danger"}>{props.isActive ? "Active" : "Inactive"}</Chip>
                </div>
                <Chip>{props.type}</Chip>
            </CardHeader>
            <CardBody className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Percent className="h-4 w-4" />
                            Contributions
                        </div>
                        <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Employer</div>
                                <div className="font-medium">{props.employerContribution}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Employee</div>
                                <div className="font-medium">{props.employeeContribution}%</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <CalendarRange className="h-4 w-4" />
                            Coverage Period
                        </div>
                        <div className="grid gap-1 rounded-lg border p-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm text-muted-foreground">Start Date</div>
                                <div className="text-sm">{dayjs(props.effectiveDate).format("mmmm DD, YYYY")}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm text-muted-foreground">End Date</div>
                                <div className="text-sm">{dayjs(props.expirationDate).format("mmmm DD, YYYY")}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Info className="h-4 w-4" />
                        Coverage Details
                    </div>
                    <div className="rounded-lg border p-3">
                        <Typography className="text-sm text-muted-foreground">
                            {props.coverageDetails}
                        </Typography>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <User2 className="h-4 w-4" />
                        Description
                    </div>
                    <div className="rounded-lg border p-3">
                        <Typography className="text-sm text-muted-foreground">
                            {props.description}
                        </Typography>
                    </div>
                </div>
            </CardBody>
            <CardFooter>
                <div className="w-full space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        Timestamps
                    </div>
                    <div className="grid gap-1 rounded-lg border p-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Created At</div>
                            <div className="text-sm">{dayjs(props.createdAt).format("mmmm DD, YYYY hh:mm A")}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Updated At</div>
                            <div className="text-sm">{dayjs(props.updatedAt).format("mmmm DD, YYYY hh:mm A")}</div>
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}