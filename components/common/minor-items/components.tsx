import { MinorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { Avatar, Card, cn } from "@nextui-org/react";

export function EmployeeHeader({employee}:{employee: MinorEmployee}) {
    return (
        <div className="flex items-center gap-4 p-2">
            <Avatar isBordered src={employee?.picture ?? ""} />
            <div>
                <p className="text-medium font-semibold">{getEmpFullName(employee)}</p>
                <p className="text-sm">{employee.ref_job_classes.name}</p>
            </div>
        </div>
    );
}

export const BorderedCard = ({
    icon,
    title,
    description,
    onPress,
    isPressable,
    color = "default",
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    onPress?: () => void;
    isPressable?: boolean;
    color?: "danger" | "warning" | "success" | "default";
}) => {
    return (
        <Card
            isPressable={isPressable}
            onPress={onPress}
            shadow="none"
            className={cn(
                "border p-4 flex-row justify-between items-center w-full",
                color === "danger"
                    ? "border-danger-500 text-danger-500 bg-red-50"
                    : color === "warning"
                    ? "border-warning-500 text-warning-500 bg-warning-50"
                    : color === "success"
                    ? "border-success-500 text-success-500 bg-success-50"
                    : ""
            )}
        >
            <div>
                <p className="text-small font-semibold text-start">{title}</p>
                <p className="text-small text-start">{description}</p>
            </div>
            {icon}
        </Card>
    );
};
