import React from 'react';
import Link from "next/link";
<<<<<<< HEAD
import { btnClass, cn, icon_size_sm } from "@/lib/utils";
import { Button } from "@nextui-org/button";
import { ButtonProps } from "@nextui-org/react";
import { LuPlus } from "react-icons/lu";
=======
import {btnClass, icon_size, icon_size_sm} from "@/lib/utils";
import {cn} from '@nextui-org/react'
import {Button} from "@nextui-org/button";
import {ButtonProps} from "@nextui-org/react";
import {LuPlus} from "react-icons/lu";
>>>>>>> origin/main

interface AddProps extends ButtonProps {
    name: string;
    href?: string; // Make href optional
    className?: string;
    variant?: ButtonProps["variant"];
    onClick?: (e: React.MouseEvent) => void; // Optional onClick handler
}

function Add({ name, href, variant, className, onClick }: AddProps) {
    return (
        <Button
            radius='none'
            size='sm'
            color='primary'
            variant={variant || "flat"}
            as={href ? Link : 'button'} // Conditionally render as Link or button
            href={href}
            className={cn("", btnClass, className)}
            onClick={onClick} // Attach the onClick handler if provided
            startContent={<LuPlus className={icon_size_sm} />}
        >
            {name}
        </Button>
    );
}

export default Add;



// import React from 'react';
// import Link from "next/link";
// import {btnClass, cn, icon_size, icon_size_sm} from "@/lib/utils";
// import {Button} from "@nextui-org/button";
// import {ButtonProps} from "@nextui-org/react";
// import {LuPlus} from "react-icons/lu";

// interface AddProps extends ButtonProps{
//     name: string,
//     href: string,
//     className?: string,
//     variant?: ButtonProps["variant"]
// }

// function Add({name, href, variant, className}: AddProps) {
//     return (<Button radius='none' size='sm' color='primary' variant={variant || "flat"} as={Link}
//                     href={href} className={cn("", btnClass, className)}
//                     startContent={<LuPlus className={icon_size_sm}/>}>{name}</Button>);
// }

// export default Add;