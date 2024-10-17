import { valueOfObject } from "@/helper/objects/pathGetterObject";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { Input } from "@nextui-org/react";
import React, { useCallback, useEffect, useState } from "react";
import { joinNestedKeys, NestedKeys } from "@/helper/objects/joinNestedKeys";
import { toGMT8 } from "@/lib/utils/toGMT8";

export interface SearchItemsProps<T> {
  key: NestedKeys<T>;
  label: string;
};

interface SearchProps<T> {
  items: T[];
  config: SearchItemsProps<T>[];
  setResults: (items: T[]) => void;
  isLoading?: boolean;
}

function SearchItems<T extends object>({
  items,
  config,
  setResults,
  isLoading,
}: SearchProps<T>) {
  const [searchValue, setSearchValue] = useState("");

  const refresh = useCallback(
    (value: string) => {
      const queries = value.toLowerCase().split(" ");
      let result: T[] = [...items];
      queries.forEach((query) => {
        result = result.filter((item) =>
          config.some((conf) =>
            humanizeQuery(valueOfObject(item, joinNestedKeys([conf.key])))
              .toLowerCase()
              .includes(query)
          )
        );
      });
      setResults(result);
    },
    [items, config]
  );

  useEffect(() => {
    if (items.length > 0) {
      refresh(searchValue);
    }
  }, [items, searchValue]);

  return (
    <Input
      isDisabled={isLoading}
      placeholder={`Search by ${config.map((item) => item.label).join(", ")}`}
      variant="bordered"
      value={searchValue}
      onValueChange={setSearchValue}
      className="max-w-64"
      {...uniformStyle({ color: "default", radius: "md" })}
    />
  );
}

export default SearchItems;

function humanizeQuery(value: any): string {
  if (typeof value === "string") {
    if (toGMT8(value).isValid()) {
      return toGMT8(value).format("MMMM D, YYYY h:mm a");
    }
  }
  // else {
  //   Add more logic
  // }

  return String(value);
}
