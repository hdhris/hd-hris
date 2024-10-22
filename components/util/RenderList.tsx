import React, {Key} from 'react';

interface RenderListProps<T> {
    items: T[];
    map: (item: T, key: string | number) => React.ReactNode;
    onClick?: (key: Key) => void;
}

const RenderList = <T extends { key: string | number }, >({items, map, onClick}: RenderListProps<T>) => {
    return (<>
            {items.map((item) => {
                return (<React.Fragment key={item.key}>
                        <span onClick={() => onClick && onClick(item.key)}>
                            {map(item, item.key)}
                        </span>
                    </React.Fragment>);
            })}
        </>);
};

export default RenderList;
