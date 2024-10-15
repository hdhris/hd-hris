import { valueOfObject } from "@/helper/objects/pathGetterObject";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { Input } from "@nextui-org/react";
import React, { useCallback, useEffect, useState } from "react";

interface SearchItemsProps<T extends object> {
  items: T[];
  config: { key: string; label: string }[];
  searchedItems: (items: T[]) => void;
}

function SearchItems<T extends object>({
  items,
  config,
  searchedItems,
}: SearchItemsProps<T>) {
  const [searchValue, setSearchValue] = useState("");

  const refresh = useCallback((value:string) => {
    setSearchValue(value);
    const searched = items.filter((item) =>
      config.some((conf) =>
        valueOfObject(item, conf.key)
          .toLowerCase()
          .includes(value.toLowerCase())
      )
    );
    searchedItems(searched);
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
