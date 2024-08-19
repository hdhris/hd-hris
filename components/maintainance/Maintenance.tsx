import React from 'react';
import Image from "next/image";
import maintenanceImage from "@/assets/maintainance/maintenance.jpg";

    const MaintenanceBreak = () => {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center p-3">
                <Image src={maintenanceImage} alt="Maintenance Image" className="w-96 h-96" />
                <h1 className="grid place-items-center md:flex mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-600 md:text-5xl lg:text-6xl dark:text-white">
                    Under Maintenance
                </h1>
                <p className="text-center text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
                    We apologize for the inconvenience, but our site is currently undergoing maintenance. Please check back later.
                </p>
            </div>
        );
    }

export default MaintenanceBreak;