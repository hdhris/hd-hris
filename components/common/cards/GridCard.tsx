
import uniqolor from "uniqolor";
import React from "react";
import {Key} from "@react-types/shared";
import RenderList from "@/components/util/RenderList";
import {Card, cn} from "@nextui-org/react";
import {CardBody, CardHeader} from "@nextui-org/card";




type GridCardProps<T extends { key: React.Key }> = {
    data: T[];
    header: (data: T) => React.ReactNode;
    body: (data: T) => React.ReactNode;
};

export default function GridCard<T extends { key: React.Key }>({ data, header, body }: GridCardProps<T>) {
    // Since `key` is guaranteed in `T`, no need to add it manually
    const dataWithKey = data.map((item) => ({
        ...item,
        key: item.key as number, // The key is already present
    }));

    return (<RenderList
            items={dataWithKey}
            map={(item, key) => {
                const isLight = uniqolor(key).isLight;
                return (<Card className="w-[270px] h-fit" isHoverable key={key}>
                        <CardHeader className="p-0">
                            {header(item)}
                        </CardHeader>
                        <CardBody className="overflow-hidden">
                            {body(item)}
                        </CardBody>
                    </Card>)
            }}
        />

    )
}