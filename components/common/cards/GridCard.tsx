import React from "react";
import RenderList from "@/components/util/RenderList";
import {Card} from "@nextui-org/react";
import {CardBody, CardHeader} from "@nextui-org/card";


type GridCardProps<T extends { key: React.Key }> = {
    data: T[]; header: (data: T) => React.ReactNode; body: (data: T) => React.ReactNode;
};

export default function GridCard<T extends { key: React.Key }>({data, header, body}: GridCardProps<T>) {
    // Since `key` is guaranteed in `T`, no need to upsert it manually
    const dataWithKey = data.map((item, index) => ({
        ...item, key: item.key as number, // The key is already present
    }));

    return (<RenderList
            items={dataWithKey}
            map={(item, key) => {
                return (<Card className="w-[250px] h-fit" isHoverable key={key}>
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