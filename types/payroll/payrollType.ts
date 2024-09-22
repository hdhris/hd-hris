export interface Payhead {
    calculation: Record<string, any> | null; // JSON column, allowing any structure
    created_at: string; // ISO 8601 formatted date string
    updated_at: string; // ISO 8601 formatted date string
    deleted_at: string | null; // Nullable ISO 8601 formatted date string
    id: number;
    is_active: boolean;
    is_mandatory: boolean;
    name: string;
    type: 'earning' | 'deduction'; // Restricts to "earning" or "deduction"
  }
  