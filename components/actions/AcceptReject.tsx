import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {icon_size_sm} from "@/lib/utils";
import {Button, cn} from "@nextui-org/react";
import React, {useState} from "react";
import {LuThumbsDown, LuThumbsUp} from "react-icons/lu";

interface AcceptRejectProps {
    onAccept: () => Promise<void>;
    onReject: () => Promise<void>;
    isDisabled?: {

        accept?: boolean; reject?: boolean;
    };
}

function AcceptReject({onAccept, onReject, isDisabled}: AcceptRejectProps) {
    const [isRejecting, setIsRejecting] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    return (<div className="flex gap-1 items-center">
            <Button
                isIconOnly

                {...uniformStyle({color: "danger", radius: "full",  variant: "light"})} //Fixed: 'variant' is specified more than once, so this usage will be overwritten.
                onClick={async () => {
                    setIsRejecting(true);
                    await onReject();
                    setIsRejecting(false);
                }}
                isLoading={isRejecting}
                isDisabled={isDisabled?.reject || isAccepting}
            >
                <LuThumbsDown className={cn("text-danger", icon_size_sm)}/>
            </Button>
            <Button
                isIconOnly

                {...uniformStyle({color: "success", radius: "full", variant: "light"})} //Fixed: 'variant' is specified more than once, so this usage will be overwritten.
                onClick={async () => {
                    setIsAccepting(true);
                    await onAccept();
                    setIsAccepting(false);
                }}
                isLoading={isAccepting}
                isDisabled={isDisabled?.accept || isRejecting}
            >
                <LuThumbsUp className={cn("text-success", icon_size_sm)}/>
            </Button>
        </div>);
}

export default AcceptReject;
