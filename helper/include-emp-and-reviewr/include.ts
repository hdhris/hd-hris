export const emp_rev_include = {
  employee_detail: {
    select: {
      id: true,
      last_name: true,
      middle_name: true,
      first_name: true,
      prefix: true,
      suffix: true,
      extension: true,
      email: true,
      contact_no: true,
      picture: true,
      ref_departments: {
        select: {
          id: true,
          name: true,
        },
      },
      ref_branches: {
        select: {
          id: true,
          name: true,
        },
      },
      ref_job_classes: {
        select: {
          id: true,
          name: true,
          pay_rate: true,
        },
      },
    },
  },
  reviewer_detail: {
    select: {
      last_name: true,
      middle_name: true,
      first_name: true,
      picture: true,
      email: true,
    },
  },
};

export interface UserEmployee {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  picture: string;
  ref_departments: {
    id: number;
    name: string;
  };
  ref_branches: {
    id: number;
    name: string;
  };
  ref_job_classes: {
    id: number;
    name: string;
    pay_rate: string;
  };
}

export interface UserReviewer {
  first_name: string;
  middle_name: string;
  last_name: string;
  picture: string;
  email: string;
}
