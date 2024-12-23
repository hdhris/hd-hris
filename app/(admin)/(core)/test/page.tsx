"use client";
import React, {useRef} from "react";
import {useReactToPrint} from "react-to-print";
import ReceivedNotification from "@/components/functions/notifications/received-notifications/received-notification";

function TestPlayground() {
    const contentRef = useRef<HTMLDivElement>(null);

    const reactToPrintFn = useReactToPrint({
        contentRef, documentTitle: "Print Title",
    });

    return (<>
        {/*<button onClick={() => reactToPrintFn?.()}>Print</button> /!* Use a safe function call *!/*/}
        {/*<div className="p-4 bg-gray-200 print:landscape:bg-red-200" ref={contentRef}>*/}
        {/*    This is the content to print*/}
        {/*</div>*/}
        <ReceivedNotification/>

    </>);
}

export default TestPlayground;
