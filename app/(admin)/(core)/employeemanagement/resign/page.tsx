import React from 'react'

const page = () => {
  return (
    <div>
      resign
    </div>
  )
}

export default page

// "use client"; // Ensure this component is a client component

// import React, { useEffect, useState } from "react";
// import TableData from "@/components/tabledata/TableData";
// import { Employee } from "@/types/employeee/EmployeeType";
// import { TableConfigProps } from "@/types/table/TableDataTypes";
// import { Avatar } from "@nextui-org/react";
// import { TableActionButton } from "@/components/actions/ActionButton";
//
// const Page = () => {
//   const [employees-leaves-status, setEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await fetch("/api/employeemanagement/employees-leaves-status");
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         const data: Employee[] = await response.json();

//         // Filter employees-leaves-status who are retired, resigned, or terminated
//         const resignType = data.filter((employee) =>["retired", "resigned", "terminated"].includes(employee.status)
//         );
//         setEmployees(resignType);
//       } catch (error) {
//         console.error("Failed to fetch employees-leaves-status:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEmployees();
//   }, []);

//   //usethisif the backend has filtering
//   // useEffect(() => {
//   //   const fetchEmployees = async () => {
//   //     try {
//   //       const response = await fetch("/api/employeemanagement/employees-leaves-status?suspended=true");
//   //       if (!response.ok) {
//   //         throw new Error("Network response was not ok");
//   //       }
//   //       const data: Employee[] = await response.json();
//   //       setEmployees(data);
//   //     } catch (error) {
//   //       console.error("Failed to fetch employees-leaves-status:", error);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchEmployees();
//   // }, []);

//   const handleEdit = (id: number) => {
//     // Implement your edit logic here
//     // console.log("Edit employee with id:", id);
//   };

//   const handleDelete = (id: number) => {
//     // Implement your delete logic here
//     // console.log("Delete employee with id:", id);
//   };

//   const config: TableConfigProps<Employee> = {
//     columns: [
//       { uid: "name", name: "Name", sortable: true },
//       { uid: "department", name: "Department", sortable: true },
//       { uid: "position", name: "Position", sortable: true },
//       { uid: "resignationType", name: "Resignation Type", sortable: false },
//       { uid: "resignationDate", name: "Resignation Date", sortable: true },
//       { uid: "resignationReason", name: "Resignation Reason", sortable: false },
//       { uid: "actions", name: "Actions", sortable: false },
//     ],
//     rowCell: (item, columnKey) => {
//       switch (columnKey) {
//         case "name":
//           return (
//             <div className="flex items-center">
//               <Avatar
//                 src={item.picture}
//                 alt={item.name}
//                 className="w-10 h-10 rounded-full mr-2"
//               />
//               <span>{item.name}</span>
//             </div>
//           );
//         case "department":
//           return <span>{item.department}</span>;
//         case "position":
//           return <span>{item.position}</span>;
//         case "resignationType":
//           return <span>{item.status}</span>;
//         case "resignationDate":
//           if ("resignationDate" in item && item.resignationDate) {
//             return (
//               <span>{new Date(item.resignationDate).toLocaleDateString()}</span>
//             );
//           } else if ("retirementDate" in item && item.retirementDate) {
//             return (
//               <span>{new Date(item.retirementDate).toLocaleDateString()}</span>
//             );
//           } else if ("terminationDate" in item && item.terminationDate) {
//             return (
//               <span>{new Date(item.terminationDate).toLocaleDateString()}</span>
//             );
//           } else {
//             return <span>N/A</span>;
//           }
//         case "resignationReason":
//           if ("resignationReason" in item && item.resignationReason) {
//             return <span>{item.resignationReason}</span>;
//           } else if ("terminationReason" in item && item.terminationReason) {
//             return <span>{item.terminationReason}</span>;
//           } else {
//             return <span>N/A</span>;
//           }
//         case "actions":
//           return (
//             <TableActionButton
//               name={item.name}
//               onEdit={() => handleEdit(item.id)}
//               onDelete={() => handleDelete(item.id)}
//             />
//           );
//         default:
//           return <></>;
//       }
//     },
//   };

//   const searchingItemKey: Array<keyof Employee> = [
//     "name",
//     "position",
//     "department",
//     "status",
//   ];

//   return (
//     <div className="mt-2">
//       <TableData
//         aria-label="Employee Table"
//         config={config}
//         items={employees-leaves-status}
//         searchingItemKey={searchingItemKey}
//         counterName="Employees"
//         selectionMode="multiple"
//         isLoading={loading}
//         classNames={{
//           wrapper: "h-[27rem]",
//         }}
//         className="min-h-52"
//       />
//     </div>
//   );
// };

// export default Page;
