type ApprovedBy = {
    name: string;
    picture: string;
}

export type LeaveRequestTypes = {
    id: number;
    name: string;
    email: string;
    picture: string;
    leave_type: string;
    start_date: string | Date;
    end_date: string | Date;
    total_days: number;
    status: "Pending" | "Approved" | "Rejected";
    approvedBy: ApprovedBy;
}

// export const leaveApprovals: LeaveRequestTypes[] = [
//     {
//         id: 1,
//         name: "John Doe",
//         leave_type: "Vacation",
//         start_date: "2024-09-30",
//         end_date: "2024-10-05",
//         total_days: 6,
//         status: "Pending" // Pending
//     },
//     {
//         id: 2,
//         name: "Jane Smith",
//         leave_type: "Sick Leave",
//         start_date: "2024-09-25",
//         end_date: "2024-09-28",
//         total_days: 4,
//         status: "Approved" // Approved
//     },
//     {
//         id: 3,
//         name: "Michael Johnson",
//         leave_type: "Personal Leave",
//         start_date: "2024-09-15",
//         end_date: "2024-09-18",
//         total_days: 4,
//         status: "Rejected" // Rejected
//     },
//     {
//         id: 4,
//         name: "Emily Davis",
//         leave_type: "Maternity Leave",
//         start_date: "2024-10-01",
//         end_date: "2024-12-01",
//         total_days: 62,
//         status: "Approved" // Approved
//     },
//     {
//         id: 5,
//         name: "Chris Lee",
//         leave_type: "Vacation",
//         start_date: "2024-11-01",
//         end_date: "2024-11-10",
//         total_days: 10,
//         status: "Pending" // Pending
//     }
// ];