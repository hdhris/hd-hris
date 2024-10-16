import { valueOfObject } from "@/helper/objects/pathGetterObject";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { Input } from "@nextui-org/react";
import React, { useCallback, useEffect, useState } from "react";
import { NestedKeys } from "../tabledata/TableData";
import { joinNestedKeys } from "@/helper/objects/joinNestedKeys";

interface SearchItemsProps<T> {
  items: T[];
  config: { key: NestedKeys<T>; label: string }[];
  setResults: (items: T[]) => void;
}

function SearchItems<T extends object>({
  items,
  config,
  setResults,
}: SearchItemsProps<T>) {
  const [searchValue, setSearchValue] = useState("");

  const refresh = useCallback((value:string) => {
    setSearchValue(value);
    const searched = items.filter((item) =>
      config.some((conf) =>
        String(valueOfObject(item, joinNestedKeys([conf.key])))
          .toLowerCase()
          .includes(value.toLowerCase())
      )
    );
    setResults(searched);
  }, [items,config]);

  useEffect(()=>{
    if(items.length>0){
        refresh("");
    }
  },[items])

  return (
    <Input
      placeholder={`Search by ${config.map((item) => item.label).join(", ")}`}
      variant="bordered"
      value={searchValue}
      onValueChange={refresh}
      className="max-w-64"
      {...uniformStyle({ color: "default", radius: "md" })}
    />
  );
}

export default SearchItems;
