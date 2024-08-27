import { NextResponse } from "next/server";
import { Employee } from "@/types/employeee/EmployeeType";
import { getRandomDateTime } from "@/lib/utils/dateFormatter";

export async function GET() {
    const employees: Employee[] = [
        {
            id: 1,
            rfid: '123456',
            picture: "https://randomuser.me/api/portraits/men/1.jpg",
            name: "John Doe",
            age: 30,
            position: "Software Engineer",
            department: "Engineering",
            email: "john.doe@example.com",
            phone: "123-456-7890",
            gender: "male",
            status: "active",
            suspensionReason: null,
            suspensionDate: null,
            suspensionDuration: null,
            retirementDate: null,
            terminationReason: null,
            terminationDate: null,
            resignationDate: null,
            resignationReason: null,
        },
        {
            id: 2,
            rfid: '654321',
            picture: "https://randomuser.me/api/portraits/women/2.jpg",
            name: "Jane Smith",
            age: 45,
            position: "Project Manager",
            department: "Management",
            email: "jane.smith@example.com",
            phone: "098-765-4321",
            gender: "female",
            status: "retired",
            suspensionReason: null,
            suspensionDate: null,
            suspensionDuration: null,
            retirementDate: getRandomDateTime(new Date("2022-01-01"), new Date("2023-01-01")),
            terminationReason: null,
            terminationDate: null,
            resignationDate: null,
            resignationReason: null,
        },
        // Add more employee data as needed
        
        {
            id: 3,
            rfid: '6543212321',
            picture: "https://randomuser.me/api/portraits/women/2.jpg",
            name: "Justin Beiber",
            age: 45,
            position: "Project Manager",
            department: "Management",
            email: "jane.smith@example.com",
            phone: "098-765-4321",
            gender: "female",
            status: "retired",
            suspensionReason: null,
            suspensionDate: null,
            suspensionDuration: null,
            retirementDate: getRandomDateTime(new Date("2022-01-01"), new Date("2023-01-01")),
            terminationReason: null,
            terminationDate: null,
            resignationDate: null,
            resignationReason: null,
        },
    ];

    return NextResponse.json(employees, { status: 200 });
}
