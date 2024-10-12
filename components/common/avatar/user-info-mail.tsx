import { Link, User } from "@nextui-org/react";
import React from "react";

interface UserMailProps {
  name: string;
  description?: string;
  email?: string;
  picture: string;
  size? : "sm" | "md" | "lg"
  message?: {
    subject: string;
    body: string;
  };
}
function UserMail({
  name,
  email,
  description,
  picture,
  message,
  size,
}: UserMailProps) {
  const body = message?.body || "Shrek want to have fun with your leave.";
  const subject = message?.subject || "Shrek Time.";
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return (
    <User
      name={name}
      description={
        email && emailRegex.test(email) ? (
          <Link
            href="#"
            size="sm"
            className="text-blue-500"
            onPress={(e) => {
              window.open(
                `https://mail.google.com/mail/u/0/?fs=1&to=${email}&su=${subject.replaceAll(
                  " ",
                  "%20"
                )}&body=${body.replaceAll(" ", "%20")}&tf=cm`,
                "emailWindow",
                "width=600,height=400,top=100,left=100"
              );
            }}
            isExternal
          >
            {email}
          </Link>
        ) : (
          description && (
            <p className="text-small text-gray-400">{description}</p>
          )
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
