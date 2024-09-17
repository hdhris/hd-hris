import React from "react";
import {Button} from "@nextui-org/button";
import {doSocialLogin} from "@/actions/authActions";
import Image from "next/image";
import google from "assets/icons/google.svg"


const GoogleLogin = () => {
    return (<form action={doSocialLogin}>
        <Button type='submit'
                className="w-full"
                radius='sm'
                startContent={
                    <Image src={google} className="w-4 h-4" alt="Google"/>
                }
        >
            Sign in with Google
        </Button>
    </form>);
};

export default GoogleLogin;