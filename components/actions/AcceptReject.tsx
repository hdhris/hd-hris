import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { Button } from "@nextui-org/react";
import React, { useState } from "react";
import { IoCloseSharp, IoCheckmarkSharp } from "react-icons/io5";

interface AcceptRejectProps {
    onAccept: () => Promise<void>;
    onReject: () => Promise<void>;
    isDisabled?: {
        accept?: boolean;
        reject?: boolean;
    };
}

function AcceptReject({ onAccept, onReject, isDisabled }: AcceptRejectProps) {
    const [isRejecting, setIsRejecting] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    return (
        <div className="flex gap-1 items-center">
            <Button
                isIconOnly
                variant="flat"
                {...uniformStyle({ color: "danger" })}
                onClick={async()=>{
                    setIsRejecting(true);
                    await onReject();
                    setIsRejecting(false);
                }}
                isLoading={isRejecting}
                isDisabled={isDisabled?.reject || isAccepting}
            >
                <IoCloseSharp className="size-5 text-danger-500" />
            </Button>
            <Button
                {...uniformStyle({ color: "success" })}
                startContent={!isAccepting && <IoCheckmarkSharp className="size-5 text-white" />}
                className="text-white"
                onClick={async()=>{
                    setIsAccepting(true);
                    await onAccept();
                    setIsAccepting(false);
                }}
                isLoading={isAccepting}
                isDisabled={isDisabled?.accept || isRejecting}
            >
                Approve
            </Button>
        </div>
    );
}

export default AcceptReject;
