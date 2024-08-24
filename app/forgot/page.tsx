
import React from 'react';
import Forgot from "@/components/forgot/Forgot";

function Page() {
    // const router = useRouter()
    // const email = getCookie('email');
    // const otp = getCookie('otp');
    //
    // if (email) {
    //     router.push('/forgot/otp')
    // }
    // if (otp) {
    //     router.push('/forgot/change')
    // }
    return (<main className="flex h-screen flex-col items-center">
            <Forgot/>
        </main>);
}

export default Page;