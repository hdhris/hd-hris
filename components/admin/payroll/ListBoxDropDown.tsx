import {
  Dropdown,
  DropdownTrigger,
  Button,
  Chip,
  DropdownMenu,
  DropdownItem,
  ScrollShadow,
  Listbox,
  ListboxItem,
  ButtonProps,
  Selection,
  DropdownProps,
  ListboxProps,
  ListboxSection,
} from "@nextui-org/react";
import { ChevronRightIcon } from "lucide-react";
import { ReactNode, useState } from "react";

type ListDropDownProps<T extends object> = {
  triggerName: string;
  triggerProps?: ButtonProps;
  dropdownProps?: DropdownProps;
  listboxProps?: ListboxProps<T>;
  items: T[];
  selectedKeys: Selection;
  className?: string;
  onSelectionChange: (keys: Selection) => void;
  topContent?: ReactNode;
  togglable?: Boolean;
  reversable?: Boolean;
  bottomContent?: ReactNode;
  sectionConfig?: {
    name: string;
    key: string;
    id: number;
  }[];
  // onSelect?: (item: T) => void; // Optional callback for when an item is selected
};

export function ListDropDown<T extends { id: string | number; name: string }>({
  triggerName,
  items,
  selectedKeys: getter,
  onSelectionChange: setter,
  topContent,
  togglable,
  reversable,
  className,
  bottomContent,
  dropdownProps,
  listboxProps,
  triggerProps,
  sectionConfig,
}: ListDropDownProps<T>) {
  const [selectedKeys, setSelectedKeys] = [getter, setter];
  const [prevSelecteKeys, setPrevSelecteKeys] = useState<Selection[]>([]);

  function saveLastKeyAndSetNewKeys(keys: Selection) {
    prevSelecteKeys.push(selectedKeys);
    setSelectedKeys(keys);
    console.log(selectedKeys);
  }
  return (
    <Dropdown backdrop="blur" className={className} {...dropdownProps}>
      <DropdownTrigger>
        <Button
          variant="light"
          endContent={
            triggerProps?.endContent || (
              <div className="flex gap-2">
                <Chip size="sm">
                  {items.length === 0
                    ? "No items"
                    : Array.from(selectedKeys).length === items.length
                    ? "All"
                    : `${Array.from(selectedKeys).length} / ${items.length}`}
                </Chip>
                {/* <ChevronRightIcon /> */}
              </div>
            )
          }
          {...triggerProps}
          className={`w-full flex justify-between ${triggerProps?.className && triggerProps.className}`}
        >
          {triggerName}
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem isReadOnly textValue="ListBox">
          {topContent}
          <ScrollShadow className="max-h-[calc(100vh-10rem)] overflow-auto">
            <Listbox
              aria-label="Departments"
              className="col-span-2"
              selectionMode="multiple"
              selectedKeys={selectedKeys}
              onSelectionChange={saveLastKeyAndSetNewKeys}
              {...listboxProps}
            >
              {!(sectionConfig && sectionConfig.length > 0)
                ? items.map((item: T) => (
                    <ListboxItem
                      key={item.id}
                      textValue={item.name}
                      className={`text-small ${
                        Array.from(selectedKeys).includes(String(item.id))
                          ? "text-blue-500"
                          : ""
                      }`}
                    >
                      {item.name}
                    </ListboxItem>
                  ))
                : sectionConfig?.map((section) => {
                    const sectionItems = items.filter(
                      (item: any) => item[section.key] === section.id
                    );

                    return (
                      <ListboxSection
                        key={section.name}
                        title={section.name}
                        showDivider
                      >
                        {sectionItems.length > 0 ? (
                          sectionItems.map((item) => (
                            <ListboxItem
                              key={item.id}
                              textValue={item.name}
                              className={`text-small ${
                                Array.from(selectedKeys).includes(
                                  String(item.id)
                                )
                                  ? "text-blue-500"
                                  : ""
                              }`}
                            >
                              {item.name}
                            </ListboxItem>
                          ))
                        ) : (
                          <ListboxItem
                            className="text-gray-500"
                            isReadOnly
                            key="no_item"
                          >
                            No items.
                          </ListboxItem>
                        )}
                      </ListboxSection>
                    );
                  })}
            </Listbox>
          </ScrollShadow>
          <div className="flex gap-2">
            {togglable && (
              <Button
                className="flex-1"
                variant="light"
                color="danger"
                onClick={() => {
                  if (Array.from(selectedKeys).length > 1) {
                    saveLastKeyAndSetNewKeys(new Set([]));
                  } else {
                    saveLastKeyAndSetNewKeys(
                      new Set(
                        items.map((item: T) => {
                          return String(item.id);
                        })
                      )
                    );
                  }
                }}
              >
                Toggle All
              </Button>
            )}
            {reversable && (
              <Button
                isDisabled={prevSelecteKeys.length === 0}
                className="flex-1"
                color="primary"
                onClick={() => {
                  if (prevSelecteKeys.length > 0) {
                    setSelectedKeys(prevSelecteKeys.pop()!);
                  }
                }}
              >
                Undo
              </Button>
            )}
          </div>
          {bottomContent}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
