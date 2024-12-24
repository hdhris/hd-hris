"use client";
import React, {useRef} from "react";
import {useReactToPrint} from "react-to-print";

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


    </>);
}

export default TestPlayground;
