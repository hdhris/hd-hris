import React from 'react';
import {Button} from "@nextui-org/button";
import Link from "next/link";
import {cn} from "@nextui-org/react";

function ForgotButton({className}: { className?: string }) {
    return (
        <Button size='sm' variant='light' className={cn('w-fit text-blue-400', className)} as={Link}
                href={'/forgot'}>Forgot Password</Button>
    );
}

export default ForgotButton;