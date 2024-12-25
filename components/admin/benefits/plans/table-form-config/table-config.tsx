import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import {BenefitPlan} from "@/types/benefits/plans/plansTypes";
import React from "react";
import {Case, Switch} from "@/components/common/Switch";
import Typography from "@/components/common/typography/Typography";
import {Chip} from "@nextui-org/chip";
import {getColor} from "@/helper/background-color-generator/generator";
import {Avatar, AvatarGroup, Tooltip} from "@nextui-org/react";


export const benefitTableColumns: ColumnsProps[] = [{
    name: 'Name', uid: 'name', sortable: true
}, {
    name: 'Type', uid: 'type', sortable: true
}, {
    name: 'Validity Period', uid: 'validity_period', sortable: true
}, {
    name: 'Members', uid: 'members',
}, {
    name: 'Status', uid: 'status', sortable: true
}]


export const BenefitTable: TableConfigProps<BenefitPlan> = {
    rowCell: function (item: BenefitPlan, columnKey: React.Key): React.ReactElement {
        const key = columnKey as keyof BenefitPlan
        const cellValue = item[key] as string
        return (<Switch expression={columnKey as string}>
            <Case of="name">
                <Typography className="font-semibold">{cellValue}</Typography>
            </Case>
            <Case of="type">
                <Chip style={{
                    background: getColor(item.type, 0.2),
                    borderColor: getColor(item.type, 0.5),
                    color: getColor(item.type)
                }}
                      variant="bordered" classNames={{
                    content: "font-bold",
                }}>
                    {item.type}
                </Chip>
            </Case>
            <Case of="validity_period">
                <Typography>{item.effectiveDate} - {item.expirationDate}</Typography>
            </Case>
            <Case of="members">
                <AvatarGroup size="sm" isBordered>
                    {item.employees_avails?.map((emp) => {
                        return (
                            <Tooltip key={emp.id} content={emp.name}>
                                <Avatar
                                    key={emp.id}
                                    src={emp.picture}
                                    alt={emp.name}
                                />
                            </Tooltip>
                            )
                    })}
                </AvatarGroup>

            </Case>
            <Case of="status">
                <Chip className="border-none gap-1 text-default-600" color={item.isActive ? "success" : "danger"} variant="dot">{item.isActive ? "Active" : "Inactive"}</Chip>
            </Case>
        </Switch>)
    }, columns: benefitTableColumns
}