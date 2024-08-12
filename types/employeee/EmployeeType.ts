type EmployeeAll = {
    id: number,
    rfid: string | number,
    picture: string,
    name: string,
    age: number,
    position: string,
    department: string
    email: string,
    phone: string,
    gender: "male" | "female" | "other",
    status: "active" | "retired" | "resigned" | "terminated" | "suspended",
}


export type EmployeeSuspension = {
    suspensionReason: string | null,
    suspensionDate: Date | string | null,
    suspensionDuration: number | null
}

export type EmployeeRetirement = {
    retirementDate: Date | string | null,
}

export type EmployeeTermination = {

    terminationReason: string | null,
    terminationDate: Date | string | null,
}

export type EmployeeResignation = {

    resignationDate: Date | string | null,
    resignationReason: string | null
}

export type Employee = EmployeeAll & (
    | undefined
    | null
    | EmployeeSuspension
    | EmployeeRetirement
    | EmployeeTermination
    | EmployeeResignation
    );



