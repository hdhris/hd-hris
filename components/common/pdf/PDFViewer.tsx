'use client'

import { useState } from 'react'

interface PDFViewerProps {
    url: string
}

export default function PDFViewer({ url }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null)
    const [pageNumber, setPageNumber] = useState(1)

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
    }

    return (
        <div className="mt-4">
            <iframe src={url} className="w-full h-[600px]" />
            <p className="mt-2">
                Page {pageNumber} of {numPages}
            </p>
        </div>
    )
}

