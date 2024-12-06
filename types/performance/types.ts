// Define the structure for the Rating object
interface Rating {
    rate: number;
    description: string;
}

// Define the structure for TableRating object
interface TableRating {
    name: string;
    weight: number;
    ratings: Rating[];
}

// Define the structure for the Ratings JSON
export interface RatingsJson {
    type: "multiple-choices" | "table";
    ratings: Rating[] | TableRating[];
  }

// Define the main interface for the given data
export interface CriteriaDetail {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    deleted_at: string | null; // Nullable ISO date string
    ratings_json: RatingsJson;
}

const ss: RatingsJson = {
    type: "multiple-choices",
    ratings: [
        {
            rate: 1,
            description: "ssss",
        }
    ]
}