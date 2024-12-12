export interface Evaluator {
    evaluated_by: number;
    decision: {
        is_decided: boolean | null;
        rejectedReason: string | null;
        decisionDate: Date | null;
    } | null;
    order_number: number
}

// Define the Evaluators type as a Record
export type Evaluators = Record<string, Evaluator>;

export interface LeaveApplicationEvaluations {
    evaluators: Evaluators
    users: User[]; // List of users involved
    comments: Comment[]; // Comments and replies
    is_automatic_approved: boolean
}

export interface User {
    id: string;
    name: string;
    email?: string;
    picture: string;
    employee_id?: number;
    role: string
}

export interface Comment {
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


