import React from "react";
import {Button} from "@nextui-org/button";
import {doSocialLogin} from "@/actions/authActions";
import Image from "next/image";
import google from "assets/icons/google.svg"
import ms from "assets/icons/microsoft.svg"


const OAthLogin: React.FC = () => {
    return (<div className="flex justify-between">
        <form action={doSocialLogin}>
            <Button type='submit'
                    className="w-full"
                    radius='sm'
                    variant="light"
                    startContent={<Image src={google} className="w-4 h-4" alt="Google"/>}
            >
                Sign in with Google
            </Button>
        </form>
        <form action={doSocialLogin}>
            <Button type='submit'
                    className="w-full"
                    radius='sm'
                    variant="light"
                    startContent={<Image src={ms} className="w-4 h-4" alt="Google"/>}
            >
                Sign in with Microsoft
            </Button>
        </form>
    </div>);
};

export default OAthLogin;