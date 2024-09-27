import React from 'react';
import {Avatar} from "@nextui-org/avatar";
import {auth} from "@/auth";

async function UserAvatar() {
    const session = await auth();
    console.log(session)
    return (<Avatar
            // src={userProfile?.pic!}
            size="sm"
            showFallback
            // fallback={!userProfile?.pic && <UserRound className="w-6 h-6 text-default-500" size={20}/>}
        />);
}

export default UserAvatar;