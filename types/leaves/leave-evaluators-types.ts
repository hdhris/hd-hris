export interface User {
    id: number;
    name: string;
    role: string;
    email: string;
    picture?: string; // Optional as some users may not have a picture
    employee_id?: number; // Optional to account for missing data
    position: string
    department: string
}

interface Decision {
    is_decided: boolean | null;
    decisionDate: Date | null;
    rejectedReason: string | null;
}

export interface Evaluator {
    role: string;
    decision: Decision;
    evaluated_by: number; // Reference to a user (employee_id)
    order_number: number;
}

export interface Evaluations {
    users: User[];
    comments: Comment[]; // Assuming comments is a string array, can be updated if further details are provided
    evaluators: Evaluator[];
    is_automatic_approved: boolean;
}

export interface Comment {
    applicant_email: string
    leave_id: number
    id: string;
    author: string; // Reference to a User ID
    timestamp: string;
    message: string;
    replies: Reply[];
}

export interface Reply {
    id: string;
    author: string; // Reference to a User ID
    timestamp: string;
    message: string;
}