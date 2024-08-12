import React from 'react';
import Add from "@/components/common/button/Add";



function AddEmployee() {
    return (<Add variant="flat" name="Add Employee"
                    href="/admin/employees/add/personal-information"/>);
}

export default AddEmployee;