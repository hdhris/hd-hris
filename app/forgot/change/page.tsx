import React from 'react';
import Otp from "@/components/forgot/otp/Otp";
import ChangePassword from "@/components/forgot/change/ChangePassword";

function Page() {
    return (
        <main className="flex h-screen flex-col items-center">
            <ChangePassword/>
        </main>
    );
}

export default Page;