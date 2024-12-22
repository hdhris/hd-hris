import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const static_privilege = {
    modules: [
        {
            name: "All",
            path: ["/"],
        },
        {
            name: "Dashboard",
            path: ["/dashboard"],
        },
        {
            name: "Employees",
            path: ["/employeemanagement"],
        },
        {
            name: "Attendance and Time",
            path: ["/attendance-time"],
        },
        {
            name: "Benefits",
            path: ["/benefits"],
        },
        {
            name: "Incident",
            path: ["/incident"],
        },
        {
            name: "Leaves",
            path: ["/leaves"],
        },
        {
            name: "Payroll",
            path: ["/payroll"],
        },
        {
            name: "Privileges",
            path: ["/privileges"],
        },
        {
            name: "Signatories",
            path: ["/signatories"],
        },
        {
            name: "Reports",
            path: ["/reports"],
        },
        {
            name: "Trainings and Seminars",
            path: ["/trainings-and-seminars"],
        },
        {
            name: "Performance Appraisal",
            path: ["/performance"],
        },
        {
            name: "APIs",
            path: ["/api"],
        },
        {
            name: "Tests",
            path: ["/test"],
        },
    ],
    web_access: true,
};

type ModuleNames = 
  "Dashboard" | 
  "Employees" | 
  "Attendance and Time" | 
  "Benefits" | 
  "Incident" | 
  "Leaves" | 
  "Payroll" | 
  "Privileges" | 
  "Signatories" | 
  "Test" | 
  "Trainings and Seminars" |
  "Performance Appraisal" |
  "Reports" |
  "APIs";

export const staticModulePaths = static_privilege?.modules.flatMap((module) => module.path);

export function useModulePath() {
    const [allPaths, setAllPaths] = useState<string[]>([]);
    const { data } = useSession();

    useEffect(() => {
        if (data?.user?.modulePaths) {
            setAllPaths(data?.user?.modulePaths);
        }
    }, [data]);

    function isPathAuthorized(pathname: string) {
        const shouldValidatePath = staticModulePaths.some((staticPath) => pathname.startsWith(staticPath));
        return allPaths.some((allowedPath) =>
            shouldValidatePath ? pathname.startsWith(allowedPath) : true
        );
    }

    function isModuleAuthorized(name: ModuleNames) {
        const paths = static_privilege.modules.find(module => module.name === name)?.path;
        return paths?.some(path => allPaths.includes(path));
    }

    function getPathsByName(name: ModuleNames){
        return static_privilege.modules.find(module => module.name === name)?.path;
    }


    return {
        allPaths,
        isPathAuthorized,
        isModuleAuthorized,
        getPathsByName,
    };
}
