'use client'
import React, {Suspense} from 'react';
import {Avatar, AvatarGroup, BadgeProps, Selection, Spinner, Tooltip} from "@nextui-org/react";
import Text from "@/components/Text";
import TableData from "@/components/tabledata/TableData";
import {TableConfigProps} from "@/types/table/TableDataTypes";
import {DepartmentInfo} from "@/types/employeee/DepartmentType";
import {departmentColumns, departmentFilter, departments} from "@/sampleData/admin/employees/Department";
import {CircleCheck, CircleX} from "lucide-react";
import {Switch as Switch2} from "@nextui-org/switch";
import {Case, Default, Switch} from "@/components/common/Switch";
import BorderCard from "@/components/common/BorderCard";


const department_status_color_map: Record<string, BadgeProps["color"]> = {
    active: "success", inactive: "danger",
}

function DepartmentTable() {


    const filterConfig = (key: Selection) => {

        let filteredUsers: DepartmentInfo[] = [...departments];

        if (key !== "all" && key.size > 0) {
            filteredUsers = filteredUsers.filter((item) => {
                const userProperties = Object.keys(item) as (keyof DepartmentInfo)[]; // Get all properties of user
                return userProperties.find(property => {
                    const propertyValue = item[property];
                    if (typeof propertyValue === 'string') {
                        return key.has(propertyValue.toLowerCase());
                    }
                });
            })
        }

        return filteredUsers;
    }
    const TableEntry: TableConfigProps<DepartmentInfo> = {
        columns: departmentColumns, rowCell: (item: DepartmentInfo, columnKey: React.Key) => {
            const cellValue = item[columnKey as keyof DepartmentInfo];
            const isActive = item.department_status.toLowerCase() === "active"
            return (<Switch expression={columnKey as string}>
                <Case of="heads">
                    <>
                        {item.heads || item.assistants ? <AvatarGroup isBordered className="w-fit" size='sm'>
                            <>
                                {item.heads && <Tooltip content={`Head - ${item.heads?.fullName}`}>
                                    <Avatar src={item.heads?.picture!}/>
                                </Tooltip>}
                            </>
                            <>{item.assistants && item.assistants.map((ass, index) => (
                                <Tooltip key={index} content={`Assistant - ${ass?.fullName}`}>
                                    <Avatar src={ass?.picture!}/>
                                </Tooltip>))}
                            </>
                        </AvatarGroup> : <Text>-----</Text>}
                    </>
                </Case>
                <Case of="members">
                    <>{item.associated_employees.length === 0 ? <Text>-----</Text> :
                        <AvatarGroup isBordered className="w-fit" size='sm'>
                            {item.associated_employees.map((data, index) => {
                                return (<Tooltip key={index} content={`${data.job_title} - ${data.fullName}`}>
                                    <Avatar src={data.picture!}/>
                                </Tooltip>)
                            })}
                        </AvatarGroup>

                    }</>
                </Case>
                <Case of="totalEmployees">
                    <Text>{item.total_employees}</Text>
                </Case>
                <Case of="department_status">
                    <Switch2
                        defaultSelected={isActive}
                        isSelected={isActive}
                        size="sm"
                        color={department_status_color_map[item.department_status.toLowerCase()]}
                        thumbIcon={() => isActive ? (<Tooltip color='danger' content={'Deactivate ' + item.department}>
                            <CircleCheck className="stroke-success-500"/>
                        </Tooltip>) : (<Tooltip color='success' content={'Activate ' + item.department}>
                            <CircleX className='stroke-danger-500'/>
                        </Tooltip>)}
                    />
                    {/*<Status color={department_status_color_map[item.department_status.toLowerCase()]}*/}
                    {/*        text={item.department_status}/>*/}
                </Case>

                <Default>
                    <Text>{String(cellValue)}</Text>
                </Default>
            </Switch>)
        }
    }

    return (<div className="h-full flex flex-col gap-2">

            <BorderCard heading="" className="w-full h-full overflow-hidden">
                <Suspense fallback={<Spinner/>}>
                    <TableData
                        aria-label="User Table"
                        config={TableEntry}
                        filterItems={departmentFilter}
                        filterConfig={filterConfig}
                        items={departments}
                        removeWrapper
                        isStriped
                        isCompact
                        // isLoading={isLoading}
                        selectionBehavior='toggle'
                        selectionMode="multiple"
                        isHeaderSticky
                        // endContent={addDepartment}
                        counterName="Department"
                        onRowAction={(key) => {
                            alert(key);
                        }}
                        searchingItemKey={["department"]}
                    />
                </Suspense>
            </BorderCard>
        </div>


    );

}

export default DepartmentTable;