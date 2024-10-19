import React from 'react';

interface RenderListProps<T> {
    items: T[];
    map: (item: T, key: string | number) => React.ReactNode;
}

const RenderList = <T extends { key: string | number }, >({items, map}: RenderListProps<T>) => {
    return (<>
            {items.map((item) => (<React.Fragment key={item.key}>
                   {map(item, item.key)}
                </React.Fragment>))}
        </>);
};

export default RenderList;