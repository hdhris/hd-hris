export interface ListItem {
    label: string;
    number: string;
    // Optional field if "amount" is needed in the future
    amount?: string;
}

export interface PayslipData {
    name: string;
    role: string;
}

export interface ViewPayslipType {
    data: PayslipData;
    earnings: {
        total: number;
        list: ListItem[];
    };
    deductions: {
        total: number;
        list: ListItem[];
    };
    net: number;
}

export type systemPayhead = {
    link_id: number;
    amount: number;
    payroll_id: number;
}
