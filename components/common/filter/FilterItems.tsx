import { Select, SelectItem, SharedSelection } from "@nextui-org/react";
import React, { useState, useEffect, Key, useCallback, useMemo } from "react";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { joinNestedKeys, NestedKeys } from "@/helper/objects/joinNestedKeys";
import { valueOfObject } from "@/helper/objects/pathGetterObject";
import DropdownList from "../Dropdown";
import { IoChevronDown } from "react-icons/io5";

export interface FilterItemsProps<T> {
  filter: {
    label: string;
    value: any | ((item: T) => boolean);
  }[];
  key: NestedKeys<T>;
  sectionName: string;
}

interface FilterProps<T> {
  items: T[];
  config: FilterItemsProps<T>[];
  setResults: (items: T[]) => void;
  isLoading?: boolean;
}

function FilterItems<T>({ items, config, setResults, isLoading }: FilterProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<
    Record<string, SharedSelection>
  >({});
  const refresh = useCallback(
    (filter: typeof selectedKeys) => {
      let results = [...items];
      Object.entries(filter).forEach((keys) => {
        Array.from(keys).forEach((section) => {
          const [key, value] = String(Array.from(section)[0]).split(":");
          const category = config.find((c) => joinNestedKeys([c.key]) === key);
          if (category) {
            const filter = category.filter.find(
              (ft) => String(ft.value) === String(value)
            );
            results = results.filter((item) => {
              if (typeof filter?.value === "function") {
                return filter?.value(item);
              } else {
                // console.log("Object val: ", valueOfObject(item, key));
                // console.log("Filter val: ", filter?.value);
                return valueOfObject(item, key) === filter?.value;
              }
            });
          }
        });
      });
      setResults(results);
    },
    [items, config]
  );
  useEffect(() => {
    if (items.length > 0) {
      refresh(selectedKeys);
    }
  }, [items, selectedKeys]);
  const handleSelectChange = (sectionName: string, key: SharedSelection) => {
    // console.log(Array.from(key));
    setSelectedKeys((prevKeys) => ({
      ...prevKeys,
      [sectionName]: key,
    }));
  };
  const getSectionName = useMemo(() => {
    return (sectionName: string) => {
      if (selectedKeys && selectedKeys[sectionName]) {
        const items = Array.from(selectedKeys[sectionName]);
        if (items.length > 0) {
          const [key, value] = String(items[0]).split(":");
          const category = config.find((c) => joinNestedKeys([c.key]) === key);
          if (category) {
            const filter = category.filter.find(
              (ft) => String(ft.value) === String(value)
            );
            return (
              <p className="text-gray-500 text-sm">
                {sectionName}
                {": "}
                <span className="font-semibold text-blue-500">
                  {filter?.label}
                </span>
              </p>
            );
          }
        }
        // console.log(items);
      }
      return (
        <p className="text-gray-500 text-sm">
          Filter{" "}
          <span className="font-semibold text-gray-700">{sectionName}</span>
        </p>
      );
    };
  }, [selectedKeys]);

  return (
    <div className="flex gap-2 items-center">
      {config.map((section) => (
        <DropdownList
          closeOnSelect={false}
          selectionMode="single"
          selectedKeys={selectedKeys[section.sectionName] || []}
          onSelectionChange={(keys) =>
            handleSelectChange(section.sectionName, keys)
          }
          items={section.filter.map((item, index) => {
            return {
              key: `${joinNestedKeys([section.key])}:${item.value}`,
              label: item.label,
            };
          })}
          trigger={{
            label: getSectionName(section.sectionName),
            props: {
              ...uniformStyle({ color: "default", radius: "md" }),
              variant: "bordered",
              endContent: <IoChevronDown />,
              className: "text-medium",
              isLoading: isLoading,
            },
          }}
        />
      ))}
    </div>
  );
}

export default FilterItems;
