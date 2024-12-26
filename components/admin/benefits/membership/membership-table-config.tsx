import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import {EmployeeBenefitDetails} from "@/types/benefits/membership/membership-types";
import React from "react";
import {Case, Switch} from "@/components/common/Switch";
import {Chip} from "@nextui-org/chip";
import {getColor} from "@/helper/background-color-generator/generator";
import {User} from "@nextui-org/react";
import {capitalize} from "@nextui-org/shared-utils";
import Typography from "@/components/common/typography/Typography";
import {numberWithCommas} from "@/lib/utils/numberFormat";
import {toPascalCase} from "@/helper/strings/toPascalCase";


export const MembersBenefitTableColumns: ColumnsProps[] = [{
    name: 'Name', uid: 'name', sortable: true
}, {
    name: 'Department', uid: 'department', sortable: true
}, {
    name: 'Job', uid: 'job', sortable: true
}, {
    name: 'Employment', uid: 'employment_status',
}, {
    name: 'Salary', uid: 'salary_grade',
}]


export const MembersBenefitTable: TableConfigProps<EmployeeBenefitDetails> = {
    rowCell: function (item: EmployeeBenefitDetails, columnKey: React.Key): React.ReactElement {
        const key = columnKey as keyof EmployeeBenefitDetails
        const cellValue = item[key] as string
        return (<Switch expression={columnKey as string}>
            <Case of="name">
                <User
                    name={item.name}
                    description={item.email}
                    avatarProps={{
                        src: item.picture
                    }}
                />
            </Case>
            <Case of="department">
                <Chip className="rounded" style={{
                    background: getColor(item.department, 0.2),
                    borderColor: getColor(item.department, 0.5),
                    color: getColor(item.department)
                }}
                      variant="bordered" classNames={{
                    content: "font-bold",
                }}>
                    {toPascalCase(item.department)}
                </Chip>
            </Case>
            <Case of="job">
                <Typography>{toPascalCase(item.job)}</Typography>
            </Case>
            <Case of="employment_status">
                <Typography>{capitalize(item.employment_status)}</Typography>
            </Case>
            <Case of="salary_grade">
                <Typography>{numberWithCommas(item.salary_grade)}</Typography>
            </Case>
        </Switch>)
    }, columns: MembersBenefitTableColumns
}