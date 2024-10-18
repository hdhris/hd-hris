import React from 'react';
import {Selection} from "@nextui-org/react";

interface RenderListProps<T> {
    items: T[];
    map: (item: T, key: string | number) => React.ReactNode;
    onClick?: (key: Selection) => void;
}

const RenderList = <T extends { key: string | number }, >({items, map, onClick}: RenderListProps<T>) => {
    return (
        <>
            {items.map((item) => {
                const selection: Selection = new Set([item.key.toString()]);
                return (
                    <React.Fragment key={item.key}>
                        <div onClick={() => onClick && onClick(selection)}>
                            {map(item, item.key)}
                        </div>
                    </React.Fragment>
                );
            })}
        </>
    );
};

export default RenderList;
