import Drawer from "@/components/common/Drawer";
import { GrMoney } from "react-icons/gr";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { formatCurrency } from "@/lib/utils/numberFormat";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { approvalStatusColorMap } from "@/types/attendance-time/OvertimeType";
import { LoanRequest } from "@/types/payroll/cashAdvanceType";
import { Avatar, Chip, Textarea } from "@nextui-org/react";
import { useMemo } from "react";
import { ValueLabel } from "../../attendance-time/overtime/view-overtime";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdHowToVote, MdOutlineGroups2, MdOutlineMessage } from "react-icons/md";
import { capitalize } from "lodash";
import Evaluators from "@/components/common/evaluators/evaluators";
import { mutate } from "swr";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { AnimatedList } from "@/components/ui/animated-list";
import FileAttachments from "@/components/common/attachments/file-attachment-card/file-attachments";
import { getDownloadUrl } from "@edgestore/react/utils";

type CashAdvanceFormType = {
    onClose: () => void;
    cashAdvance: LoanRequest | null;
};

function ViewCashAdvance({ onClose, cashAdvance }: CashAdvanceFormType) {
    const currentEmployee = useMemo(() => {
        return cashAdvance?.trans_employees_trans_cash_advances_employee_idTotrans_employees;
    }, [cashAdvance]);

    return (
        <Drawer isOpen={!!cashAdvance} onClose={onClose} title={"Cash Advance Details"} isDismissible>
            {cashAdvance && currentEmployee && (
                <div className="space-y-4 py-2">
                    <div className="flex flex-col items-center gap-2">
                        <Avatar isBordered src={currentEmployee.picture} />
                        <p className="text-medium font-semibold">{getEmpFullName(currentEmployee)}</p>
                    </div>
                    <hr />
                    <ValueLabel
                        label="Amount Requested"
                        icon={<GrMoney />}
                        value={formatCurrency(cashAdvance.amount_requested)}
                    />
                    <hr />
                    <ValueLabel
                        icon={<MdHowToVote />}
                        label="Status"
                        value={
                            <Chip variant="flat" color={approvalStatusColorMap[cashAdvance.status]}>
                                {capitalize(cashAdvance.status)}
                            </Chip>
                        }
                    />
                    <hr />
                    <ValueLabel
                        icon={<FaRegCalendarAlt />}
                        label="Requested Date"
                        value={toGMT8(cashAdvance.created_at).format("MMMM DD, YYYY")}
                    />
                    <hr />
                    <ValueLabel
                        icon={<MdOutlineMessage />}
                        label="Reason"
                        vertical
                        value={<Textarea value={cashAdvance.reason} readOnly />}
                    />
                    <hr />
                    <ValueLabel
                        label="Attachments"
                        vertical
                        icon={<IoDocumentAttachOutline/>}
                        value={
                            <AnimatedList>
                                {cashAdvance.meta_files?.map((item, index) => {
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
                    {cashAdvance.evaluators && (
                        <>
                            <hr/>
                            <ValueLabel
                                icon={<MdOutlineGroups2 />}
                                label="Evaluators"
                                vertical
                                value={
                                    <div className="space-y-2">
                                        <Evaluators
                                            type={"Cash Advance"}
                                            evaluation={cashAdvance.evaluators}
                                            selectedEmployee={{
                                                id: cashAdvance.id,
                                                name: cashAdvance
                                                    .trans_employees_trans_cash_advances_employee_idTotrans_employees
                                                    .last_name,
                                            }}
                                            mutate={() => mutate("/api/admin/payroll/cash-advance")}
                                            onClose={onClose}
                                            evaluatorsApi="/api/admin/payroll/cash-advance/update"
                                        />
                                    </div>
                                }
                            />
                        </>
                    )}
                </div>
            )}
        </Drawer>
    );
}

export default ViewCashAdvance;
