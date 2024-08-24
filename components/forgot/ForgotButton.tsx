import React from 'react';
import {Button} from "@nextui-org/button";
import Link from "next/link";

function ForgotButton() {
    return (
        <Button size='sm' variant='light' className='w-fit text-blue-400' as={Link}
                href={'/forgot'}>Forgot Password</Button>
    );
}

export default ForgotButton;