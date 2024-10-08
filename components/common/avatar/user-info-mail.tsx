import { Link, User } from "@nextui-org/react";
import React from "react";

interface UserMailProps {
  name: string;
  email: string;
  picture: string;
  message?: {
    subject: string;
    body: string;
  };
}
function UserMail({ name, email, picture, message }: UserMailProps) {
  const body = message?.body || "Shrek want to have fun with your leave.";
  const subject = message?.subject || "Shrek Time.";
  return (
    <User
      name={name}
      description={
        <Link
          href="#"
          size="sm"
          className="text-blue-500"
          onClick={(e) => {
            e.preventDefault(); // Prevent default link behavior
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
      }
      avatarProps={{
        src: picture,
      }}
    />
  );
}

export default UserMail;
