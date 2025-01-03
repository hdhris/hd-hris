import { toGMT8 } from "../../lib/utils/toGMT8";
import { EmployeeAll, UnavaliableStatusJSON } from "../../types/employeee/EmployeeType";
import { MajorEmployee } from "../include-emp-and-reviewr/include";

const HistoryJSON: UnavaliableStatusJSON[] = [
    {
        id: 1,
        incident_id: 1,
        start_date: "2024-12-20",
        end_date: "2024-01-01",
        reason: "",
        initiated_by: {
            id: 1,
            name: "Juan Dela Cruz",
            position: "Human Resource Manager",
            picture: "https://pbs.twimg.com/profile_images/1808603157691277312/ge-8w695_400x400.jpg",
        },
        evaluation: {},
        canceled_at: null,
        canceled_reason: null,
        canceled_by: null,
    },
];

type addUnavailabilityType = {
    incident_id?: number;
    entry: UnavaliableStatusJSON[];
    start_date: string;
    end_date: string | null;
    reason: string;
    initiated_by: MajorEmployee;
};
export function addUnavailability({ entry, incident_id, start_date, end_date, reason, initiated_by }: addUnavailabilityType) {
    const newId = entry.length > 0 ? Math.max(...entry.map((e) => e.id)) + 1 : 1;
    let newEntry: UnavaliableStatusJSON[] = [
        {
            id: newId,
            incident_id,
            start_date: toGMT8(start_date).toISOString(),
            end_date: end_date ? toGMT8(end_date).toISOString() : null,
            reason: reason,
            initiated_by: {
                id: initiated_by.id,
                name: `${initiated_by.last_name}, ${initiated_by.first_name} ${initiated_by.middle_name}`,
                position: initiated_by.ref_job_classes.name,
                picture: initiated_by.picture,
            },
            evaluation: {},
            canceled_at: null,
            canceled_reason: null,
            canceled_by: null,
        },
        ...entry,
    ];

    return newEntry;
}

type CancelUnavailabilityType = {
    entry: UnavaliableStatusJSON[];
    id: number;
    date: string;
    reason: string;
    canceled_by: MajorEmployee;
};
export function cancelUnavailability({
    entry,
    id,
    date,
    reason,
    canceled_by,
}: CancelUnavailabilityType): UnavaliableStatusJSON[] {
    return entry.map((e) =>
        e.id === id
            ? {
                  ...e,
                  canceled_at: toGMT8(date).toISOString(),
                  canceled_reason: reason,
                  canceled_by: {
                      id: canceled_by.id,
                      name: `${canceled_by.last_name}, ${canceled_by.first_name} ${canceled_by.middle_name}`,
                      position: canceled_by.ref_job_classes.name,
                      picture: canceled_by.picture,
                  },
              }
            : e
    );
}

type GetActiveUnavailabilityType = {
    entry: UnavaliableStatusJSON[];
    currentDate?: string; // Optional: allows overriding the current date for testing
};

export function getActiveUnavailability({
    entry,
}: GetActiveUnavailabilityType): UnavaliableStatusJSON | null {
    const foundEntry = entry?.find((e) => e.canceled_at === null);
    return foundEntry ?? null;
}

export function getExpiredUnavailability({
    entry,
    currentDate,
}: GetActiveUnavailabilityType): UnavaliableStatusJSON | null {
    const today = toGMT8(currentDate);

    const foundEntry = entry?.find((e) => {
        const endDate = e.end_date ? toGMT8(e.end_date) : null;
        return !endDate || endDate.isSameOrBefore(today);
    });

    return foundEntry ?? null;
}

export function isEmployeeAvailable(
    employee: {
        suspension_json: UnavaliableStatusJSON[];
        resignation_json: UnavaliableStatusJSON[];
        termination_json: UnavaliableStatusJSON[];
    },
    find?: "suspension" | "resignation" | "termination"
): boolean {
    const today = toGMT8();

    const isActive = (entry: UnavaliableStatusJSON): boolean => {
        // const startDate = toGMT8(entry.start_date);
        // const endDate = entry.end_date ? toGMT8(entry.end_date) : null;
        // const cancelDate = !!entry.canceled_at ? toGMT8(entry.canceled_at) : null;

        // return cancelDate === null && startDate.isSameOrBefore(today) && (!endDate || endDate.isSameOrAfter(today));
        return entry.canceled_at === null;
    };

    const suspended = employee.suspension_json.some(isActive);
    const resigned = employee.resignation_json.some(isActive);
    const terminated = employee.termination_json.some(isActive);

    if (find) {
        if (find === "suspension") return !suspended;
        if (find === "resignation") return !resigned;
        if (find === "termination") return !terminated;
    }

    return !suspended && !resigned && !terminated;
}

const listAllEmployee = [] as EmployeeAll[];

listAllEmployee.filter((employee) => isEmployeeAvailable(employee)); // Employee Tab
listAllEmployee.filter((employee) => isEmployeeAvailable(employee, "suspension")); // Suspend Tab
listAllEmployee.filter((employee) => isEmployeeAvailable(employee, "resignation")); // Resing Tab
listAllEmployee.filter((employee) => isEmployeeAvailable(employee, "termination")); // Termination Tab
