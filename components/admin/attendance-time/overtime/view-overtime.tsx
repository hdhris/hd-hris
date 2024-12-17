import AcceptReject from "@/components/actions/AcceptReject";
import UserMail from "@/components/common/avatar/user-info-mail";
import Drawer from "@/components/common/Drawer";
import { toast } from "@/components/ui/use-toast";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import showDialog from "@/lib/utils/confirmDialog";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { approvalStatusColorMap, ApprovalStatusType, OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import { Avatar, Card, Chip, cn, Divider, ScrollShadow, Textarea, Tooltip } from "@nextui-org/react";
import axios from "axios";
import { capitalize } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { FaRegCalendarAlt, FaRegUserCircle } from "react-icons/fa";
import { MdHowToVote, MdOutlineGroups2, MdOutlineMessage } from "react-icons/md";
import { TbClockCheck, TbClockUp, TbClockX } from "react-icons/tb";

interface ViewOvertimeProps {
    overtime: OvertimeEntry | null;
    onClose: () => void;
    mutate: () => void;
}

const Item = ({
    icon,
    label,
    value,
    vertical,
}: {
    icon?: React.ReactNode;
    label: string;
    value: React.ReactNode;
    vertical?: boolean;
}) => {
    return (
        <div
            className={cn(
                "flex justify-between gap-4 w-full",
                vertical ? "flex-col items-start" : " flex-row items-center"
            )}
        >
            <div className="flex gap-4 items-center">
                {icon}
                <h1 className="font-semibold text-medium">{label}</h1>
            </div>
            <div className={vertical ? "w-full" : undefined}>{value}</div>
        </div>
    );
};
function ViewOvertime({ overtime, onClose, mutate }: ViewOvertimeProps) {
    const userID = useEmployeeId();
    const [rejectReason, setRejectReason] = useState("");

    const getUserById = useMemo(() => {
        return (id: number): OvertimeEntry["evaluators"]["users"][0] | undefined => {
            return overtime?.evaluators?.users.find((user) => Number(user.id) === id || user.employee_id === id);
        };
    }, [overtime]);

    const currentEvaluatingOrderNumber = useMemo(() => {
        let orderNumber = 0;
        if (overtime?.evaluators?.evaluators?.length) {
            const sortedEvaluators = overtime.evaluators.evaluators.sort((a, b) => a.order_number - b.order_number);

            for (const item of sortedEvaluators) {
                if (item.decision.is_decided === null) {
                    orderNumber = item.order_number;
                    break;
                }
            }
        }
        return orderNumber;
    }, [overtime]);

    const Evaluators = useMemo(() => {
        if (overtime?.evaluators?.evaluators?.length) {
            return (
                <div className="space-y-2">
                    {overtime.evaluators.evaluators.map((item, index) => {
                        const isApproving =
                            item.order_number === currentEvaluatingOrderNumber && item.evaluated_by === userID;
                        return (
                            <Card key={index} shadow="none" className="border p-2">
                                <div className="flex flex-row justify-between items-center">
                                    <UserMail
                                        size="sm"
                                        name={getUserById(item.evaluated_by)?.name ?? "No Name"}
                                        picture={getUserById(item.evaluated_by)?.picture ?? ""}
                                        description={
                                            getUserById(item.evaluated_by)?.position ??
                                            getUserById(item.evaluated_by)?.department ??
                                            getUserById(item.evaluated_by)?.email ??
                                            undefined
                                        }
                                    />
                                    {isApproving ? (
                                        <AcceptReject
                                            onAccept={async () => onUpdate("approved")}
                                            onReject={async () => onUpdate("rejected")}
                                            isDisabled={{
                                                accept: rejectReason != "",
                                                reject: rejectReason === "",
                                            }}
                                        />
                                    ) : (
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={
                                                item.decision.is_decided === null
                                                    ? "warning"
                                                    : !item.decision.is_decided
                                                    ? "danger"
                                                    : "success"
                                            }
                                        >
                                            {item.decision.is_decided === null
                                                ? "Pending"
                                                : !item.decision.is_decided
                                                ? "Rejected"
                                                : "Approved"}
                                        </Chip>
                                    )}
                                </div>
                                {isApproving && (
                                    <Textarea
                                        placeholder="Reason for rejection"
                                        value={rejectReason}
                                        onValueChange={setRejectReason}
                                    />
                                )}
                            </Card>
                        );
                    })}
                </div>
            );
        }
        return false;
    }, [overtime, getUserById, currentEvaluatingOrderNumber, userID, rejectReason]);

    const onUpdate = useCallback(
        async (status: ApprovalStatusType) => {
            const isApproved = status === "approved";

            const response = await showDialog({
                title: `${isApproved ? "Appoval" : "Rejection"}`,
                message: `Do you confirm to ${isApproved ? "approve" : "reject"} ${
                    overtime?.trans_employees_overtimes.last_name
                }'s overtime application?`,
                preferredAnswer: isApproved ? "yes" : "no",
            });
            if (response === "yes") {
                try {
                    const updatedEvaluators = overtime!.evaluators.evaluators.map((evaluator) => {
                        if (isApproved) {
                            if (evaluator.evaluated_by === userID) {
                                return {
                                    ...evaluator,
                                    decision: {
                                        is_decided: isApproved,
                                        decisionDate: toGMT8().toDate(),
                                        rejectedReason: rejectReason === "" ? null : rejectReason,
                                    },
                                };
                            }
                        } else {
                            if (evaluator.decision.is_decided === null) {
                                return {
                                    ...evaluator,
                                    decision: {
                                        is_decided: false,
                                        decisionDate: toGMT8().toDate(),
                                        rejectedReason:
                                            evaluator.evaluated_by === userID
                                                ? rejectReason
                                                : "Signatory is unsuccessful",
                                    },
                                };
                            }
                        }
                        return evaluator;
                    });
                    let newEvaluators = overtime!.evaluators;
                    newEvaluators["evaluators"] = updatedEvaluators;
                    const isAllApproved = newEvaluators.evaluators.every((item) => item.decision.is_decided === true);
                    const isStillPending = newEvaluators.evaluators.some((item) => item.decision.is_decided === null);
                    await axios.post("/api/admin/attendance-time/overtime/update", {
                        id: overtime?.id,
                        status: isAllApproved ? "approved" : isStillPending ? "pending" : "rejected",
                        evaluators: newEvaluators,
                    });

                    console.log("new Evaluators: ", newEvaluators)
                    mutate();
                    onClose();
                    toast({
                        title: isApproved ? "Signatory Approved" : "Signatories Rejected",
                        description: "Overtime has been " + status,
                        variant: isApproved ? "success" : "default",
                    });
                } catch (error) {
                    console.log(error);
                    toast({
                        title: "An error has occured",
                        // description: String(error),
                        variant: "danger",
                    });
                }
            }
        },
        [overtime, userID, rejectReason, mutate]
    );

    return (
        <Drawer
            isDismissible
            isOpen={!!overtime}
            onClose={() => {
                setRejectReason("");
                onClose();
            }}
            title={"Overtime Details"}
        >
            {overtime && (
                <ScrollShadow className="space-y-4">
                    <Item
                        key={"date"}
                        icon={<FaRegCalendarAlt />}
                        label="Date"
                        value={toGMT8(overtime.date).format("MMMM DD, YYYY")}
                    />
                    <hr key={1} />
                    <Item
                        key={"clock_in"}
                        icon={<TbClockCheck />}
                        label="Clock In"
                        value={toGMT8(overtime.clock_in).format("hh:mm a")}
                    />
                    <hr />
                    <Item
                        key={"clock_out"}
                        icon={<TbClockX />}
                        label="Clock Out"
                        value={toGMT8(overtime.clock_in).format("hh:mm a")}
                    />
                    <hr key={2} />
                    <Item
                        key={"requested_min"}
                        icon={<TbClockUp />}
                        label="Requested Minutes"
                        value={`${overtime.requested_mins} minutes`}
                    />
                    <hr key={3} />
                    <Item
                        key={"created_by"}
                        icon={<FaRegUserCircle />}
                        label="Created By"
                        value={
                            <Tooltip
                                className="pointer-events-auto"
                                content={getEmpFullName(overtime.trans_employees_overtimes)}
                            >
                                <Avatar size="sm" src={overtime.trans_employees_overtimes.picture} />
                            </Tooltip>
                        }
                    />
                    <hr key={4} />
                    <Item
                        key={"status"}
                        icon={<MdHowToVote />}
                        label="Status"
                        value={
                            <Chip variant="flat" color={approvalStatusColorMap[overtime.status]}>
                                {capitalize(overtime.status)}
                            </Chip>
                        }
                    />
                    <hr key={5} />
                    <Item
                        key={"reason"}
                        icon={<MdOutlineMessage />}
                        label="Reason"
                        vertical
                        value={<Textarea value={overtime.reason} readOnly />}
                    />
                    <hr key={6} />
                    <Item
                        key={"evaluators"}
                        icon={<MdOutlineGroups2 />}
                        label="Evaluators"
                        vertical
                        value={Evaluators === false ? "No Evaluators Found" : Evaluators}
                    />
                </ScrollShadow>
            )}
        </Drawer>
    );
}

export default ViewOvertime;
