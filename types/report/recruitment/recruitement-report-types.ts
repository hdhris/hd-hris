interface EmployeeRecruitement {
    id: number;
    name: string;
    email: string;
    phone: string;
    working_status: string;
    department: string | null; // Use the `Department` interface
    job: string | null; // Use the `JobClass` interface
    hired_date: string | null;
}