import React, { ReactElement } from 'react';
import GridCard from '../grid/GridCard';

type GridListProps<T> = {
    items: T[];
    children: (item: T) => ReactElement<typeof GridCard>;
};

function GridList<T>({ items, children }: GridListProps<T>) {
    return (
        <div className="flex flex-wrap gap-5 h-full overflow-auto pb-3">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {children(item)}
                </React.Fragment>
            ))}
        </div>
    );
}

export default GridList;
