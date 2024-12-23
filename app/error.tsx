"use client"
import not_found from "@/assets/error/server-error.svg"
import React from "react";
import Image from 'next/image'
import {Button} from "@nextui-org/react";
import Typography from "@/components/common/typography/Typography";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="w-full h-screen flex flex-col justify-center items-center p-3 gap-4">
            <Image src={not_found} alt="" className="w-96 h-96"/>
            <h1 className="grid place-items-center md:flex mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-600 md:text-5xl lg:text-6xl dark:text-white">500
                -  <span className="text-[#FF725E]">Server Error</span></h1>
            <p className="text-center text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Something went wrong - {error.message}</p>
            <Button onPress={reset} variant="light"><Typography className="text-blue-300 underline text-medium">Try Again</Typography></Button>
        </div>
    )
}