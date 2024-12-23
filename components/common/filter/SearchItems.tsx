import { valueOfObject } from "@/helper/objects/pathGetterObject";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { Input } from "@nextui-org/react";
import React, { useCallback, useEffect, useState } from "react";
import { joinNestedKeys, NestedKeys } from "@/helper/objects/joinNestedKeys";
import { toGMT8 } from "@/lib/utils/toGMT8";

export interface SearchItemsProps<T> {
  key: NestedKeys<T>;
  label: string;
}

interface SearchProps<T> {
  items: T[];
  config: SearchItemsProps<T>[];
  setResults: (items: T[]) => void;
  isLoading?: boolean;
  uniqueKey?: string | number;
}

function SearchItems<T>({
  items,
  config,
  setResults,
  isLoading,
  uniqueKey,
}: SearchProps<T>) {
  const [searchValue, setSearchValue] = useState("");

  const refresh = useCallback(
    (value: string) => {
      if (items && config) {
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
      }
    },
    [items, config, setResults]
  );

  useEffect(() => {
    if (items.length > 0) {
      refresh(searchValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, searchValue]); // Dont include refresh


  useEffect(() => {
    setSearchValue("");
  }, [uniqueKey]); // If different module uses the same component on path change

  return (
    <Input
      isDisabled={isLoading}
      placeholder={`Search by ${config.map((item) => item.label).filter((item) => item != "").join(", ")}`}
      value={searchValue}
      onValueChange={setSearchValue}
      className="max-w-64"
      {...uniformStyle({ color: "default", radius: "md",
      })}
      variant="bordered"
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
