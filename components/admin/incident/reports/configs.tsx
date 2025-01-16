import UserMail from "@/components/common/avatar/user-info-mail";
import { SearchProps, SortProps } from "@/components/util/types/types";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { IncidentReport } from "@/types/incident-reports/type";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Chip, Tooltip, Avatar } from "@nextui-org/react";
import { capitalize } from "lodash";

export const tableConfig: TableConfigProps<IncidentReport> = {
    columns: [
        { uid: "employee", name: "Employee" },
        { uid: "date", name: "Occurance Date" },
        { uid: "location", name: "Location" },
        { uid: "type", name: "Category" },
        { uid: "severity", name: "Severity" },
        { uid: "status", name: "Status" },
        { uid: "action", name: "Reporter" },
    ],
    rowCell: (item, columnKey) => {
        switch (columnKey) {
            case "employee":
                return (
                    <UserMail
                        key={columnKey}
                        name={getEmpFullName(item.trans_employees_dim_incident_reports_employee_idTotrans_employees)}
                        email={item.trans_employees_dim_incident_reports_employee_idTotrans_employees.email}
                        picture={item.trans_employees_dim_incident_reports_employee_idTotrans_employees.picture}
                    />
                );
            case "date":
                return <p>{toGMT8(item.occurance_date).format("DD MMMM YYYY")}</p>;
            case "location":
                return <p className="capitalize">{item.location}</p>;
            case "type":
                return <p className="capitalize">{item.type}</p>;
            case "status":
                const status = !item.is_acted
                    ? "Pending"
                    : item.actions_taken === "Suspension"
                    ? "Suspended"
                    : item.actions_taken === "Payroll Deduction"
                    ? "Deducted"
                    : item.actions_taken === "Termination"
                    ? "Terminated"
                    : item.actions_taken === "Send Warning"
                    ? "Warned"
                    : "Pending";
                return (
                    <Chip variant="flat" color={item.is_acted ? "warning" : "default"} className="capitalize">
                        {status}
                    </Chip>
                );
            case "severity":
                return (
                    <strong
                        className={
                            item.severity === "critical"
                                ? "text-danger-500"
                                : item.severity === "major"
                                ? "text-warning-500-500"
                                : ""
                        }
                    >
                        {capitalize(item.severity)}
                    </strong>
                );
            case "action":
                // return item.status === "pending" ? (
                //   <div className="flex gap-1 items-center">
                //     <Button
                //       isIconOnly
                //       variant="flat"
                //       isLoading={
                //         isPending.id === item.id && isPending.method === "rejected"
                //       }
                //       {...uniformStyle({ color: "danger" })}
                //       onPress={async () => {
                //         const result = await onUpdate({
                //           ...item,
                //           approved_at: toGMT8().toISOString(),
                //           updated_at: toGMT8().toISOString(),
                //           approved_by: userID!,
                //           status: "rejected",
                //           rate_per_hour: "0",
                //         });
                //       }}
                //     >
                //       <IoCloseSharp className="size-5 text-danger-500" />
                //     </Button>
                //     <Button
                //       {...uniformStyle({ color: "success" })}
                //       isLoading={
                //         isPending.id === item.id && isPending.method === "approved"
                //       }
                //       startContent={
                //         <IoCheckmarkSharp className="size-5 text-white" />
                //       }
                //       className="text-white"
                //       onClick={async () => {
                //         const result = await onUpdate({
                //           ...item,
                //           approved_at: toGMT8().toISOString(),
                //           updated_at: toGMT8().toISOString(),
                //           approved_by: userID!,
                //           status: "approved",
                //           rate_per_hour: String(
                //             item.trans_employees_overtimes.ref_job_classes.pay_rate
                //           ),
                //         });
                //       }}
                //     >
                //       Approve
                //     </Button>
                //   </div>
                // ) : (
                //   <div className="flex justify-between w-36 items-center">
                //     <Chip
                //       startContent={
                //         item.status === "approved" ? (
                //           <FaCheckCircle size={18} />
                //         ) : (
                //           <IoMdCloseCircle size={18} />
                //         )
                //       }
                //       variant="flat"
                //       color={statusColorMap[item.status]}
                //       className="capitalize"
                //     >
                //       {item.status}
                //     </Chip>
                //     {item.trans_employees_overtimes_approvedBy && (
                //       <Tooltip
                //         className="pointer-events-auto"
                //         content={item.approvedBy_full_name}
                //       >
                //         <Avatar
                //           isBordered
                //           radius="full"
                //           size="sm"
                //           src={
                //             item?.trans_employees_overtimes_approvedBy?.picture ?? ""
                //           }
                //         />
                //       </Tooltip>
                //     )}
                //   </div>
                // );
                return (
                    <Tooltip
                        className="pointer-events-auto"
                        content={getEmpFullName(item.trans_employees_dim_incident_reports_reported_byTotrans_employees)}
                    >
                        <Avatar
                            isBordered
                            radius="full"
                            size="sm"
                            src={item?.trans_employees_dim_incident_reports_reported_byTotrans_employees?.picture ?? ""}
                        />
                    </Tooltip>
                );
            default:
                return <></>;
        }
    },
};

export const searchConfig: Omit<SearchProps<IncidentReport>, "onChange"> = {
    searchingItemKey: [
        ["trans_employees_dim_incident_reports_employee_idTotrans_employees", "last_name"],
        ["trans_employees_dim_incident_reports_employee_idTotrans_employees", "first_name"],
        ["trans_employees_dim_incident_reports_employee_idTotrans_employees", "middle_name"],
        ["trans_employees_dim_incident_reports_reported_byTotrans_employees", "last_name"],
        ["trans_employees_dim_incident_reports_reported_byTotrans_employees", "first_name"],
        ["trans_employees_dim_incident_reports_reported_byTotrans_employees", "middle_name"],
    ],
};

export const sortProps: Omit<SortProps<IncidentReport>, "onSortChange" | "initialValue"> = {
    sortItems: [
        {
            key: "created_at",
            name: "Filed date",
        },
        {
            key: "occurance_date",
            name: "Occurance date",
        },
        {
            key: ["trans_employees_dim_incident_reports_employee_idTotrans_employees", "last_name"],
            name: "Last Name",
        },
    ],
};
