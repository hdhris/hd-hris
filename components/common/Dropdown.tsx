import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import React, { ReactElement, ReactNode } from "react";
import { Key } from "@react-types/shared";

export interface DropdownListItemProp {
  label: ReactNode;
  key: string | number;
  description?: string;
  icon?: ReactNode;
  onClick?: (key: Key) => void;
}
interface DropdownListProps {
  className?: string;
  trigger?: { icon?: ReactNode; label?: ReactNode; class?: string };
  onAction?: (key: Key) => void;
  items: DropdownListItemProp[];
}
function DropdownList({
  trigger,
  onAction,
  items,
  className,
}: DropdownListProps) {
  function handleAction(key: Key) {
    onAction && onAction(key);
  }
  return (
    <Dropdown className={className}>
      <DropdownTrigger>
        {!trigger ? (
          <Button variant="bordered">Open</Button>
        ) : (
          <Button
            startContent={trigger.icon}
            variant="light"
            className={trigger.class}
            isIconOnly={!trigger.label}
          >
            {trigger.label}
          </Button>
        )}
      </DropdownTrigger>
      <DropdownMenu aria-label="Action event" onAction={handleAction}>
        {items.map((item) => {
          return (
            <DropdownItem
              key={item.key}
              // shortcut="⌘N"
              description={item.description}
              startContent={item.icon}
              onClick={() => {
                item.onClick && item.onClick(item.key);
              }}
            >
              {item.label}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}

export default DropdownList;
