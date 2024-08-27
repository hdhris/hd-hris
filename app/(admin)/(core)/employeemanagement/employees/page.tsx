'use client'; // Ensure this component is a client component

import React, { useEffect, useState } from 'react';
import TableData from '@/components/tabledata/TableData';
import { Employee } from "@/types/employeee/EmployeeType";
import { TableConfigProps } from '@/types/table/TableDataTypes';
import Image from 'next/image'

const Page = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch('/api/employeemanagement/employees'); // Updated URL
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: Employee[] = await response.json();
                setEmployees(data);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
            } finally {
                setLoading(false);
            }
        };


        fetchEmployees();
    }, []);

    const config: TableConfigProps<Employee> = {
        columns: [
            { uid: 'picture', name: 'Picture', sortable: false }, // New column for the picture
            { uid: 'name', name: 'Name', sortable: true },
            { uid: 'position', name: 'Position', sortable: true },
            { uid: 'department', name: 'Department', sortable: true },
            { uid: 'status', name: 'Status', sortable: true },
            // Add more columns as needed
        ],
        rowCell: (item, columnKey) => {
            switch (columnKey) {
                case 'picture':
                    return <img src={item.picture} alt={item.name} className="w-10 h-10 rounded-full" />; // Image with some basic styling
                case 'name':
                    return <span>{item.name}</span>;
                case 'position':
                    return <span>{item.position}</span>;
                case 'department':
                    return <span>{item.department}</span>;
                case 'status':
                    return <span>{item.status}</span>;
                // Handle other cases based on your columns
                default:
                    return <>
                    
                    </>; // Return an empty fragment instead of null
            }
        },
    };

    const searchingItemKey: Array<keyof Employee> = ['name', 'position', 'department', 'status'];

    return (
        <div>
            <TableData
            aria-label='Employee Table'
                config={config}
                items={employees}
                searchingItemKey={searchingItemKey}
                counterName="Employees"
                selectionMode="multiple"
                isLoading={loading}
                classNames={{
                  wrapper: 'h-[30rem]'
                }}
                className='min-h-52'/>
        </div>
    );
};

// Export the component as `page`
export default Page;
