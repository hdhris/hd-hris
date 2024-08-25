import React, {useEffect, useMemo, useState} from "react";
import dayjs from "dayjs";
import Typography from "@/components/common/typography/Typography";
import {Divider} from "@nextui-org/divider";

interface Props {
    onClockShow?: boolean
}

export default function DateComponent({ onClockShow }: Props) {
    const [date, setDate] = useState<string[]>([
        "--",
        "--",
        "--",
        "--:--",
        "--",
        "--",
    ]);

    useEffect(() => {
        const updateDate = () =>
            setDate(
                dayjs()
                    .format(`DD MMM YYYY ddd ${onClockShow ? "hh:mm A" : "HH:mm"}`)
                    .split(" ")
            );
        updateDate(); // Set initial date
        const interval = setInterval(updateDate, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [onClockShow]); // Remove `date` from dependencies

    return useMemo(
        () => (
            <>
                {onClockShow ? (
                    <div className="flex flex-col gap-3 p-2 mb-20 ml-2">
                        <div className="flex flex-row gap-2 items-center">
                            <Typography className="text-6xl font-semibold">{date[0]}</Typography>
                            <div className="flex flex-col">
                                <Typography className="text-xl font-semibold">{date[1]}</Typography>
                                <Typography className="text-lg font-semibold opacity-50">
                                    {date[2]}
                                </Typography>
                            </div>
                        </div>
                        <Divider />
                        <div className="flex gap-2 items-center">
                            <Typography>{date[3]}</Typography>
                            <Divider orientation="vertical" />
                            <Typography className="text-inactive-bar">{`${date[4]} ${date[5]}`}</Typography>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 p-2 mb-20">
                        <div className="flex flex-col gap-2 items-center">
                            <Typography className="font-semibold text-2xl">
                                {date[4].split(":")[0]}
                            </Typography>
                            <Typography className="font-semibold text-2xl">
                                {date[4].split(":")[1]}
                            </Typography>
                        </div>
                    </div>
                )}
            </>
        ),
        [date, onClockShow]
    );
}
