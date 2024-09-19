import React from 'react';
import {Button} from "@nextui-org/button";
import Link from "next/link";
import {ButtonProps, cn} from "@nextui-org/react";

interface ForgotButtonProps extends ButtonProps {
    className?: string
}

function ForgotButton({className, ...props}:ForgotButtonProps) {
    return (
        <Button {...props} size='sm' variant='light' className={cn('w-fit text-blue-400', className)} as={Link}
                href={'/forgot'}>Forgot Password</Button>
    );
}

export default ForgotButton;