"use client";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@/services/queries";
import axios from "axios";
import showDialog from "@/lib/utils/confirmDialog";
import React, { useState } from "react";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import { Avatar, Button, Chip, Tooltip, User } from "@nextui-org/react";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { IoMdCloseCircle } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import UserMail from "@/components/common/avatar/user-info-mail";
import OvertimeModal from "@/components/admin/attendance-time/overtime/view-modal";
import { objectIncludes } from "@/helper/filterObject/filterObject";
import { useEmployeeId } from "@/hooks/employeeIdHook";

const handleDelete = async (id: Number, name: string) => {
  try {
    const result = await showDialog({
      title: "Confirm Delete",
      message: `Are you sure you want to delete '${name}' ?`,
    });
    if (result === "yes") {
      await axios.post("/api/admin/payroll/payhead/delete", {
        id: id,
      });
      toast({
        title: "Deleted",
        description: "Earning deleted successfully!",
        variant: "warning",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Error: " + error,
      variant: "danger",
    });
  }
};

const statusColorMap: Record<string, "danger" | "success" | "default"> = {
  pending: "default",
  approved: "success",
  rejected: "danger",
};

// const statusColorMap = {
//   pending: "text-danger-500",
//   approved: "text-success-500",
//   denied: "text-danger-500",
// };

// function items(item: OvertimeEntry): GridItemProps[] {
//   return [
//     {
//       column: "date",
//       label: "Date",
//       value: new Date(item.date),
//     },
//     {
//       column: "clock_in",
//       label: "Time In",
//       value: new Time(item.clock_in),
//     },
//     {
//       column: "clock_in",
//       label: "Time Out",
//       value: new Time(item.clock_out),
//     },
//     {
//       column: "minutes",
//       label: "Requested",
//       value: item.rendered_mins,
//     },
//     {
//       column: "checkbox",
//       label: "Greater than 40 mins",
//       value: item.rendered_mins > 30,
//     },
//   ];
// }

function Page() {
  const userID = useEmployeeId();
  SetNavEndContent((router) => (
    <Button
      {...uniformStyle()}
      onClick={() => router?.push("/attendance-time/overtime/create")}
    >
      File Overtime
    </Button>
  ));
  const [isVisible, setVisible] = useState(false);
  const [isPending, setPending] = useState({ id: 0, method: "approved" });
  const [selectedOvertime, setSelectedOvertime] = useState<
    OvertimeEntry | undefined
  >();
  const { data, isLoading } = useQuery<OvertimeEntry[]>(
    "/api/admin/attendance-time/overtime",
    3000
  );
  const config: TableConfigProps<OvertimeEntry> = {
    columns: [
      { uid: "request_date", name: "Request Date", sortable: true },
      { uid: "overtime_date", name: "Overtime Date", sortable: true },
      { uid: "name", name: "Name", sortable: true },
      { uid: "overtime", name: "Overtime", sortable: true },
      { uid: "duration", name: "Duration", sortable: true },
      { uid: "action", name: "Action", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <UserMail
              name={item.full_name}
              email={item.trans_employees_overtimes.email}
              picture={item.trans_employees_overtimes.picture}
            />
          );
        case "request_date":
          return <p>{toGMT8(item.created_at).format("DD MMMM YYYY")}</p>;
        case "overtime_date":
          return <p>{toGMT8(item.date).format("DD MMMM YYYY")}</p>;
        case "overtime":
          return (
            <p>
              <strong>{toGMT8(item.clock_in).format("hh:mm a")}</strong> -{" "}
              <strong>{toGMT8(item.clock_out).format("hh:mm a")}</strong>
            </p>
          );
        case "duration":
          return (
            <p>{calculateShiftLength(item.clock_in, item.clock_out, 0)}</p>
          );
        case "action":
          return item.status === "pending" ? (
            <div className="flex gap-1 items-center">
              <Button
                isIconOnly
                variant="flat"
                isLoading={
                  isPending.id === item.id && isPending.method === "rejected"
                }
                {...uniformStyle({ color: "danger" })}
                onClick={async () => {
                  const result = await onUpdate({
                    ...item,
                    approved_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    approved_by: userID!,
                    status: "rejected",
                    rate_per_hour: "0",
                  });
                }}
              >
                <IoCloseSharp className="size-5 text-danger-500" />
              </Button>
              <Button
                {...uniformStyle({ color: "success" })}
                isLoading={
                  isPending.id === item.id && isPending.method === "approved"
                }
                startContent={
                  <IoCheckmarkSharp className="size-5 text-white" />
                }
                className="text-white"
                onClick={async () => {
                  const result = await onUpdate({
                    ...item,
                    approved_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    approved_by: userID!,
                    status: "approved",
                    rate_per_hour: String(
                      item.trans_employees_overtimes.ref_job_classes.pay_rate
                    ),
                  });
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
                color={statusColorMap[item.status]}
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
                  src={
                    item?.trans_employees_overtimes_approvedBy?.picture ?? ""
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

  const onUpdate = async (
    value: OvertimeEntry
  ): Promise<OvertimeEntry | null> => {
    setPending({ id: value.id, method: value.status });
    const isApproved = value.status === "approved";
    const response = await showDialog({
      title: `${isApproved ? "Appoval" : "Rejection"}`,
      message: `Do you confirm to ${isApproved ? "approve" : "reject"} ${
        value.trans_employees_overtimes.last_name
      }'s overtime application?`,
      preferredAnswer: isApproved ? "yes" : "no",
    });
    if (response === "yes") {
      try {
        await axios.post(
          "/api/admin/attendance-time/overtime/update",
          objectIncludes(value, [
            "id",
            "comment",
            "approved_at",
            "updated_at",
            "approved_by",
            "status",
            "rate_per_hour",
          ])
        );
        toast({
          title: isApproved ? "Approved" : "Rejected",
          description: "Overtime has been " + value.status,
          variant: isApproved ? "success" : "default",
        });
        return value;
      } catch (error) {
        toast({
          title: "Error",
          description: "Error: " + error,
          variant: "danger",
        });
      }
    }
    setPending({ id: 0, method: value.status });
    return null;
  };

  return (
    <>
      <TableData
        config={config}
        items={data || []}
        isLoading={isLoading}
        isHeaderSticky
        isStriped
        selectionMode="single"
        aria-label="Overtime entries"
        onRowAction={(key) => {
          // alert(`Opening item ${key}...`);
          const item = data?.find((item) => item.id === Number(key));
          setSelectedOvertime(item);
          console.log(item);
          // if(selectedOvertime){
          //   setVisible(true)
          // }
          setVisible(true);
        }}
        classNames={{ wrapper: "h-fit-navlayout" }}
      />
      <OvertimeModal
        visible={isVisible}
        overtimeData={selectedOvertime}
        onClose={() => setVisible(false)}
        onUpdate={onUpdate}
        isPending={isPending}
      />
    </>
    // <div className="h-full overflow-auto flex flex-col bg-blue-500">
    //   {/* <GridList items={data || []}>
    //     {(item: OvertimeEntry) => (
    //       <GridCard
    //         name={item.full_name}
    //         size="sm"
    //         wide
    //         items={items(item)}
    //         avatarProps={{ src: item.trans_employees_overtimes.picture }}
    //         status={{ label: item.status, color: statusColorMap[item.status] }}
    //         deadPulse={["denied", "pending"].includes(item.status)}
    //         bottomShadow={false}
    //       />
    //     )}
    //   </GridList> */}
    // </div>
  );
}

export default Page;
