'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PDFViewer from "@/components/common/pdf/PDFViewer";

export default function Home() {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    const generatePDF = async () => {
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        })
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        console.log("Url: ", url)
        setPdfUrl(url)
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Server-Side PDF Generation</h1>
            <div className="mb-4">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter PDF title"
                />
            </div>
            <div className="mb-4">
                <Label htmlFor="content">Content</Label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter PDF content"
                    className="w-full p-2 border rounded"
                    rows={5}
                />
            </div>
            <Button onClick={generatePDF}>Generate PDF</Button>
            {pdfUrl && <PDFViewer url={pdfUrl} />}
        </div>
    )
}

