import React from 'react';
import {valueOfObject} from "@/helper/objects/pathGetterObject";
import {NestedKeys} from "@/hooks/types/types"; // Import type if necessary
import { joinNestedKeys } from '@/helper/objects/joinNestedKeys';

function useSearch<T>(items: T[], searchingItemKey?: NestedKeys<T>[]) {


    let itemSearched = [...items];
    // Utility function to get the initial search value from URL
    const getInitialSearchValue = () => {
        const currentSearchParams = new URLSearchParams(window.location.search);
        return currentSearchParams.get('query') || ''; // Replace 'query' with your actual query parameter name
    };

    const [searchValue, setSearchValue] = React.useState(getInitialSearchValue());

    const onSearchChange = (value: string) => {
        setSearchValue(value);

        const newSearchParams = new URLSearchParams(window.location.search);

        if (value.trim() === '') {
            // If the input is empty, delete the query parameter
            newSearchParams.delete('query'); // Replace 'query' with your actual query parameter name
        } else {
            // Update the query parameter with the new value
            newSearchParams.set('query', value);
        }
        window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
    };

    if (searchingItemKey) {
        itemSearched = items.filter(item => searchingItemKey.some(key => {
            const value = valueOfObject(item, joinNestedKeys([key])); // valueOfObject can be a utility to get nested object values
            return value?.toString().toLowerCase().includes(String(searchValue.toLowerCase()));
        }));
    }
    return {searchValue, onSearchChange, itemSearched, searchingItemKey};
}

export default useSearch;
