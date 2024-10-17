export interface HolidayEvent {
    id: string | number;
    name: string;
    // description: string;
    start_date: string;
    end_date: string;
    type: "Public Holiday" | "Private Holiday" | "Observance";
    created_at?: string | Date;
  }

  export interface HolidayData {
    combinedHolidays: HolidayEvent[],
    distinctYears: number[];
  }