"use client";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@/services/queries";
import axios from "axios";
import showDialog from "@/lib/utils/confirmDialog";
import React, { useState } from "react";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import { Button, Chip, User } from "@nextui-org/react";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
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
import { useRouter } from "next/router";
import { objectIncludes } from "@/helper/filterObject/filterObject";
import { useEmployeeId } from "@/hooks/employeeIdHook";

const handleDelete = async (id: Number, name: string) => {
  try {
    const result = await showDialog(
      "Confirm Delete",
      `Are you sure you want to delete '${name}' ?`,
      false
    );
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
  const [isPending, setPending] = useState(false);
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
            <div className="flex gap-1 items-center mx-auto">
              <Button
                isIconOnly
                variant="flat"
                {...uniformStyle({ color: "danger" })}
                onClick={()=>{
                  onUpdate({
                    ...data?.find(v=> v.id === item.id)!,
                    id: item.id,
                    approved_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    approved_by: userID!,
                    status: "rejected",
                  });
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
                onClick={()=>{
                  onUpdate({
                    ...data?.find(v=> v.id === item.id)!,
                    id: item.id,
                    approved_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    approved_by: userID!,
                    status: "approved",
                  });
                }}
              >
                Approve
              </Button>
            </div>
          ) : (
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
          );
        default:
          return <></>;
      }
    },
  };

  const onUpdate = async (value: OvertimeEntry) => {
    console.log(
      objectIncludes(value, [
        "id",
        "comment",
        "approved_at",
        "updated_at",
        "approved_by",
        "status",
      ])
    );
    const isApproved = value.status === "approved";
    const response = await showDialog(
      `${isApproved ? "Appoval" : "Rejection"}`,
      `Confirm ${isApproved ? "approval" : "rejection"}...`,
      false
    );
    if (response === "yes") {
      try {
        await axios.post(
          "/api/admin/attendance-time/overtime/update",
          objectIncludes(value, [
            "comment",
            "approved_at",
            "updated_at",
            "approved_by",
            "status",
          ])
        );
        toast({
          title: isApproved ? "Approved" : "Rejected",
          description: "Overtime has been " + value.status,
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
    <>
      <TableData
        config={config}
        items={data || []}
        isLoading={isLoading}
        isHeaderSticky
        isStriped
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
        pending={isPending}
        overtimeData={selectedOvertime}
        onClose={() => setVisible(false)}
        onUpdate={onUpdate}
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
