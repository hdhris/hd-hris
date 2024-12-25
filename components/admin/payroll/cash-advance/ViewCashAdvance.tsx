import Drawer from "@/components/common/Drawer";
import { GrMoney } from "react-icons/gr";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { formatCurrency } from "@/lib/utils/numberFormat";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { approvalStatusColorMap } from "@/types/attendance-time/OvertimeType";
import { LoanRequest } from "@/types/payroll/cashAdvanceType";
import { Avatar, Chip, ScrollShadow, Textarea } from "@nextui-org/react";
import React, { useMemo } from "react";
import { ValueLabel } from "../../attendance-time/overtime/view-overtime";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdHowToVote, MdOutlineGroups2, MdOutlineMessage } from "react-icons/md";
import { capitalize } from "lodash";
import Evaluators from "@/components/common/evaluators/evaluators";
import { mutate } from "swr";

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
                <ScrollShadow className="space-y-4 py-2">
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
                        key={"status"}
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
                        key={"date"}
                        icon={<FaRegCalendarAlt />}
                        label="Requested Date"
                        value={toGMT8(cashAdvance.created_at).format("MMMM DD, YYYY")}
                    />
                    <hr />
                    <ValueLabel
                        key={"reason"}
                        icon={<MdOutlineMessage />}
                        label="Reason"
                        vertical
                        value={<Textarea value={cashAdvance.reason} readOnly />}
                    />
                    {cashAdvance.evaluators && (
                        <>
                            <hr key={6} />
                            <ValueLabel
                                key={"evaluators"}
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
                </ScrollShadow>
            )}
        </Drawer>
    );
}

export default ViewCashAdvance;
