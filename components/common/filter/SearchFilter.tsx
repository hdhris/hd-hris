import React, { useState } from 'react'
import SearchItems from './SearchItems';
import FilterItems, { FilterItemsProps } from './FilterItems';
import { NestedKeys } from '@/helper/objects/joinNestedKeys';

interface SearchFilterProps<T>{
  items: T[];
  filterConfig?: FilterItemsProps<T>[];
  searchConfig?: { key: NestedKeys<T>; label: string }[];
  setResults: (items: T[]) => void;
}
function SearchFilter<T extends object>({
    items,searchConfig,filterConfig,setResults
}:SearchFilterProps<T>) {
    const [searchedData, setSearchData] = useState<T[]>([]);
  return (
    <div className='flex gap-2 items-center'>
        {searchConfig && <SearchItems
          items={items}
          config={searchConfig}
          setResults={filterConfig ? setSearchData : setResults}
        />}
        {filterConfig && <FilterItems
          items={searchConfig ? searchedData : items}
          config={filterConfig}
          setResults={setResults}
        />}
      </div>
  )
}

export default SearchFilter