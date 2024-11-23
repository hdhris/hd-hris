import React, {ReactNode} from 'react';
import Typography from "@/components/common/typography/Typography";
import no_data from "@/assets/not-found/no-data.svg"
import Image from "next/image"

interface NoDataProps{
    message?: ReactNode
}
function NoData({message}: NoDataProps) {
    return (
        <div className='w-full h-full grid place-items-center'>
            <div className="flex flex-col items-center">
                <Image src={no_data} className="h-40 w-40" alt="No Data Found"/>
                <Typography className="!text-default-400/75">{message || "No Data Found. Try again later"}</Typography>
            </div>
        </div>
    );
}

export default NoData;