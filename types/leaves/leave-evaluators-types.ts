export type EvaluatorsTypes = {
    approver: {
        approved_by: {
            id: string; // Unique ID for the approval
            employee_id: number; // ID of the employee who is the approver
            name: string;
            picture: string;
            email: string | null
        }
        decision: {
            is_approved: boolean | null; // Indicates whether the request is approved (null if undecided)
            rejectedReason: string | null; // Reason for rejection (null if not rejected)
            decisionDate: Date | null; // Date the decision was made (null if not decided yet)
        };
        comments: string; // Comments from the approver (e.g., "Awaiting final approval")
    };
    reviewers?: { // A single reviewer object, not an array
        reviewed_by: {
            id: string; // Unique ID for the reviewer
            employee_id: number; // ID of the employee who is the approver
            name: string;
            picture: string;
            email: string | null
        }
        decision: {
            is_reviewed: boolean | null; // Indicates whether the request has been reviewed (null if not reviewed)
            rejectedReason: string | null; // Reason for rejection (null if not rejected)
            decisionDate: Date | null; // Date the review decision was made (null if not reviewed yet)
        };
        comments: string; // Comments from the reviewer (e.g., "Leave request complies with company policy")
    };
};


interface Decision {
    is_approved?: boolean | null;
    is_reviewed?: boolean | null;
    decisionDate: string | null;
    rejectedReason: string | null;
}

interface User {
    id: string;
    name: string;
    email?: string;
    picture: string;
    employee_id?: number;
    role: "approver" | "reviewer" | "applicant";
}

interface Comment {
    id: string;
    author: string; // Reference to a User ID
    timestamp: string;
    message: string;
    replies: Reply[];
}

interface Reply {
    id: string;
    author: string; // Reference to a User ID
    timestamp: string;
    message: string;
}

export interface LeaveApplicationEvaluation {
    approver: {
        decision: Decision;
        approved_by: string; // Reference to a User ID
    };
    reviewers: {
        decision: Decision;
        reviewed_by: string; // Reference to a User ID
    };
    users: User[];
    comments: Comment[];
}
