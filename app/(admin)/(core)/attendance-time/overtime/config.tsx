import AcceptReject from "@/components/actions/AcceptReject";
import UserMail from "@/components/common/avatar/user-info-mail";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { OvertimeEntry, approvalStatusColorMap } from "@/types/attendance-time/OvertimeType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Tooltip, Avatar } from "@nextui-org/react";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { IoCloseSharp, IoCheckmarkSharp } from "react-icons/io5";

export function overtimePageConfigTable(onUpdate: (id: number, status: string)=> Promise<void>): TableConfigProps<OvertimeEntry> {
    return {
        columns: [
            { uid: "overtime_date", name: "Overtime Date", sortable: true },
            { uid: "name", name: "Name", sortable: true },
            { uid: "clock_in", name: "Clock In", sortable: true },
            { uid: "clock_out", name: "Clock Out", sortable: true },
            { uid: "duration", name: "Duration", sortable: true },
            { uid: "action", name: "Action" },
        ],
        rowCell: (item, columnKey) => {
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
                case "action":
                    return item.status === "pending" ? (
                        <AcceptReject
                            onAccept={async()=> await onUpdate(item.id, "approved")}
                            onReject={async()=> await onUpdate(item.id, "rejected")}
                        />
                    ) : (
                        <div className="flex justify-between w-36 items-center">
                            <Chip
                                startContent={
                                    item.status === "approved" ? (
                                        <FaCheckCircle size={18} />
                                    ) : (
                                        <IoMdCloseCircle size={18} />
                                    )
                                }
                                variant="flat"
                                color={approvalStatusColorMap[item.status]}
                                className="capitalize"
                            >
                                {item.status}
                            </Chip>
                            {item.trans_employees_overtimes_approvedBy && (
                                <Tooltip className="pointer-events-auto" content={item.approvedBy_full_name}>
                                    <Avatar
                                        isBordered
                                        radius="full"
                                        size="sm"
                                        src={item?.trans_employees_overtimes_approvedBy?.picture ?? ""}
                                    />
                                </Tooltip>
                            )}
                        </div>
                    );
                default:
                    return <></>;
            }
        },
    };
}
