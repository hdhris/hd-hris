import React from "react";
import "./BinaryTree.css";

interface TreeNode {
  id: number;
  name: string;
  parent: number;
}

interface BinaryTreeProps {
  data: TreeNode[];
}

const BinaryTree: React.FC<BinaryTreeProps> = ({ data }) => {
  // Recursive function to render the tree structure
  const renderTree = (parentId: number): JSX.Element | null => {
    const children = data.filter((node) => node.parent === parentId);
    if (children.length === 0) return null;

    return (
      <ul>
        {children.map((child) => (
          <li key={child.id}>
            <a href="#">
              <span>{child.name}</span>
            </a>
            {renderTree(child.id)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="tree">
      {renderTree(0)} {/* Start rendering from the root node (parent: 0) */}
    </div>
  );
};

export default BinaryTree;
