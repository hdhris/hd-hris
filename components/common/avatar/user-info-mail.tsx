import { Link, User } from "@nextui-org/react";
import React, {ReactNode} from "react";

interface UserMailProps {
    name: string | ReactNode; // adding this to accept react node
    description?: string | ReactNode;
    email?: string;
    picture: string;
    size?: "sm" | "md" | "lg";
    onClick?: () => void;
    className?: string;
    message?: {
        subject: string;
        body: string;
    };
}
function UserMail({ name, email, description, picture, message, onClick, size, className }: UserMailProps) {
    const body = message?.body || "Shrek want to have fun with your leave.";
    const subject = message?.subject || "Shrek Time.";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return (
        <User
            name={name}
            className={className}
            onClick={onClick}
            description={
                email && emailRegex.test(email) ? (
                    <Link
                        href="#"
                        size="sm"
                        className="text-blue-500"
                        onPress={(e) => {
                            window.open(
                                `https://mail.google.com/mail/u/0/?fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&tf=cm`,
                                "emailWindow",
                                "width=600,height=400,top=100,left=100"
                            );
                        }}
                        isExternal
                    >
                        {email}
                    </Link>
                ) : (
                    description && <p className="text-small text-gray-400">{description}</p>
                )
            }
            avatarProps={{
                src: picture,
                size: size,
            }}
        />
    );
}

export default UserMail;
