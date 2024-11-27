"use client";
import CashAdvanceForm from "@/components/admin/payroll/cash-advance/CashAdvanceForm";
import UserMail from "@/components/common/avatar/user-info-mail";
import Drawer from "@/components/common/Drawer";
import { FilterItemsProps } from "@/components/common/filter/FilterItems";
import SearchFilter from "@/components/common/filter/SearchFilter";
import { SearchItemsProps } from "@/components/common/filter/SearchItems";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import TableData from "@/components/tabledata/TableData";
import { toast } from "@/components/ui/use-toast";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import showDialog from "@/lib/utils/confirmDialog";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { approvalStatusColorMap, ApprovalStatusType } from "@/types/attendance-time/OvertimeType";
import { LoanRequest } from "@/types/payroll/cashAdvanceType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Tooltip, Avatar } from "@nextui-org/react";
import axios from "axios";
import React, { useMemo, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { IoCloseSharp, IoCheckmarkSharp } from "react-icons/io5";

function Page() {
    const { data, isLoading, mutate } = useQuery<LoanRequest[]>("/api/admin/payroll/cash-advance");
    const [loanRequests, setLoadRequests] = useState<LoanRequest[]>([]);
    const [showAddCA, setshowAddCA] = useState(false);
    const [selectedLoad, setSelectedLoan] = useState<LoanRequest | null>(null);
    const userID = useEmployeeId();

    const onApproval = async (id: number, status: ApprovalStatusType) => {
        const isApproved = status === "approved";
        const response = await showDialog({
            title: `${isApproved ? "Appoval" : "Rejection"}`,
            message: `Do you confirm to ${isApproved ? "approve" : "reject"} ${
                loanRequests.find((lr) => lr.id === id)!
                    .trans_employees_trans_cash_advances_employee_idTotrans_employees.last_name
            }'s cash advance request?`,
            preferredAnswer: isApproved ? "yes" : "no",
        });
        if (response === "yes") {
            try {
                await axios.post("/api/admin/payroll/cash-advance/approval", { id, status, approval_by: userID });
                toast({ title: `Cash advancement has been ${status}`, variant: "success" });
                mutate();
            } catch (error) {
                toast({ title: "An error has been encountered", description: String(error), variant: "danger" });
            }
        }
    };

    SetNavEndContent(() => (
        <Button
            onClick={() => {
                setSelectedLoan(null);
                setshowAddCA(true);
            }}
            {...uniformStyle()}
        >
            Add Advancement
        </Button>
    ));

    const loanMapByID = useMemo(() => {
        if (data) {
            return new Map(data.map((loan) => [loan.id, loan]));
        }
    }, [data]);

    return (
        <div className="flex h-full flex-col">
            <SearchFilter
                className="mb-2"
                items={data || []}
                isLoading={isLoading}
                searchConfig={searchConfig as SearchItemsProps<LoanRequest>[]}
                filterConfig={filterConfig as FilterItemsProps<LoanRequest>[]}
                setResults={setLoadRequests}
            />
            <TableData
                items={loanRequests}
                config={config(onApproval)}
                isLoading={isLoading}
                classNames={{ td: "[&:nth-child(n):not(:nth-child(2))]:w-[160px]" }}
                onRowAction={(key) => {
                    setSelectedLoan(loanMapByID?.get(Number(key)) || null);
                    setshowAddCA(true);
                }}
            />
            <CashAdvanceForm
                isOpen={showAddCA}
                onClose={setshowAddCA}
                cashAdvance={selectedLoad}
                mutate={mutate}
                onApproval={onApproval}
            />
        </div>
    );
}

export default Page;

const searchConfig = [
    {
        key: ["trans_employees_trans_cash_advances_employee_idTotrans_employees", "last_name"],
        label: "Full Name",
    },
    {
        key: ["trans_employees_trans_cash_advances_employee_idTotrans_employees", "first_name"],
        label: "",
    },
    {
        key: ["trans_employees_trans_cash_advances_employee_idTotrans_employees", "middle_name"],
        label: "",
    },
];
const filterConfig = [
    {
        filter: [
            {
                label: "Approved",
                value: "approved",
            },
            {
                label: "Pending",
                value: "pending",
            },
            {
                label: "Rejected",
                value: "rejected",
            },
        ],
        key: "status",
        selectionMode: "single",
        sectionName: "Status",
    },
];

function config(
    onUpdate: (id: number, status: ApprovalStatusType) => void
): TableConfigProps<LoanRequest> {
    return {
        columns: [
            { uid: "request_date", name: "Request Date", sortable: true },
            { uid: "name", name: "Name", sortable: true },
            { uid: "amount_requested", name: "Requested", sortable: true },
            { uid: "amount_disbursed", name: "Disbursed", sortable: true },
            { uid: "amount_repaid", name: "Repaid", sortable: true },
            { uid: "action", name: "Action" },
        ],
        rowCell: (item, columnKey) => {
            switch (columnKey) {
                case "name":
                    return (
                        <UserMail
                            key={item.trans_employees_trans_cash_advances_employee_idTotrans_employees.id}
                            name={getEmpFullName(item.trans_employees_trans_cash_advances_employee_idTotrans_employees)}
                            email={item.trans_employees_trans_cash_advances_employee_idTotrans_employees.email}
                            picture={item.trans_employees_trans_cash_advances_employee_idTotrans_employees.picture}
                        />
                    );
                case "request_date":
                    return <p>{toGMT8(item.created_at).format("DD MMMM YYYY")}</p>;
                case "amount_requested":
                    return <strong>{item.amount_requested}</strong>;
                case "amount_disbursed":
                    return item.trans_cash_advance_disbursements.length ? (
                        <p className="font-bold">{item.trans_cash_advance_disbursements[0]?.amount}</p>
                    ) : (
                        <p>N/A</p>
                    );
                case "amount_repaid":
                    return item.trans_cash_advance_disbursements.length ? (
                        <p className="font-bold">
                            {item.trans_cash_advance_disbursements[0]?.trans_cash_advance_repayments.reduce(
                                (sum, cdp) => sum + parseFloat(cdp.amount_repaid),
                                0
                            )}
                        </p>
                    ) : (
                        <p>N/A</p>
                    );
                case "action":
                    return item.status === "pending" ? (
                        <div className="flex gap-1 items-center">
                            <Button
                                isIconOnly
                                variant="flat"
                                {...uniformStyle({ color: "danger" })}
                                onClick={async () => {
                                    await onUpdate(item.id, "rejected");
                                }}
                            >
                                <IoCloseSharp className="size-5 text-danger-500" />
                            </Button>
                            <Button
                                {...uniformStyle({ color: "success" })}
                                startContent={<IoCheckmarkSharp className="size-5 text-white" />}
                                className="text-white"
                                onClick={async () => {
                                    await onUpdate(item.id, "approved");
                                }}
                            >
                                Approve
                            </Button>
                        </div>
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
                            {item.trans_employees_trans_cash_advances_approval_byTotrans_employees && (
                                <Tooltip
                                    className="pointer-events-auto"
                                    content={getEmpFullName(
                                        item.trans_employees_trans_cash_advances_approval_byTotrans_employees
                                    )}
                                >
                                    <Avatar
                                        isBordered
                                        radius="full"
                                        size="sm"
                                        src={
                                            item?.trans_employees_trans_cash_advances_approval_byTotrans_employees
                                                ?.picture ?? ""
                                        }
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
