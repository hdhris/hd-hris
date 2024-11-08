import { Select, SelectItem, SharedSelection } from "@nextui-org/react";
import React, {
  useState,
  useEffect,
  Key,
  useCallback,
  useMemo,
  ReactElement,
} from "react";
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
  selectionMode?: "single" | "multipleOR" | "multipleAND";
}

interface FilterProps<T> {
  items: T[];
  config: FilterItemsProps<T>[];
  setResults: (items: T[]) => void;
  isLoading?: boolean;
  uniqueKey?: string | number;
}

function FilterItems<T>({
  items,
  config,
  setResults,
  isLoading,
  uniqueKey,
}: FilterProps<T>) {
  const [selectedSection, setSelectedSection] = useState<
    Record<number, SharedSelection>
  >({});
  const refresh = useCallback(
    (filter: typeof selectedSection) => {
      if (items && config) {
        let results = [...items];
        Object.entries(filter).forEach((selecteds) => {
          Array.from(selecteds).forEach((selected) => {
            const selectedSection = Array.from(selected);
            if (selectedSection.length > 0) {
              const [key, values] = selectedSection.reduce<
                [number | null, number[]]
              >(
                (acc, item) => {
                  const [k, v] = String(item).split(":").map(Number);
                  if (!isNaN(k) && !isNaN(v)) {
                    if (acc[0] === null) acc[0] = k; // Set the key only once
                    acc[1].push(v); // Push the valid value part
                  }

                  return acc;
                },
                [null, []] // Start with null for the key and an empty array for values
              );

              if (key !== null && values.length > 0) {
                const category = config[Number(key)];
                if (category) {
                  const validFilters = category.filter.filter((ft, index) =>
                    values.includes(index)
                  );
                  if (category.selectionMode === "multipleOR") {
                    // Short-circuit evaluation if any filter passes
                    results = results.filter((item) => {
                      return validFilters.some((ft) => {
                        if (typeof ft.value === "function") {
                          return ft.value(item);
                        } else {
                          return (
                            valueOfObject(
                              item,
                              joinNestedKeys([category.key])
                            ) === ft.value
                          );
                        }
                      });
                    });
                  } else {
                    // multipleAND || single
                    validFilters.forEach((vf) => {
                      results = results.filter((item) => {
                        if (typeof vf.value === "function") {
                          return vf.value(item);
                        } else {
                          return (
                            valueOfObject(
                              item,
                              joinNestedKeys([category.key])
                            ) === vf.value
                          );
                        }
                      });
                    });
                  }
                }
              }
            }
          });
        });
        setResults(results);
      }
    },
    [items, config, setResults]
  );
  useEffect(() => {
    if (items && selectedSection) {
      refresh(selectedSection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selectedSection]); // DO NOT ADD REFRESH

  useEffect(() => {
    setSelectedSection({});
  }, [uniqueKey]); // If different module uses the same component on path change
  
  const handleSelectChange = (sectionIndex: number, key: SharedSelection) => {
    // console.log(Array.from(key));
    setSelectedSection((prevKeys) => ({
      ...prevKeys,
      [sectionIndex]: key,
    }));
  };

  const getSectionName = (
    sectionName: string,
    sectionIndex: number
  ): ReactElement => {
    if (selectedSection && selectedSection[sectionIndex]) {
      const items = Array.from(selectedSection[sectionIndex]);
      if (items.length > 0) {
        const [key, values] = items.reduce<[number | null, number[]]>(
          (acc, item) => {
            const [k, v] = String(item).split(":").map(Number);
            if (acc[0] === null) acc[0] = k; // Set the key only once
            acc[1].push(v); // Push the value part
            return acc;
          },
          [null, []] // Initial value: null for the key and empty array for values
        );
        const category = config[key!];
        if (category) {
          const filter = category.filter.filter((ft, index) => {
            return values.includes(index);
          });
          return (
            <p className="text-gray-500 text-sm">
              {sectionName}
              {": "}
              <span className="font-semibold text-blue-500">
                {filter
                  .map((ft) => ft.label)
                  .join(
                    category.selectionMode === "multipleOR" ? " | " : " & "
                  )}
              </span>
            </p>
          );
        }
      }
    }
    return (
      <p className="text-gray-500 text-sm">
        Filter{" "}
        <span className="font-semibold text-gray-700">{sectionName}</span>
      </p>
    );
  };

  return (
    <div className="flex gap-2 items-center">
      {config.map((section, sectionIndex) => (
        <DropdownList
          key={sectionIndex}
          closeOnSelect={false}
          selectionMode={
            section.selectionMode?.includes("multiple") ? "multiple" : "single"
          }
          selectedKeys={selectedSection[sectionIndex] || []}
          onSelectionChange={(keys) => handleSelectChange(sectionIndex, keys)}
          items={section.filter.map((item, filterIndex) => {
            return {
              key: `${sectionIndex}:${filterIndex}`,
              label: item.label,
            };
          })}
          trigger={{
            label: getSectionName(section.sectionName, sectionIndex),
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
