import React, {ReactNode} from 'react';
import Typography from "@/components/common/typography/Typography";

interface NoDataProps{
    message?: ReactNode
}
function NoData({message}: NoDataProps) {
    return (
        <div className='w-full h-full grid place-items-center'>
            <Typography className="text-default-400/75 font-bold">{message || "No Data Found. Try again later"}</Typography>
        </div>
    );
}

export default NoData;