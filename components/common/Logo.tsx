import React from 'react';
import Image from 'next/image';
import logo from '@/public/logo.svg';
import Typography from '@/components/common/typography/Typography';

const APP_NAME = process.env.APP_NAME;

function LogoMemo() {
    return (
        <div className='flex gap-2 items-center'>
            <Image src={logo} alt="logo" width={48} height={48} priority />
            {APP_NAME && (
                <Typography suppressHydrationWarning={true} className='text-lg font-bold text-primary'>
                    {APP_NAME}
                </Typography>
            )}
        </div>
    );
}

const Logo = React.memo(LogoMemo);

export default Logo;
