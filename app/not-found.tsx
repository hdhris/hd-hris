import not_found from "@/assets/not-found/not-found.svg"
import React from "react";
import Image from 'next/image'

export default function NotFound() {
    return (
        <div className="w-full h-screen flex flex-col justify-center items-center p-3">
            <Image src={not_found} alt="" className="w-96 h-96"/>
            <h1 className="grid place-items-center md:flex mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-600 md:text-5xl lg:text-6xl dark:text-white">404
                -  <span className="text-[#FF725E]">Not Found</span></h1>
            <p className="text-center text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Oops! It seems like you&apos;ve
                taken a wrong turn.</p>
        </div>
    )
}