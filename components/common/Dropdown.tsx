import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  ButtonProps,
  SharedSelection,
} from "@nextui-org/react";
import React, { ReactElement, ReactNode } from "react";
import { Key } from "@react-types/shared";

export interface DropdownListItemProp {
  label: ReactNode;
  key: string | number;
  id?: string | number;
  description?: string;
  icon?: ReactNode;
  onClick?: (key: Key) => void;
}
interface DropdownListProps {
  className?: string;
  trigger?: { icon?: ReactNode; label?: ReactNode; props?: ButtonProps };
  onAction?: (key: Key) => void;
  items: DropdownListItemProp[];
  closeOnSelect?: boolean;
  selectionMode?: "single" | "multiple" | "none";
  selectedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: SharedSelection) => void;
}

function DropdownList({
  trigger,
  onAction,
  items,
  className,
  closeOnSelect,
  selectionMode,
  selectedKeys,
  onSelectionChange,
}: DropdownListProps) {
  function handleAction(key: Key) {
    onAction && onAction(key);
  }
  return (
    <Dropdown className={className} closeOnSelect={closeOnSelect}>
      <DropdownTrigger>
        {!trigger ? (
          <Button as={"div"} variant="bordered">
            Open
          </Button>
        ) : (
          <Button
            as={"div"}
            startContent={trigger.icon}
            variant="light"
            isIconOnly={!trigger.label}
            {...trigger.props}
          >
            {trigger.label}
          </Button>
        )}
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Action event"
        onAction={handleAction}
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
        selectionMode={selectionMode}
      >
        {items.map((item) => {
          return (
            <DropdownItem
              key={item.key}
              // shortcut="⌘N"
              description={item.description}
              startContent={item.icon}
              onPress={() => {
                item.onClick && item.onClick(item.id || item.key);
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
