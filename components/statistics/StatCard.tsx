import React from 'react'
import leave_icon from "../../assets/icon/svg/leave.svg";
import {IoIosArrowRoundDown, IoIosArrowRoundUp} from "react-icons/io";
import {cn} from "@/lib/utils";
import Image from 'next/image'

interface StatCardProps {
    icon?: string
    title: string
    subtitle?: string
    statValue?: string
    statStatus?: 'up' | 'down'
    children?: React.ReactNode
}

export default function StatCard({icon, title, subtitle, statValue, statStatus, children}: StatCardProps) {
    return (
        <div
            className="flex justify-between pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                {icon &&
                    <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center me-3">
                        <Image src={icon} alt=""/>
                    </div>
                }
                <div>
                    <h5 className="leading-none text-xl font-semibold text-gray-600 dark:text-white pb-1">{title}</h5>
                    <p className="text-sm font-normal text-gray-500 dark:text-gray-400">{subtitle}</p>
                </div>
            </div>
            <div>
                {
                    statValue && statStatus &&
                    <span
                        className={`${cn(statStatus === 'up' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")} text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-green-900 dark:text-green-300`}>
                        {statStatus === 'up' && <IoIosArrowRoundUp className="w-5 h-5"/>}
                        {statStatus === 'down' && <IoIosArrowRoundDown className="w-5 h-5"/>}
                        {statValue}
                    </span>
                }
                {children}
            </div>
        </div>
    )

}
