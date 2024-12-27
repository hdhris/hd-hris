"use client";
import React, { useEffect, useState } from "react";
import { Card, CardBody, ScrollShadow, Chip, Divider } from "@nextui-org/react";
import { Department } from "@/types/employeee/DepartmentType";
import { Employee } from "@/types/employeee/EmployeeType";
import Typography from "@/components/common/typography/Typography";
import CardView from "@/components/common/card-view/card-view";
import dayjs from "dayjs";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import OrganizationalChart from "./organizational-chart";

interface Position {
  id: string | number;
  name: string;
  superior_id: number | null;
  is_superior: boolean;
  employees: Employee[];
  subordinates?: Position[];
}

interface ViewDepartmentProps {
  department: Department;
  onDepartmentUpdated: () => Promise<void>;
  onClose: () => void;
  employees: Employee[];
}

const ViewDepartment: React.FC<ViewDepartmentProps> = ({
  department: initialDepartment,
  onDepartmentUpdated,
  onClose,
  employees,
}) => {
  const [department, setDepartment] = useState<Department>(initialDepartment);
  const [hierarchyData, setHierarchyData] = useState<Position[]>([]);

  useEffect(() => {
    if (initialDepartment) {
      setDepartment(initialDepartment);
    }
  }, [initialDepartment]);

  useEffect(() => {
    if (employees.length && department) {
      const departmentEmployees = employees.filter(
        (emp) => Number(emp.department_id) === department.id
      );

      const positions = departmentEmployees.reduce((acc, emp) => {
        if (emp.ref_job_classes) {
          const posId = emp.ref_job_classes.id;
          if (!acc[posId]) {
            acc[posId] = {
              id: posId,
              name: emp.ref_job_classes.name || 'Unknown Position',
              superior_id: emp.ref_job_classes.superior_id,
              is_superior: emp.ref_job_classes.is_superior || false,
              employees: [],
              subordinates: [],
            };
          }
          acc[posId].employees.push(emp);
        } else {
          const unassignedId = 'unassigned';
          if (!acc[unassignedId]) {
            acc[unassignedId] = {
              id: unassignedId,
              name: 'Unassigned Position',
              superior_id: null,
              is_superior: false,
              employees: [],
              subordinates: [],
            };
          }
          acc[unassignedId].employees.push(emp);
        }
        return acc;
      }, {} as Record<string | number, Position>);

      const positionValues = Object.values(positions);
      const rootPositions: Position[] = [];

      const superiorPosition = positionValues.find(pos => pos.is_superior);
      if (superiorPosition) {
        rootPositions.push(superiorPosition);
        
        positionValues
          .filter(pos => pos.superior_id !== null)
          .forEach(pos => {
            const superiorId = pos.superior_id as number;
            if (positions[superiorId]) {
              if (!positions[superiorId].subordinates) {
                positions[superiorId].subordinates = [];
              }
              positions[superiorId].subordinates?.push(pos);
            }
          });

        positionValues
          .filter(pos => pos.id !== superiorPosition.id && (!pos.superior_id || !positions[pos.superior_id]))
          .forEach(pos => {
            if (!superiorPosition.subordinates) {
              superiorPosition.subordinates = [];
            }
            superiorPosition.subordinates?.push(pos);
          });
      } else {
        rootPositions.push(...positionValues);
      }

      setHierarchyData(rootPositions);
    }
  }, [department, employees]);

  const findDepartmentHead = () => {
    return employees.find(
      (employee) =>
        Number(employee.department_id) === department.id &&
        employee.ref_job_classes?.is_superior === true
    );
  };

  const departmentHead = findDepartmentHead();

  const countDepartmentEmployees = () => {
    return employees.filter(
      (employee) => Number(employee.department_id) === department.id
    ).length;
  };

  return (
    <CardView
      onClose={onClose}
      className="max-h-[90vh] flex flex-col"
      header={
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div className="flex items-center space-x-5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-semibold shadow-sm"
              style={{ backgroundColor: department.color || "gray" }}
            >
              {department.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <Typography className="text-xl font-bold">{department.name}</Typography>
              <Chip
                size="sm"
                color={department.is_active ? "success" : "danger"}
                variant="flat"
                className="text-xs"
              >
                {department.is_active ? "Active" : "Inactive"}
              </Chip>
            </div>
          </div>
          <div className="text-right space-y-1">
            <Typography className="text-sm text-gray-500">Total Employees</Typography>
            <Typography className="text-2xl font-bold">{countDepartmentEmployees()}</Typography>
          </div>
        </div>
      }
      body={
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="p-4 space-y-4 flex-1 overflow-auto">
            <Card className="shadow-sm">
              <CardBody className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50/50 p-4 rounded-lg">
                    <Typography className="text-sm font-medium text-gray-500 mb-3">Department Head</Typography>
                    {departmentHead ? (
                      <div className="flex items-center gap-3">
                        <UserAvatarTooltip
                          user={{
                            name: `${departmentHead.first_name} ${departmentHead.last_name}`,
                            picture: departmentHead.picture || "",
                            id: departmentHead.id,
                          }}
                          avatarProps={{
                            classNames: { base: "!size-8" },
                            isBordered: true,
                          }}
                        />
                        <div className="space-y-0.5">
                          <Typography className="text-sm font-semibold">{`${departmentHead.first_name} ${departmentHead.last_name}`}</Typography>
                          <Typography className="text-xs text-gray-500">{departmentHead.ref_job_classes?.name || 'Department Head'}</Typography>
                        </div>
                      </div>
                    ) : (
                      <Typography className="text-sm text-gray-700">No department head assigned</Typography>
                    )}
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-lg">
                    <Typography className="text-sm font-medium text-gray-500 mb-3">Created At</Typography>
                    <Typography className="text-sm font-semibold text-gray-700">
                      {department.created_at
                        ? dayjs(department.created_at).format("MMMM D, YYYY")
                        : "N/A"}
                    </Typography>
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-lg">
                    <Typography className="text-sm font-medium text-gray-500 mb-3">Last Updated</Typography>
                    <Typography className="text-sm font-semibold text-gray-700">
                      {department.updated_at
                        ? dayjs(department.updated_at).format("MMMM D, YYYY")
                        : "N/A"}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm flex-1">
              <CardBody className="p-4">
                <Typography className="text-lg font-bold mb-3">
                  Organizational Structure
                </Typography>
                <Divider className="mb-3" />
                <div className="relative">
                  <ScrollShadow className="max-h-[400px] overflow-auto">
                    <div className="w-fit p-4">
                      {hierarchyData.length > 0 ? (
                        <OrganizationalChart 
                          positions={hierarchyData} 
                          departmentColor={department.color || "#000000"} 
                        />
                      ) : (
                        <Typography className="text-sm text-gray-500 text-center py-8">
                          No organizational structure available
                        </Typography>
                      )}
                    </div>
                  </ScrollShadow>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      }
    />
  );
};

export default ViewDepartment;