import {
    Employee
} from "@/types/employeee/EmployeeType";
import {getRandomInt} from "@/lib/utils/numberFormat";
import {FilterProps} from "@/types/table/default_config";
import {ColumnsProps} from "@/types/table/TableDataTypes";

export const employeesColumn: ColumnsProps[] = [
    // {name: "ID", uid: "id", sortable: true},
    {
    name: "NAME",
    uid: "name",
    sortable: true
}, {name: "AGE", uid: "age", sortable: true}, {
    name: "ROLE",
    uid: "position",
    sortable: true
}, {
    name: "CONTACTS", uid: "contacts"}, {name: "EMPLOYMENT STATUS", uid: "status", sortable: true}]

export const employees: Employee[] = [{
    id: 1,
    rfid: getRandomInt(100000, 999999),
    picture: `https://avatar.iran.liara.run/public/1`,
    name: "John Doe",
    gender: "male",
    age: 34,
    position: "Manager",
    department: "HR",
    email: "john.doe@example.com",
    phone: "555-1234",
    status: "active",
    resignationDate: null,
    resignationReason: null
}, {
    id: 2,
    rfid: getRandomInt(100000, 999999),
    picture: `https://avatar.iran.liara.run/public/2`,
    name: "Jane Smith",
    gender: "female",
    age: 28,
    position: "Developer",
    department: "IT",
    email: "jane.smith@example.com",
    phone: "555-5678",
    status: "active",
    resignationDate: null,
    resignationReason: null
},
// Add entries for resignation, retirement, suspension, and termination here
    {
        id: 3,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/3`,
        name: "Alice Johnson",
        gender: "female",
        age: 45,
        position: "HR Specialist",
        department: "HR",
        email: "alice.johnson@example.com",
        phone: "555-8765",
        status: "resigned",
        resignationDate: new Date("2023-05-10").toLocaleDateString(),
        resignationReason: "Found a new opportunity"
    },
    {
        id: 4,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/4`,
        name: "Bob Brown",
        gender: "male",
        age: 50,
        position: "CTO",
        department: "IT",
        email: "bob.brown@example.com",
        phone: "555-4321",
        status: "retired",
        retirementDate: new Date("2023-02-28").toLocaleDateString()
    },
    {
        id: 5,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/5`,
        name: "Charlie Davis",
        gender: "male",
        age: 39,
        position: "Project Manager",
        department: "HR",
        email: "charlie.davis@example.com",
        phone: "555-5678",
        status: "suspended",
        suspensionReason: "Pending investigation",
        suspensionDate: new Date("2023-04-15").toLocaleDateString(),
        suspensionDuration: 30 // in days
    },
    {
        id: 6,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/6`,
        name: "Diana Evans",
        gender: "female",
        age: 32,
        position: "QA Engineer",
        department: "IT",
        email: "diana.evans@example.com",
        phone: "555-6789",
        status: "terminated",
        terminationReason: "Breach of company policy",
        terminationDate: new Date("2023-03-20").toLocaleDateString()
    },
    {
        id: 7,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/7`,
        name: "Eve Wilson",
        gender: "female",
        age: 29,
        position: "Designer",
        department: "Marketing",
        email: "eve.wilson@example.com",
        phone: "555-7890",
        status: "active",
        resignationDate: null,
        resignationReason: null
    },
    {
        id: 8,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/8`,
        name: "Frank Green",
        gender: "male",
        age: 41,
        position: "Marketing Specialist",
        department: "Marketing",
        email: "frank.green@example.com",
        phone: "555-8901",
        status: "terminated",
        terminationReason: "Poor performance",
        terminationDate: new Date("2023-06-15").toLocaleDateString()
    },
    {
        id: 9,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/9`,
        name: "Grace Hall",
        gender: "female",
        age: 27,
        position: "Data Analyst",
        department: "IT",
        email: "grace.hall@example.com",
        phone: "555-9012",
        status: "active",
        resignationDate: null,
        resignationReason: null
    },
    {
        id: 10,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/10`,
        name: "Henry Adams",
        gender: "male",
        age: 36,
        position: "DevOps Engineer",
        department: "IT",
        email: "henry.adams@example.com",
        phone: "555-1235",
        status: "suspended",
        suspensionReason: "Pending investigation",
        suspensionDate: new Date("2023-04-20").toLocaleDateString(),
        suspensionDuration: 15 // in days
    },
    {
        id: 11,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/11`,
        name: "Ivy Lewis",
        gender: "female",
        age: 33,
        position: "Product Manager",
        department: "Marketing",
        email: "ivy.lewis@example.com",
        phone: "555-2345",
        status: "active",
        resignationDate: null,
        resignationReason: null
    },
    {
        id: 12,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/12`,
        name: "Jack White",
        gender: "male",
        age: 44,
        position: "CFO",
        department: "Finance",
        email: "jack.white@example.com",
        phone: "555-3456",
        status: "active",
        resignationDate: null,
        resignationReason: null
    },
    {
        id: 13,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/13`,
        name: "Kathy Martin",
        gender: "female",
        age: 40,
        position: "Support Engineer",
        department: "IT",
        email: "kathy.martin@example.com",
        phone: "555-4567",
        status: "active",
        resignationDate: null,
        resignationReason: null
    },
    {
        id: 14,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/14`,
        name: "Larry Clark",
        gender: "male",
        age: 48,
        position: "Sales Manager",
        department: "Marketing",
        email: "larry.clark@example.com",
        phone: "555-5678",
        status: "active",
        resignationDate: null,
        resignationReason: null
    },
    {
        id: 15,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/15`,
        name: "Mona Scott",
        gender: "female",
        age: 26,
        position: "Intern",
        department: "HR",
        email: "mona.scott@example.com",
        phone: "555-6789",
        status: "active",
        resignationDate: null,
        resignationReason: null
    },
    {
        id: 16,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/16`,
        name: "Nina King",
        gender: "female",
        age: 38,
        position: "Legal Advisor",
        department: "Legal",
        email: "nina.king@example.com",
        phone: "555-7890",
        status: "active",
        resignationDate: null,
        resignationReason: null
    },
    {
        id: 17,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/17`,
        name: "Oscar Price",
        gender: "male",
        age: 42,
        position: "Security Specialist",
        department: "Security",
        email: "oscar.price@example.com",
        phone: "555-8901",
        status: "active",
        resignationDate: null,
        resignationReason: null
    },
    {
        id: 18,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/18`,
        name: "Paula Hughes",
        gender: "female",
        age: 31,
        position: "HR Manager",
        department: "HR",
        email: "paula.hughes@example.com",
        phone: "555-9012",
        status: "resigned",
        resignationDate: new Date("2023-07-05").toLocaleDateString(),
        resignationReason: "Personal reasons"
    },
    {
        id: 19,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/19`,
        name: "Quincy Foster",
        gender: "male",
        age: 47,
        position: "Operations Manager",
        department: "Operations",
        email: "quincy.foster@example.com",
        phone: "555-1236",
        status: "active",
        resignationDate: null,
        resignationReason: null
    },
    {
        id: 20,
        rfid: getRandomInt(100000, 999999),
        picture: `https://avatar.iran.liara.run/public/20`,
        name: "Rachel Morgan",
        gender: "female",
        age: 35,
        position: "Business Analyst",
        department: "Finance",
        email: "rachel.morgan@example.com",
        phone: "555-2346",
        status: "active",
        resignationDate: null,
        resignationReason: null
    }
];

export const filterEmployee: FilterProps[] = [{
    filtered: [{
        name: "Active", uid: "active"
    }, {
        name: "Resigned", uid: "resigned"
    }, {
        name: "Suspended", uid: "suspended"
    }, {
        name: "Terminated", uid: "terminated"
    },
    ], category: "Status"
},{
    filtered: [
        {name: "Male", uid: "male"},
        {name: "Female", uid: "female"},
        {name: "Others", uid: "other"},
    ],
    category: "Gender"
},
    {
    filtered: [
        {name: "21-30", uid: "early"},
        {name: "31-40", uid: "junior"},
        {name: "41-50", uid: "senior"},
        {name: "> 50", uid: "greater"},
    ],
    category: "Age"
}
]