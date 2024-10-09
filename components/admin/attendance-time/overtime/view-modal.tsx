import React, { useState, useEffect, useCallback, ReactElement } from "react";
import {
  Modal,
  Button,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Textarea,
  Avatar,
  Chip,
  Spinner,
  cn,
  Input,
} from "@nextui-org/react";
import { Form } from "@/components/ui/form";
import FormFields from "@/components/common/forms/FormFields";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { FaRegClock } from "react-icons/fa6";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { TbClock, TbClockCancel, TbClockCheck } from "react-icons/tb";
import TableData from "@/components/tabledata/TableData";
import axios, { AxiosResponse } from "axios";
import { axiosInstance } from "@/services/fetcher";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { PiClockCountdownFill } from "react-icons/pi";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import UserMail from "@/components/common/avatar/user-info-mail";

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (data: OvertimeEntry) => Promise<OvertimeEntry | null>;
  overtimeData?: OvertimeEntry;
  isPending: { id: number; method: string };
}

const statusColorMap: Record<string, "danger" | "success" | "warning"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const OvertimeModal: React.FC<ScheduleModalProps> = ({
  visible,
  onClose,
  onUpdate,
  overtimeData: data,
  isPending,
}) => {
  // Effect to populate modal fields if editing
  //   const load = useCallback(() => {
  //     if (overtimeData) {
  //     //   form.reset({
  //     //     ...overtimeData,
  //     //     clock_in: toGMT8(overtimeData.clock_in).format('HH:mm'),
  //     //     clock_out: toGMT8(overtimeData.clock_out).format('HH:mm'),
  //     //     date: toGMT8(overtimeData.date).format('YYYY-MM-DD'),
  //     //   });
  //     } else {
  //     //   form.reset({
  //     //     id: -1,
  //     //     clock_in: "",
  //     //     clock_out: "",
  //     //     date: "",
  //     //     comment: "",
  //     //   });
  //     }
  //   }, [overtimeData, form]);
  //   useEffect(() => {
  //     load();
  //   }, [overtimeData]);

  const [overtimeData, setOvertimeData] = useState<OvertimeEntry>();
  const [selectedKey, setSelectedKey] = useState(new Set([""]));
  const [isLoading, setIsLoading] = useState(false);
  const [recordData, setRecordData] = useState<OvertimeEntry[]>([]);
  const [comment, setComment] = useState("");
  const [ratePH, setRatePH] = useState("0.0");
  const userID = useEmployeeId();
  const fetchEmployeeOvertimeRecords = useCallback(
    async (entry: OvertimeEntry) => {
      console.log("FLAG");
      setOvertimeData(entry);
      setComment(entry?.comment || "");
      setRatePH(
        entry?.rate_per_hour ||
          String(entry.trans_employees_overtimes.ref_job_classes.pay_rate) ||
          "0"
      );
      setIsLoading(true);
      try {
        const response: AxiosResponse<OvertimeEntry[]> =
          await axiosInstance.get(
            `/api/admin/attendance-time/overtime/preview?id=${entry?.employee_id}`
          );
        setRecordData(response.data);
        setSelectedKey(new Set([String(entry?.id)]));
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [] // Depend on 'date' as it's used in the function
  );

  useEffect(() => {
    if (data) {
      fetchEmployeeOvertimeRecords(data);
    }
  }, [data]);

  useEffect(() => {
    if (overtimeData) {
      console.log(overtimeData);
    }
  }, [overtimeData]);

  const config: TableConfigProps<OvertimeEntry> = {
    columns: [
      { uid: "status", name: "Status", sortable: true },
      { uid: "overtime_date", name: "Overtime Date", sortable: true },
      { uid: "overtime", name: "Overtime", sortable: true },
      { uid: "duration", name: "Duration", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
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
          return <p>{item?.rendered_mins}</p>;
        case "status":
          return (
            <Chip
              startContent={
                item.status === "approved" ? (
                  <FaCheckCircle size={18} />
                ) : item.status === "pending" ? (
                  <PiClockCountdownFill size={18} />
                ) : (
                  <IoMdCloseCircle size={18} />
                )
              }
              variant="flat"
              color={statusColorMap[item.status]}
              className="capitalize mx-auto"
            >
              {item.status}
            </Chip>
          );
        default:
          return <></>;
      }
    },
  };

  return (
    <Modal isOpen={visible} onClose={onClose} size="4xl">
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <Avatar
              isBordered
              radius="full"
              size="md"
              src={overtimeData?.trans_employees_overtimes?.picture ?? ""}
            />
            <p className="semi-bold">
              {getEmpFullName(overtimeData?.trans_employees_overtimes!)}
            </p>
          </div>
          <div className="flex gap-2 items-center me-4">
            <p className="text-small font-normal">
              Requested on:{" "}
              <span className="font-semibold">
                {toGMT8(overtimeData?.created_at).format("ddd, MMM DD YYYY")}
              </span>
            </p>
            {overtimeData?.trans_employees_overtimes_approvedBy && (
              <UserMail
                name={`${
                  overtimeData.trans_employees_overtimes_approvedBy.last_name
                }, ${overtimeData.trans_employees_overtimes_approvedBy.first_name.slice(
                  0,
                  1
                )}.`}
                picture={
                  overtimeData?.trans_employees_overtimes_approvedBy.picture
                }
                description="Reviewer"
                size="sm"
              />
            )}
          </div>
          {/* {overtimeData ? "Review Overtime" : "File Overtime"} */}
        </ModalHeader>
        <ModalBody className="flex flex-row gap-4">
          <div className="flex flex-col gap-4 w-[440px]">
            <div className="flex w-full">
              <div className="flex-1">
                {/* {left} */}
                <p className="text-small font-semibold text-default-600">
                  Requested:
                </p>
                <div>
                  <Info
                    icon={<TbClock size={20} className="text-default-600" />}
                    content={calculateShiftLength(
                      new Date().toISOString(),
                      new Date().toISOString(),
                      -Number(overtimeData?.requested_mins)
                    )
                      .replace(" h", "h")
                      .replace("ou", "")
                      .replace(" and ", " ")
                      .replace(" m", "m")
                      .replace("ute", "")}
                  />
                  <Info
                    icon={
                      <TbClockCheck size={20} className="text-default-600" />
                    }
                    content={
                      overtimeData?.clock_in
                        ? toGMT8(overtimeData.clock_in).format("hh:mm a")
                        : "N/A"
                    }
                    label="Clock In"
                  />
                  <Info
                    icon={
                      <TbClockCancel size={20} className="text-default-600" />
                    }
                    content={
                      overtimeData?.clock_out
                        ? toGMT8(overtimeData.clock_out).format("hh:mm a")
                        : "N/A"
                    }
                    label="Clock Out"
                  />
                </div>
              </div>
              <div className="flex-1">
                {/* {left} */}
                <p className="text-small font-semibold text-default-600">
                  Rendered:
                </p>
                <div>
                  <Info
                    icon={<TbClock size={20} className="text-default-600" />}
                    content={
                      overtimeData?.clock_in && overtimeData.clock_out
                        ? calculateShiftLength(
                            overtimeData.clock_in,
                            overtimeData.clock_out,
                            0
                          )
                            .replace(" h", "h")
                            .replace("ou", "")
                            .replace(" and ", " ")
                            .replace(" m", "m")
                            .replace("ute", "")
                        : "N/A"
                    }
                  />
                  <Info
                    icon={
                      <TbClockCheck size={20} className="text-default-600" />
                    }
                    content={
                      overtimeData?.clock_in
                        ? toGMT8(overtimeData.clock_in).format("hh:mm a")
                        : "N/A"
                    }
                    label="Clock In"
                  />
                  <Info
                    icon={
                      <TbClockCancel size={20} className="text-default-600" />
                    }
                    content={
                      overtimeData?.clock_out
                        ? toGMT8(overtimeData.clock_out).format("hh:mm a")
                        : "N/A"
                    }
                    label="Clock Out"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-small font-semibold text-default-600">
                Reason:
              </p>
              <Textarea value={overtimeData?.reason} isReadOnly />
            </div>
            <div>
              <p className="text-small font-semibold text-default-600">
                Comment:
              </p>
              <Textarea
                value={comment}
                onValueChange={setComment}
                isReadOnly={overtimeData?.status != "pending"}
                placeholder="Add comment"
                classNames={{
                  inputWrapper: cn(
                    "border-2",
                    overtimeData?.status === "pending"
                      ? "border-primary"
                      : "border-gray-100"
                  ),
                }}
              />
            </div>
            <div>
              <p className="text-small font-semibold text-default-600">
                Rate Per Hour:
              </p>
              <Input
                value={ratePH}
                onValueChange={setRatePH}
                isReadOnly={overtimeData?.status != "pending"}
                type="number"
                placeholder="0.0"
                classNames={{
                  inputWrapper: cn(
                    "border-2 h-fit",
                    overtimeData?.status === "pending"
                      ? "border-primary"
                      : "border-gray-100"
                  ),
                }}
              />
            </div>
          </div>
          {isLoading ? (
            <Spinner label="Loading..." color="primary" className="w-full" />
          ) : (
            <TableData
              items={recordData}
              config={config}
              isHeaderSticky
              className="h-full"
              shadow="none"
              counterName="History"
              selectionMode="single"
              aria-label="History"
              disallowEmptySelection
              selectedKeys={selectedKey}
              onSelectionChange={(keys) => {
                const record = recordData.find(
                  (item) => String(item.id) === Array.from(keys)[0]
                );
                setSelectedKey(new Set(Array.from(keys).map(String)));
                setOvertimeData(record);
                setComment(record?.comment || "");
                setRatePH(record?.rate_per_hour || "0.0");
              }}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            className="me-auto"
            variant="light"
            onClick={onClose}
            {...uniformStyle()}
          >
            Close
          </Button>
          {overtimeData?.status === "pending" && (
            <>
              <Button
                variant="flat"
                isLoading={
                  isPending.id === overtimeData.id &&
                  isPending.method === "rejected"
                }
                onClick={async () => {
                  const result = await onUpdate({
                    ...overtimeData,
                    comment: comment,
                    rate_per_hour: "0",
                    approved_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    approved_by: userID!,
                    status: "rejected",
                  });
                  if (result) fetchEmployeeOvertimeRecords(result);
                }}
                {...uniformStyle({ color: "danger" })}
                startContent={
                  !(
                    isPending.id === overtimeData.id &&
                    isPending.method === "rejected"
                  ) && <IoCloseSharp className="size-5 text-danger-500" />
                }
              >
                Reject
              </Button>
              <Button
                type="submit"
                form="schedule-form"
                isLoading={
                  isPending.id === overtimeData.id &&
                  isPending.method === "approved"
                }
                {...uniformStyle({ color: "success" })}
                className="text-white"
                startContent={
                  !(
                    isPending.id === overtimeData.id &&
                    isPending.method === "approved"
                  ) && <IoCheckmarkSharp className="size-5 text-white" />
                }
                onClick={async () => {
                  const result = await onUpdate({
                    ...overtimeData,
                    comment: comment,
                    rate_per_hour: ratePH,
                    approved_at: toGMT8().toISOString(),
                    updated_at: toGMT8().toISOString(),
                    approved_by: userID!,
                    status: "approved",
                  });
                  if (result) fetchEmployeeOvertimeRecords(result);
                }}
              >
                Approve
              </Button>{" "}
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Info = ({
  icon,
  content,
  label,
}: {
  icon: ReactElement;
  content: string;
  label?: string;
}) => {
  return (
    <div className="flex-1 flex items-center gap-4 min-h-10">
      {icon}
      <div>
        <p className="font-semibold leading-none">{content}</p>
        <p className="text-tiny leading-none">
          <span className="font-semibold text-gray-500 leading-none">
            {label}
          </span>
        </p>
      </div>
    </div>
  );
};

export default OvertimeModal;
