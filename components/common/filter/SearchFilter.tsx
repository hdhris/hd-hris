import React, { useState } from 'react'
import SearchItems, { SearchItemsProps } from './SearchItems';
import FilterItems, { FilterItemsProps } from './FilterItems';
import { NestedKeys } from '@/helper/objects/joinNestedKeys';
import { cn } from '@nextui-org/react';

interface SearchFilterProps<T>{
  items: T[];
  filterConfig?: FilterItemsProps<T>[];
  searchConfig?: SearchItemsProps<T>[];
  setResults: (items: T[]) => void;
  isLoading?: boolean;
  className?: string;
  uniqueKey?: string | number;
}
function SearchFilter<T extends object>({
    items,searchConfig,filterConfig,setResults,isLoading,className:classes,uniqueKey
}:SearchFilterProps<T>) {
    const [searchedData, setSearchData] = useState<T[]>([]);
  return (
    <div className={cn('flex gap-2 items-center',classes)}>
        {searchConfig && <SearchItems
          uniqueKey={uniqueKey}
          isLoading={isLoading}
          items={items}
          config={searchConfig}
          setResults={filterConfig ? setSearchData : setResults}
        />}
        {filterConfig && <FilterItems
          uniqueKey={uniqueKey}
          isLoading={isLoading}
          items={searchConfig? searchedData : items}
          config={filterConfig}
          setResults={setResults}
        />}
      </div>
  )
}

export default SearchFilter