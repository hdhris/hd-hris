export interface HolidayEvent {
    id: string | number;
    name: string;
    // description: string;
    start_date: string | Date;
    end_date: string | Date;
    type: "Public Holiday" | "Private Holiday" | "Observance";
    created_at?: string | Date;
  }