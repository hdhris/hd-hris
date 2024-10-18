import {DepartmentInfo} from "@/types/employeee/DepartmentType";
import {ChipProps} from "@nextui-org/react";
import {ColumnsProps} from "@/types/table/TableDataTypes";
import {FilterProps} from "@/types/table/default_config";
import {getRandomInt} from "@/lib/utils/numberFormat";

const departments: DepartmentInfo[] = [{
    id: 1, department: "Human Resources", department_status: "Inactive", heads: {
        job: "Head of HR",
        fullName: "Jane Smith",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "HR Assistant",
        fullName: "John Doe",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        job: "HR Assistant",
        fullName: "Emily Davis",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 101,
        fullName: "Alice Johnson",
        job_title: "Recruiter",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 102,
        fullName: "Bob Brown",
        job_title: "HR Specialist",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 103,
        fullName: "Charlie Green",
        job_title: "HR Officer",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 5
}, {
    id: 2, department: "Finance", department_status: "Inactive", heads: {
        job: "Chief Financial Officer",
        fullName: "William Turner",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Finance Assistant",
        fullName: "Sandra Lee",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 104,
        fullName: "David Harris",
        job_title: "Accountant",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 105,
        fullName: "Laura White",
        job_title: "Financial Analyst",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 3, department: "IT", department_status: "Active", heads: {
        job: "Chief Technology Officer",
        fullName: "Michael Johnson",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "IT Assistant",
        fullName: "Nancy Brown",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 106,
        fullName: "Peter Parker",
        job_title: "Software Engineer",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 107,
        fullName: "Mary Jane",
        job_title: "Network Administrator",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 4, department: "Marketing", department_status: "Active", heads: {
        job: "Chief Marketing Officer",
        fullName: "Rachel Adams",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Marketing Assistant",
        fullName: "Ethan Hunt",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 108,
        fullName: "Olivia Benson",
        job_title: "Social Media Manager",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 109,
        fullName: "Jack Reacher",
        job_title: "Content Strategist",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 5, department: "Sales", department_status: "Inactive", heads: {
        job: "Head of Sales",
        fullName: "Victor Stone",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Sales Assistant",
        fullName: "Bruce Wayne",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 110,
        fullName: "Clark Kent",
        job_title: "Sales Executive",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 111,
        fullName: "Diana Prince",
        job_title: "Sales Representative",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 6, department: "Customer Service", department_status: "Active", heads: {
        job: "Customer Service Manager",
        fullName: "Tony Stark",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Customer Service Assistant",
        fullName: "Natasha Romanoff",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 112,
        fullName: "Steve Rogers",
        job_title: "Customer Service Representative",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 113,
        fullName: "Bruce Banner",
        job_title: "Technical Support",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 7, department: "Operations", department_status: "Active", heads: {
        job: "Chief Operations Officer",
        fullName: "Selina Kyle",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Operations Assistant",
        fullName: "James Gordon",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 114,
        fullName: "Harvey Dent",
        job_title: "Operations Coordinator",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 115,
        fullName: "Edward Nigma",
        job_title: "Operations Analyst",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 8, department: "Legal", department_status: "Active", heads: {
        job: "Chief Legal Officer",
        fullName: "Matt Murdock",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Legal Assistant",
        fullName: "Karen Page",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 116,
        fullName: "Foggy Nelson",
        job_title: "Corporate Lawyer",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 117,
        fullName: "Jessica Jones",
        job_title: "Paralegal",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 9, department: "Research and Development", department_status: "Active", heads: {
        job: "Head of R&D",
        fullName: "Reed Richards",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "R&D Assistant",
        fullName: "Sue Storm",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 118,
        fullName: "Johnny Storm",
        job_title: "Research Scientist",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 119,
        fullName: "Ben Grimm",
        job_title: "Lab Technician",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 10, department: "Production", department_status: "Active", heads: {
        job: "Production Manager",
        fullName: "James Howlett",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Production Assistant",
        fullName: "Jean Grey",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 120,
        fullName: "Scott Summers",
        job_title: "Production Supervisor",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 121,
        fullName: "Ororo Munroe",
        job_title: "Quality Control Specialist",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 11, department: "Quality Assurance", department_status: "Active", heads: {
        job: "QA Manager",
        fullName: "Wanda Maximoff",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "QA Assistant", fullName: "Vision", picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 122,
        fullName: "Pietro Maximoff",
        job_title: "QA Analyst",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 123,
        fullName: "Monica Rambeau",
        job_title: "QA Engineer",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 12, department: "Human Resources", department_status: "Active", heads: {
        job: "Head of HR",
        fullName: "Jane Smith",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "HR Assistant",
        fullName: "John Doe",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        job: "HR Assistant",
        fullName: "Emily Davis",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 101,
        fullName: "Alice Johnson",
        job_title: "Recruiter",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 102,
        fullName: "Bob Brown",
        job_title: "HR Specialist",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 103,
        fullName: "Charlie Green",
        job_title: null,
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 5
}, {
    id: 13, department: "Finance", department_status: "Active", heads: {
        job: "Chief Financial Officer",
        fullName: "William Turner",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Finance Assistant",
        fullName: "Sandra Lee",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 104,
        fullName: "David Harris",
        job_title: "Accountant",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 105,
        fullName: "Laura White",
        job_title: "Financial Analyst",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 14, department: "IT", department_status: "Active", heads: {
        job: "Chief Technology Officer",
        fullName: "Michael Johnson",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "IT Assistant",
        fullName: "Nancy Brown",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 106,
        fullName: "Peter Parker",
        job_title: "Software Engineer",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 107,
        fullName: "Mary Jane",
        job_title: "Network Administrator",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 15, department: "Marketing", department_status: "Active", heads: {
        job: "Chief Marketing Officer",
        fullName: "Rachel Adams",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Marketing Assistant",
        fullName: "Ethan Hunt",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 108,
        fullName: "Olivia Benson",
        job_title: "Social Media Manager",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 109,
        fullName: "Jack Reacher",
        job_title: "Content Strategist",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 16, department: "Sales", department_status: "Active", heads: {
        job: "Head of Sales",
        fullName: "Victor Stone",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Sales Assistant",
        fullName: "Bruce Wayne",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 110,
        fullName: "Clark Kent",
        job_title: "Sales Executive",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 111,
        fullName: "Diana Prince",
        job_title: "Sales Representative",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 17, department: "Customer Service", department_status: "Active", heads: {
        job: "Customer Service Manager",
        fullName: "Tony Stark",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Customer Service Assistant",
        fullName: "Natasha Romanoff",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 112,
        fullName: "Steve Rogers",
        job_title: "Customer Service Representative",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 113,
        fullName: "Bruce Banner",
        job_title: "Technical Support",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 18, department: "Operations", department_status: "Active", heads: {
        job: "Chief Operations Officer",
        fullName: "Selina Kyle",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Operations Assistant",
        fullName: "James Gordon",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 114,
        fullName: "Harvey Dent",
        job_title: "Operations Coordinator",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 115,
        fullName: "Edward Nigma",
        job_title: "Operations Analyst",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 19, department: "Legal", department_status: "Active", heads: {
        job: "Chief Legal Officer",
        fullName: "Matt Murdock",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "Legal Assistant",
        fullName: "Karen Page",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 116,
        fullName: "Foggy Nelson",
        job_title: "Corporate Lawyer",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 117,
        fullName: "Jessica Jones",
        job_title: "Paralegal",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}, {
    id: 20, department: "Research and Development", department_status: "Active", heads: {
        job: "Head of R&D",
        fullName: "Reed Richards",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, assistants: [{
        job: "R&D Assistant",
        fullName: "Sue Storm",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], associated_employees: [{
        employee_id: 118,
        fullName: "Johnny Storm",
        job_title: "Research Scientist",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }, {
        employee_id: 119,
        fullName: "Ben Grimm",
        job_title: "Lab Technician",
        picture: `https://avatar.iran.liara.run/public/${getRandomInt(1, 100)}`
    }], total_employees: 4
}];


const statusColorMap: Record<string, ChipProps["color"]> = {
    active: "success", paused: "danger", vacation: "warning",
};
const departmentColumns: ColumnsProps[] = [{
    name: "Directors/Heads", uid: "heads",
}, {
    name: "Department", uid: "department", sortable: true
}, {
    name: "Members", uid: "members"
}, {
    name: "Totals", uid: "total_employees", sortable: true
}, {
    name: "Status", uid: "department_status", sortable: true
}]

const departmentFilter: FilterProps[] = [{
    filtered: [{name: "Active", value: "active", key: ""}, {name: "Inactive", value: "inactive", key: ""}], category: "Status"
}]
export {departmentColumns, departmentFilter, departments}


