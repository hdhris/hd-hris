import React, { useState } from 'react'
import SearchItems from './SearchItems';
import FilterItems, { FilterItemsProps } from './FilterItems';
import { NestedKeys } from '@/helper/objects/joinNestedKeys';

interface SearchFilterProps<T>{
  items: T[];
  filterConfig?: FilterItemsProps<T>[];
  searchConfig?: { key: NestedKeys<T>; label: string }[];
  setResults: (items: T[]) => void;
  isLoading?: boolean;
}
function SearchFilter<T extends object>({
    items,searchConfig,filterConfig,setResults,isLoading
}:SearchFilterProps<T>) {
    const [searchedData, setSearchData] = useState<T[]>([]);
  return (
    <div className='flex gap-2 items-center'>
        {searchConfig && <SearchItems
          isLoading={isLoading}
          items={items}
          config={searchConfig}
          setResults={filterConfig ? setSearchData : setResults}
        />}
        {filterConfig && <FilterItems
          isLoading={isLoading}
          items={searchConfig? searchedData : items}
          config={filterConfig}
          setResults={setResults}
        />}
      </div>
  )
}

export default SearchFilter