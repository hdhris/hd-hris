import { toast } from "@/components/ui/use-toast";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { useUserInfo } from "@/lib/utils/getEmployeInfo";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { useQuery } from "@/services/queries";
import {
  Avatar,
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
  Spinner,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import axios from "axios";
import { usePathname } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IoIosAdd, IoIosCheckmark, IoIosClose } from "react-icons/io";
import { IoCheckmarkSharp } from "react-icons/io5";
import { MdOutlineBugReport } from "react-icons/md";

interface HelpReport {
  id: number;
  created_at: string;
  pathname: string;
  reporter_id: number;
  reviewer_id: number;
  description: string;
  trans_employees_sys_help_report_reporter_idTotrans_employees: EmployeeDetails;
  trans_employees_sys_help_report_reviewer_idTotrans_employees: EmployeeDetails;
}
interface EmployeeDetails {
  prefix: string | null;
  first_name: string;
  last_name: string;
  middle_name: string;
  suffix: string | null;
  extension: string;
  picture: string;
}

function HelpReport() {
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportID, setReportID] = useState(-1);
  //   const inVisible = false;
  const pathname = usePathname();
  const [newReport, setNewReport] = useState("");
  const userInfo = useUserInfo();
  console.log("User Info: ", userInfo)

  const {
    data: reports,
    isLoading,
    mutate,
  } = useQuery<HelpReport[]>(
    `/api/admin/utils/help-report?path=${encodeURIComponent(pathname)}`,
    { refreshInterval: 60000 }
  );
  const unresolved = useMemo(() => {
    if (reports) {
      return reports.filter((rep) => rep.reviewer_id === null).length;
    }
    return 0;
  }, [reports]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding, inputRef]);

  const handleReviewed = useCallback(
    async (id: number) => {
      setSubmitting(true);
      setReportID(id);
      try {
        await axios.post("/api/admin/utils/help-report/update", {
          reviewer_id: userInfo?.id,
          id: id,
        });

        toast({
          title: "Reviewed",
          description: "Report reviewed successfully!",
          variant: "success",
        });

        setNewReport("");
        setAdding(false);
        mutate();
      } catch (error) {
        toast({
          title: "Error",
          description: String(error),
          variant: "danger",
        });
      } finally {
        setSubmitting(false);
        setReportID(-1);
      }
    },
    [userInfo, mutate]
  );

  const handleSubmitReport = useCallback(async () => {
    setSubmitting(true);
    try {
      await axios.post("/api/admin/utils/help-report/create", {
        reporter_id: userInfo?.id,
        pathname: pathname,
        description: newReport,
      });
      // alert(newReport); // This should show the latest value

      toast({
        title: "Submitted",
        description: "Report submitted successfully!",
        variant: "success",
      });
      setNewReport("");
      setAdding(false);
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "danger",
      });
    }
    setSubmitting(false);
  }, [newReport, userInfo, pathname, mutate]);

  const topLeftContent = useMemo(() => {
    return adding ? (
      <div className={`w-full p-4 flex gap-2 ${submitting && "opacity-50"}`}>
        {userInfo && (
          <Tooltip
            content={userInfo ? getEmpFullName(userInfo) : "Invalid user"}
          >
            <Avatar
              isBordered
              alt={userInfo ? getEmpFullName(userInfo) : "Invalid user"}
              className="flex-shrink-0"
              size="sm"
              src={userInfo?.picture}
            />
          </Tooltip>
        )}
        <Textarea
          placeholder="Message"
          value={newReport}
          onValueChange={setNewReport}
          isReadOnly={submitting}
          ref={inputRef}
        />
      </div>
    ) : (
      <p className="!ms-3 my-auto w-full">{`${
        unresolved > 0 ? unresolved + " unresolved bugs" : "All bugs resolved"
      }`}</p>
    );
  }, [adding, submitting, userInfo, newReport, inputRef, unresolved]);

  const topRightContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-1">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onClick={() => setAdding(!adding)}
          isDisabled={submitting}
        >
          {adding ? <IoIosClose size={20} /> : <IoIosAdd size={20} />}
        </Button>
        {adding && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onClick={handleSubmitReport}
            isDisabled={submitting}
          >
            <IoIosCheckmark size={20} />
          </Button>
        )}
      </div>
    );
  }, [adding, submitting, handleSubmitReport]);
  return (
    <Badge
      content=""
      isInvisible={unresolved === 0}
      color="danger"
      placement="top-right"
    >
      <Popover placement="right-start" onClose={() => setAdding(false)}>
        <PopoverTrigger>
          <Button isIconOnly variant="light" radius="md" disableAnimation>
            <MdOutlineBugReport
              size={30}
              className={unresolved === 0 ? "text-gray-400" : "text-danger-500"}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <div className="w-full flex justify-end">
            {topLeftContent}
            {topRightContent}
          </div>
          {isLoading ? (
            <Spinner className="w-72 my-5" size="sm" />
          ) : reports && reports.length ? (
            <ScrollShadow className="max-h-80">
              <div className="p-4 flex flex-col gap-1">
                {reports.map((report, index) => (
                  <div key={report.id}>
                    <div className="flex gap-2 items-start">
                      <Tooltip
                        content={getEmpFullName(
                          report.trans_employees_sys_help_report_reporter_idTotrans_employees
                        )}
                      >
                        <Avatar
                          isBordered
                          alt={getEmpFullName(
                            report.trans_employees_sys_help_report_reporter_idTotrans_employees
                          )}
                          className="flex-shrink-0"
                          size="sm"
                          src={
                            report
                              ?.trans_employees_sys_help_report_reporter_idTotrans_employees
                              ?.picture
                          }
                        />
                      </Tooltip>
                      <p className="w-52 text-ellipsis overflow-hidden">
                        {report.description}
                      </p>
                      <div className="bg-gray-500 w-[1px] h-8" />
                      {report.reviewer_id ? (
                        <Tooltip
                          content={getEmpFullName(
                            report.trans_employees_sys_help_report_reviewer_idTotrans_employees
                          )}
                        >
                          <Avatar
                            isBordered
                            alt={getEmpFullName(
                              report.trans_employees_sys_help_report_reviewer_idTotrans_employees
                            )}
                            className="flex-shrink-0"
                            size="sm"
                            src={
                              report
                                .trans_employees_sys_help_report_reviewer_idTotrans_employees
                                .picture
                            }
                          />
                        </Tooltip>
                      ) : (
                        <Button
                          {...uniformStyle({
                            color: "success",
                            size: "sm",
                          })}
                          className="shadow-md"
                          isDisabled={adding || reportID != -1}
                          isLoading={reportID === report.id}
                          isIconOnly
                          variant="flat"
                          onClick={() => handleReviewed(report.id)}
                        >
                          <IoCheckmarkSharp className="size-5 text-success-500" />
                        </Button>
                      )}
                    </div>
                    {index < reports.length - 1 && (
                      <div className="my-2 h-[1px] bg-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollShadow>
          ) : (
            <div className="text-gray-500 w-72 text-center my-5">No Report</div>
          )}
        </PopoverContent>
      </Popover>
    </Badge>
  );
}

export default HelpReport;
