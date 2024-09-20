"use client"
import React from "react";
import {Input} from "@nextui-org/react";
import {icon_color} from "@/lib/utils";
import {FaLock} from "react-icons/fa";
import {RiEyeCloseLine, RiEyeLine} from "react-icons/ri";
import {Button} from "@nextui-org/button";
import InputStyle from "@/lib/custom/styles/InputStyle";
import Typography from "@/components/common/typography/Typography";

export default function PasswordInput() {
    const [isVisible, setIsVisible] = React.useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
        <Input
            labelPlacement="outside"
            label={
                <Typography className="text-medium font-medium text-gray-900">
                    Password
                </Typography>
            }
            variant="bordered"
            name="password"
            classNames={InputStyle}
            startContent={<FaLock className={icon_color}/>}
            endContent={
                <Button variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2' disableAnimation={true}
                        onClick={toggleVisibility}>
                    {isVisible ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/>}
                </Button>
            }
            type={isVisible ? "text" : "password"}
        />
    );
}
