import React, {ReactNode} from 'react';
import {GoogleReCaptchaProvider} from "react-google-recaptcha-v3";

function ReCaptchaProvider({children}: {children: ReactNode}) {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_RECAPTCHA_SITE_KEY!}>
            {children}
        </GoogleReCaptchaProvider>
    );
}

export default ReCaptchaProvider;