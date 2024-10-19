export interface HolidayEvent {
    id: string | number;
    name: string;
    // description: string;
    start_date: string;
    end_date: string;
    type: "Public Holiday" | "Private Holiday" | "Observance";
    created_at?: string | Date;
  }

  export interface TransHoliday {
    id: number;
    no_work: boolean;
    pay_rate_percentage: string;
    created_at: string; 
    updated_at: string; 
    deleted_at?: string;
    date: string;
    name: string;
  }

  export interface HolidayData {
    combinedHolidays: HolidayEvent[],
    distinctYears: number[];
    transHolidays: TransHoliday[],
  }