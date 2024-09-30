import BinaryTree from "@/components/binarytree/BinaryTree";
import PrivilegePage from "@/lib/utils/privilege/exampleData";
import PrivilegeCheckboxes from "@/lib/utils/privilege/privilegeTree";
import React from "react";

const treeData = [
  { id: 1, name: "CEO", parent: 0, role: "", max_member: 1 },
  { id: 1.5, name: "COO", parent: 1, role: "", max_member: 1 },
  { id: 2, name: "HR Manageer", parent: 1.5, role: "hr", max_member: 1 },
  { id: 3, name: "Executive", parent: 1.5, role: "", max_member: 1 },
  { id: 4, name: "Manager", parent: 2, role: "", max_member: 1 },
  { id: 5, name: "I.S. Sales", parent: 4, role: "", max_member: 1 },
  { id: 6, name: "I.S. Finance", parent: 4, role: "", max_member: 1 },
  { id: 12, name: "I.S. Finance", parent: 4, role: "", max_member: 1 },
  { id: 7, name: "Regular Sales", parent: 5, role: "", max_member: null },
  { id: 8, name: "Regular Finance", parent: 6, role: "", max_member: null },
  { id: 9, name: "Shrek", parent: 3, role: "", max_member: null },
  { id: 10, name: "Probi Sales", parent: 7, role: "", max_member: null },
  { id: 11, name: "Probi Finance", parent: 8, role: "", max_member: null },
];
export default function page() {
  return (
    <>
      {/* <div>Privileges</div> */}
      {/* <BinaryTree data={treeData} /> */}
      
      <PrivilegePage/>
      {/* <PrivilegeCheckboxes/> */}
    </>
  );
}
