import {
    Button,
    Chip,
    ScrollShadow,
    Listbox,
    ListboxItem,
    ButtonProps,
    Selection,
    DropdownProps,
    ListboxProps,
    ListboxSection,
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@nextui-org/react";
import { Key, ReactNode, useState } from "react";

type ListDropDownProps<T extends object> = {
    uniqueKey?: Key;
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
    uniqueKey,
    triggerName,
    items,
    selectedKeys: selectedKeys,
    onSelectionChange: setSelectedKeys,
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
    // const [selectedKeys, setSelectedKeys] = [getter, setter];
    const [prevSelecteKeys, setPrevSelecteKeys] = useState<Selection[]>([]);
    // const prevSelecteKeys: Selection[] = [];

    function saveLastKeyAndSetNewKeys(keys: Selection) {
        prevSelecteKeys.push(selectedKeys);

        const castedKeys = Array.from(keys).map(key =>
            typeof items[0]?.id === 'number' ? Number(key) : String(key)
        );
        // console.log(castedKeys);
        setSelectedKeys(new Set(castedKeys));
    }
    // useEffect(()=>{console.log(selectedKeys)},[selectedKeys])

    return (
        <Popover
            key={uniqueKey || "List"}
            id={String(uniqueKey)}
            placement="right-end"
            backdrop="opaque"
            showArrow
            className={className}
            {...dropdownProps}
        >
            <PopoverTrigger>
                <Button
                    variant="bordered"
                    disableAnimation
                    endContent={
                        triggerProps?.endContent || (
                            <div className="flex gap-2">
                                <Chip size="sm" variant="light">
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
            </PopoverTrigger>
            <PopoverContent>
                {topContent}
                <ScrollShadow className="max-h-[calc(100vh-10rem)] w-full overflow-auto">
                    <Listbox
                        aria-label="Departments"
                        selectionMode="multiple"
                        selectedKeys={new Set(Array.from(selectedKeys).map(String))}
                        onSelectionChange={saveLastKeyAndSetNewKeys}
                        {...listboxProps}
                    >
                        {!(sectionConfig && sectionConfig.length > 0)
                            ? items.map((item: T) => (
                                  <ListboxItem
                                      key={item.id}
                                      textValue={item.name}
                                      className={`text-small ${
                                          Array.from(selectedKeys).includes(item.id) ? "text-blue-500" : ""
                                      }`}
                                  >
                                      {item.name}
                                  </ListboxItem>
                              ))
                            : sectionConfig?.map((section) => {
                                  const sectionItems = items.filter((item: any) => item[section.key] === section.id);

                                  return (
                                      <ListboxSection key={section.name} title={section.name} showDivider>
                                          {sectionItems.length > 0 ? (
                                              sectionItems.map((item) => (
                                                  <ListboxItem
                                                      key={item.id}
                                                      textValue={item.name}
                                                      className={`text-small ${
                                                          Array.from(selectedKeys).includes(item.id)
                                                              ? "text-blue-500"
                                                              : ""
                                                      }`}
                                                  >
                                                      {item.name}
                                                  </ListboxItem>
                                              ))
                                          ) : (
                                              <ListboxItem className="text-gray-500" isReadOnly key="no_item">
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
                            onPress={() => {
                                if (Array.from(selectedKeys).length > 1) {
                                    saveLastKeyAndSetNewKeys(new Set([]));
                                } else {
                                    saveLastKeyAndSetNewKeys(
                                        new Set([...items.map((item: T) => item.id)])
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
                            onPress={() => {
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
            </PopoverContent>
        </Popover>
    );
}
