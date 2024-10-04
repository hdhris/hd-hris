import { Privilege } from "./privilegeReader";

export const privilegeData: Privilege = {
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