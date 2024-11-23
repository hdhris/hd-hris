import * as React from 'react';
import { Html, Text } from "@react-email/components";

interface EmailProps {
    url: string
}
export function Email() {
    // const { url } = props;

    return (
        <Html lang="en">
            <Text>Testing Email</Text>
        </Html>
    );
}
