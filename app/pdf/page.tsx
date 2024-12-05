'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PDFViewer from "@/components/common/pdf/PDFViewer";
import {ViewPayslipType} from "@/types/payslip/types";

export default function Home() {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    const generatePDF = async () => {
        const payslipData: ViewPayslipType & {date: string} = {
            date: "2023-06-01",
            data: {
                name: "John Doe",
                role: "Software Engineer",
            },
            earnings: {
                total: 5000,
                list: [
                    { label: "Basic Salary", number: "001", amount: "4000" },
                    { label: "Overtime", number: "002", amount: "500" },
                    { label: "Bonus", number: "003", amount: "500" },
                ],
            },
            deductions: {
                total: 1000,
                list: [
                    { label: "Income Tax", number: "101", amount: "800" },
                    { label: "Health Insurance", number: "102", amount: "200" },
                ],
            },
            net: 4000,
        };

        const response = await fetch('/api/admin/payroll/payslip/print-payslip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payslipData),
        })
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        console.log("Url: ", url)
        window.open(url, '_blank');

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
        </div>
    )
}

