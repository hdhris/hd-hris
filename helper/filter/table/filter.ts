import { parseBoolean } from "@/lib/utils/parser/parseClass";
import { Selection } from "@nextui-org/react";

type FilterConfig<T> = {
    [key: string]: (item: T, value: string) => boolean;
};

export const filterTable = <T>(keys: Selection, data: T[], filterConfig: FilterConfig<T>): T[] => {
    let filteredItems: T[] = [...data];

    if (keys !== "all" && keys.size > 0) {
        Array.from(keys).forEach((key) => {
            const [uid, value] = (key as string).split("_");

            // Apply filter logic based on the uid using the provided filterConfig
            filteredItems = filteredItems.filter((item) => {
                const filterFn = filterConfig[uid];
                if (filterFn) {
                    return filterFn(item, value);
                }
                return true; // If no filter matches, include the item
            });
        });
    }

    return filteredItems;
};
