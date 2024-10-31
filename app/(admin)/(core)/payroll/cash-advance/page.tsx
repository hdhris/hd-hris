"use client";
import UserMail from "@/components/common/avatar/user-info-mail";
import { FilterItemsProps } from "@/components/common/filter/FilterItems";
import SearchFilter from "@/components/common/filter/SearchFilter";
import { SearchItemsProps } from "@/components/common/filter/SearchItems";
import TableData from "@/components/tabledata/TableData";
import { toast } from "@/components/ui/use-toast";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import showDialog from "@/lib/utils/confirmDialog";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import {
  approvalStatusColorMap,
  ApprovalStatusType,
} from "@/types/attendance-time/OvertimeType";
import { LoanRequest } from "@/types/payroll/cashAdvanceType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Tooltip, Avatar } from "@nextui-org/react";
import axios from "axios";
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { IoCloseSharp, IoCheckmarkSharp } from "react-icons/io5";

function Page() {
  const { data, isLoading } = useQuery<LoanRequest[]>(
    "/api/admin/payroll/cash-advance",
    {
      refreshInterval: 5000,
    }
  );
  const [loanRequests, setLoadRequests] = useState<LoanRequest[]>([]);
  const userID = useEmployeeId();

  const onUpdate = async (
    id: number,
    status: ApprovalStatusType,
    approved_by: number
  ) => {

    toast({
      title: "Not yet implemented",
      variant: "warning",
    });
    return
    ////////////////////////////
    const isApproved = status === "approved";
    const response = await showDialog({
      title: `${isApproved ? "Appoval" : "Rejection"}`,
      message: `Do you confirm to ${isApproved ? "approve" : "reject"} ${
        loanRequests.find((lr) => lr.id === id)!
          .trans_employees_trans_cash_advances_employee_idTotrans_employees
          .last_name
      }'s cash advance request?`,
      preferredAnswer: isApproved ? "yes" : "no",
    });
    if (response === "yes") {
      try {
        const data = {
          id: id,
          status: status,
          approval_by: approved_by,
        };
        await axios.post("///", data);
        toast({
          title: isApproved ? "Approved" : "Rejected",
          description: "Cash advance request has been " + status,
          variant: isApproved ? "success" : "default",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Error: " + error,
          variant: "danger",
        });
      }
    }
  };

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
        config={config(userID!, onUpdate)}
        isLoading={isLoading}
        classNames={{ td: "[&:nth-child(n):not(:nth-child(2))]:w-[160px]" }}
      />
    </div>
  );
}

export default Page;

const searchConfig = [
  {
    key: [
      "trans_employees_trans_cash_advances_employee_idTotrans_employees",
      "last_name",
    ],
    label: "Full Name",
  },
  {
    key: [
      "trans_employees_trans_cash_advances_employee_idTotrans_employees",
      "first_name",
    ],
    label: "",
  },
  {
    key: [
      "trans_employees_trans_cash_advances_employee_idTotrans_employees",
      "middle_name",
    ],
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
  userID: number,
  onUpdate: (
    id: number,
    status: ApprovalStatusType,
    approved_by: number
  ) => void
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
              key={
                item
                  .trans_employees_trans_cash_advances_employee_idTotrans_employees
                  .id
              }
              name={getEmpFullName(
                item.trans_employees_trans_cash_advances_employee_idTotrans_employees
              )}
              email={
                item
                  .trans_employees_trans_cash_advances_employee_idTotrans_employees
                  .email
              }
              picture={
                item
                  .trans_employees_trans_cash_advances_employee_idTotrans_employees
                  .picture
              }
            />
          );
        case "request_date":
          return <p>{toGMT8(item.created_at).format("DD MMMM YYYY")}</p>;
        case "amount_requested":
          return <strong>{item.amount_requested}</strong>;
        case "amount_disbursed":
          return item.trans_cash_advance_disbursements.length ? (
            <p className="font-bold">
              {item.trans_cash_advance_disbursements[0]?.amount}
            </p>
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
                  await onUpdate(item.id, "rejected", userID);
                }}
              >
                <IoCloseSharp className="size-5 text-danger-500" />
              </Button>
              <Button
                {...uniformStyle({ color: "success" })}
                startContent={
                  <IoCheckmarkSharp className="size-5 text-white" />
                }
                className="text-white"
                onClick={async () => {
                  await onUpdate(item.id, "approved", userID);
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
                      item
                        ?.trans_employees_trans_cash_advances_approval_byTotrans_employees
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
