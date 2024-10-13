import React from 'react';
import Typography from "@/components/common/typography/Typography";

function NoData() {
    return (
        <div className='w-full h-full grid place-items-center'>
            <Typography className="text-default-400/75 font-bold">No Data Found. Try again later</Typography>
        </div>
    );
}

export default NoData;