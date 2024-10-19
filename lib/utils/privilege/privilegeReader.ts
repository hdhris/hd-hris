export interface Privilege {
  access: boolean;
  web: {
    access: boolean;
    payroll: {
      access: boolean;
      process: {
        access: boolean;
        view_process: boolean;
        process_payroll: boolean;
        deploy_payroll: boolean;
      };
    };
    attendance: {
      access: boolean;
      records: {
        access: boolean;
        view_logs: boolean;
      };
      schedule: {
        access: boolean;
        create_schedule: boolean;
        read_schedule: boolean;
      };
    };
  };
}

function createProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, prop: string | symbol) {
      // If the property exists in the object
      if (typeof prop === "string" && prop in obj) {
        const value = obj[prop as keyof T];

        // If the value is an object, check if it has 'access'
        if (typeof value === "object" && value !== null && "access" in value) {
          // If access is true, recursively proxy the nested object
          return (value as any).access ? createProxy(value) : false;
        }

        // Otherwise, return the value as it is
        return value;
      }
      return undefined;
    },
  });
}

// Custom hook to fetch privileges
export function usePrivilege(privileges : Privilege): Privilege["web"] {
  return createProxy(privileges.web);
}