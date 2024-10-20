// types/BranchType.ts

export interface Branch {
    id: number;
    name: string | null;
    addr_region: number | null;
    addr_province: number | null;
    addr_municipal: number | null;
    addr_baranggay: number | null;
    is_active: boolean | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }
  //