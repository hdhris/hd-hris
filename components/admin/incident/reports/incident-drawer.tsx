import Drawer from "@/components/common/Drawer";
import { getEmpFullName, getFullAddress } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { IncidentReport } from "@/types/incident-reports/type";
import { Avatar, Button, Textarea, Tooltip } from "@nextui-org/react";
import { useMemo, useState } from "react";
import { ValueLabel } from "../../attendance-time/overtime/view-overtime";
import { BorderedCard, EmployeeHeader } from "@/components/common/minor-items/components";
import { FaRegCalendarAlt, FaRegUserCircle } from "react-icons/fa";
import { TbMessageReport } from "react-icons/tb";
import { MdOutlineMessage } from "react-icons/md";
import { IoDocumentAttachOutline, IoLocationOutline } from "react-icons/io5";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import PerformDisciplinary from "@/app/(admin)/(core)/incident/reports/PerformDisciplinary";
import { getDownloadUrl } from "@edgestore/react/utils";
import { AnimatedList } from "@/components/ui/animated-list";
import FileAttachments from "@/components/common/attachments/file-attachment-card/file-attachments";

interface IncidentDrawerProps {
    report: IncidentReport | null;
    onClose: () => void;
}
function IncidentDrawer({ report, onClose }: IncidentDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const employee = useMemo(() => {
        return report?.trans_employees_dim_incident_reports_employee_idTotrans_employees;
    }, [report]);

    const reporter = useMemo(() => {
        return report?.trans_employees_dim_incident_reports_reported_byTotrans_employees;
    }, [report]);

    const footer = useMemo(() => {
        let label = null;
        // if (report?.actions_taken === "Demotion") label = "Demote Employee";
        if (report?.actions_taken === "Payroll Deduction") label = "Deduct Payroll";
        if (report?.actions_taken === "Suspension") label = "Suspend Employee";
        if (report?.actions_taken === "Termination") label = "Terminate Employee";
        if (report?.actions_taken === "Send Warning") label = "Send Email";
        // if (report?.actions_taken === "Written Warning") label = "Send Email";

        return !label || report?.is_acted ? undefined : (
            <Button className="ms-auto" {...uniformStyle({ color: "danger" })} onPress={() => setIsOpen(true)}>
                {String(label)}
            </Button>
        );
    }, [report]);

    return (
        <>
            <Drawer isDismissible isOpen={!!report} onClose={onClose} title="Incident Report" footer={footer}>
                <div className="space-y-4">
                    {report && employee && reporter && (
                        <>
                            <EmployeeHeader employee={employee} />
                            <BorderedCard
                                icon={<div />}
                                title={employee.ref_branches.name}
                                description={getFullAddress(employee.ref_branches)}
                            />
                            <hr />
                            <ValueLabel
                                icon={<FaRegCalendarAlt />}
                                label="Date"
                                value={toGMT8(report.occurance_date).format("MMMM DD, YYYY")}
                            />
                            {/* <hr />
                            <ValueLabel
                                icon={<TbClockUp />}
                                label="Time"
                                value={toGMT8(report.occurance_date).format("hh:mm:a")}
                            /> */}
                            <hr />
                            <ValueLabel icon={<TbMessageReport />} label="Category" value={report.type} />
                            <hr />
                            <ValueLabel
                                icon={<IoLocationOutline />}
                                label="Scene of Incident"
                                value={report.location}
                            />
                            <hr />
                            <ValueLabel
                                icon={<MdOutlineMessage />}
                                label="Description"
                                vertical
                                value={<Textarea value={report.description} readOnly />}
                            />
                            <hr />
                            <ValueLabel
                                icon={<FaRegUserCircle />}
                                label="Reported By"
                                value={
                                    <Tooltip className="pointer-events-auto" content={getEmpFullName(reporter)}>
                                        <Avatar size="sm" src={reporter.picture} />
                                    </Tooltip>
                                }
                            />
                            <hr />
                            <ValueLabel
                                label="Attachments"
                                vertical
                                icon={<IoDocumentAttachOutline />}
                                value={
                                    <AnimatedList>
                                        {report.meta_files?.map((item, index) => {
                                            const download = getDownloadUrl(item.url);
                                            return (
                                                <FileAttachments
                                                    key={index}
                                                    fileName={item.name}
                                                    fileSize={item.size}
                                                    fileType={item.type}
                                                    downloadUrl={download}
                                                />
                                            );
                                        })}
                                    </AnimatedList>
                                }
                            />
                        </>
                    )}
                </div>
            </Drawer>
            <PerformDisciplinary isOpen={isOpen} report={report} onClose={() => setIsOpen(false)} onSuccess={onClose} />
        </>
    );
}

export default IncidentDrawer;
