import AcceptReject from "@/components/actions/AcceptReject";
import UserMail from "@/components/common/avatar/user-info-mail";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { OvertimeEntry, approvalStatusColorMap } from "@/types/attendance-time/OvertimeType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Tooltip, Avatar, AvatarGroup } from "@nextui-org/react";
import { capitalize } from "lodash";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { IoCloseSharp, IoCheckmarkSharp } from "react-icons/io5";

export function overtimePageConfigTable(): TableConfigProps<OvertimeEntry> {

    return {
        columns: [
            { uid: "overtime_date", name: "Overtime Date", sortable: true },
            { uid: "name", name: "Name", sortable: true },
            { uid: "clock_in", name: "Clock In", sortable: true },
            { uid: "clock_out", name: "Clock Out", sortable: true },
            { uid: "duration", name: "Duration", sortable: true },
            { uid: "status", name: "Status" },
            { uid: "evaluators", name: "Evaluators" },
        ],
        rowCell: (item, columnKey) => {
            function getUserById (id: number){
                return item?.evaluators?.users.find((user) => Number(user.id) === id || user.employee_id === id);
            }
            switch (columnKey) {
                case "name":
                    return (
                        <UserMail
                            key={item.employee_id}
                            name={getEmpFullName(item.trans_employees_overtimes)}
                            email={item.trans_employees_overtimes?.email}
                            picture={item.trans_employees_overtimes?.picture}
                        />
                    );
                case "overtime_date":
                    return <p>{toGMT8(item.date).format("DD MMMM YYYY")}</p>;
                case "clock_in":
                    return <strong>{toGMT8(item.clock_in).format("hh:mm a")}</strong>;
                case "clock_out":
                    return <strong>{toGMT8(item.clock_out).format("hh:mm a")}</strong>;
                case "duration":
                    return <p>{calculateShiftLength(item.clock_in, item.clock_out, 0, true)}</p>;
                case "status":
                    return (
                        <Chip variant="flat" color={approvalStatusColorMap[item.status]}>
                            {capitalize(item.status)}
                        </Chip>
                    );
                case "evaluators":
                    return (
                        <AvatarGroup isBordered>
                            {item.evaluators.evaluators.map(evaluator => (
                                <Tooltip key={evaluator.evaluated_by} className="cursor-pointer" content={getUserById(evaluator.evaluated_by)?.name}>
                                    <Avatar size="sm" color={
                                        evaluator.decision.is_decided === null ? "warning" :
                                        evaluator.decision.is_decided === false ? "danger" : "success"
                                    } src={getUserById(evaluator.evaluated_by)?.picture}/>
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    );
                default:
                    return <></>;
            }
        },
    };
}
