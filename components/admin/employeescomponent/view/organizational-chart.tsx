import React from "react";
import { Chip } from "@nextui-org/react";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import { Employee } from "@/types/employeee/EmployeeType";

interface Position {
  id: string | number;
  name: string;
  superior_id: number | null;
  is_superior: boolean;
  employees: Employee[];
  subordinates?: Position[];
}

interface OrganizationalChartProps {
  positions: Position[];
  departmentColor: string;
}

const OrganizationalChart: React.FC<OrganizationalChartProps> = ({ positions, departmentColor }) => {
  const renderPositionBox = (position: Position) => (
    <div className="flex flex-col items-center">
      <div 
        className="w-40 bg-white border border-gray-200 rounded-lg p-3 shadow-sm transition-all duration-300"
        style={{
          '--hover-bg-color': `${departmentColor}10`,
        } as React.CSSProperties}
      >
        <div className="text-center group">
          <h3 className="text-sm font-semibold mb-1 transition-colors group-hover:text-primary">{position.name}</h3>
          {position.is_superior && (
            <Chip 
              size="sm" 
              color="primary" 
              variant="flat" 
              className="mb-2 text-xs px-2 py-0.5 h-auto min-h-0"
            >
              Head
            </Chip>
          )}
          {position.employees.length > 0 && (
            <div className="flex flex-wrap justify-center gap-0.5 pt-2 border-t border-gray-100">
              {position.employees.slice(0, 4).map((emp) => (
                <UserAvatarTooltip
                  key={emp.id}
                  user={{
                    name: `${emp.first_name} ${emp.last_name}`,
                    picture: emp.picture || "",
                    id: emp.id,
                  }}
                  avatarProps={{
                    classNames: { base: "!size-5" },
                    isBordered: true,
                  }}
                />
              ))}
              {position.employees.length > 4 && (
                <span className="text-xs text-gray-500 ml-1">+{position.employees.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {position.subordinates && position.subordinates.length > 0 && (
        <>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex gap-6">
            {position.subordinates.map((subordinate, index) => (
              <div key={subordinate.id} className="relative">
                {index > 0 && (
                  <div className="absolute -top-3 -left-3 w-6 h-px bg-gray-200"></div>
                )}
                {index < position.subordinates!.length - 1 && (
                  <div className="absolute -top-3 -right-3 w-6 h-px bg-gray-200"></div>
                )}
                {renderPositionBox(subordinate)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const rootPosition = positions.find(pos => pos.is_superior) || positions[0];
  
  return rootPosition ? (
    <div className="flex justify-center pt-2">
      {renderPositionBox(rootPosition)}
    </div>
  ) : null;
};

export default OrganizationalChart;

