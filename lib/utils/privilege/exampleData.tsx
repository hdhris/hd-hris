interface Privilege {
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

const privilegeData: Privilege = {
  access: true,
  web: {
    access: true,
    payroll: {
      access: true,
      process: {
        access: true,
        view_process: true,
        process_payroll: true,
        deploy_payroll: true,
      },
    },
    attendance: {
      access: true,
      records: {
        access: true,
        view_logs: true,
      },
      schedule: {
        access: true,
        create_schedule: true,
        read_schedule: true,
      },
    },
  },
};

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
function usePrivilege(): Privilege["web"] {
  const privileges = privilegeData.web;
  return createProxy(privileges);
}

// Example usage in a component
function PrivilegePage() {
  const privilege = usePrivilege().payroll; // Get web privileges

  // Check if the payroll access exists dynamically
  if (privilege) {
    // Render Payroll module
    return (
      <div>
        <h1>Payroll</h1>
        {privilege.process ? (
          // Has access to payroll processing module
          <div>
            <p>List of payrolls</p>

            <ul className=" list-disc ms-4">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i}>
                  <div className=" flex flex-row gap-4">
                    <p>Payroll {i + 1}</p>
                    {privilege.process.process_payroll && (
                      // Has access to payslips
                      <button>Edit payslip {i + 1}</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ): "No access. (router returns to dashboards)"}
        {privilege.process.deploy_payroll && (
          // Can deploy payroll
          <button>Deploy All</button>
        )}
      </div>
    );
  }

  // If no payroll access, return not found
  return <div>404 not found</div>;
}

export default PrivilegePage;
