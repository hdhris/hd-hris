import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { Button } from "@nextui-org/react";
import React from "react";
import { IoCloseSharp, IoCheckmarkSharp } from "react-icons/io5";

interface AcceptRejectProps {
    onAccept: () => Promise<void>;
    onReject: () => Promise<void>;
}

function AcceptReject({ onAccept, onReject }: AcceptRejectProps) {
    return (
        <div className="flex gap-1 items-center">
            <Button isIconOnly variant="flat" {...uniformStyle({ color: "danger" })} onClick={onReject}>
                <IoCloseSharp className="size-5 text-danger-500" />
            </Button>
            <Button
                {...uniformStyle({ color: "success" })}
                startContent={<IoCheckmarkSharp className="size-5 text-white" />}
                className="text-white"
                onClick={onAccept}
            >
                Approve
            </Button>
        </div>
    );
}

export default AcceptReject;
