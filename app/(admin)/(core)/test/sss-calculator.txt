'use client'

import { useState, useMemo } from "react"
import { Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Component() {
    const [salary, setSalary] = useState("")
    const [results, setResults] = useState<{
        msc: number
        employeeShare: number
        employerShare: number
        ecShare: number
        wispEmployee: number
        wispEmployer: number
        total: number
    } | null>(null)

    const sssData = useMemo(() => {
        return {
            minSalary: 3250,
            maxSalary: 24750,
            minMSC: 3000,
            maxMSC: 20000,
            mscStep: 500,
            regularEmployeeRate: 0.045,
            regularEmployerRate: 0.085,
            ecThreshold: 14500,
            ecLowRate: 10,
            ecHighRate: 30,
            wispThreshold: 20000
        }
    }, [])

    const calculateSSS = (monthlySalary: number) => {
        const { minSalary, maxSalary, minMSC, maxMSC, mscStep, regularEmployeeRate, regularEmployerRate, ecThreshold, ecLowRate, ecHighRate, wispThreshold } = sssData

        // Find MSC based on salary range
        let msc: number;
        if(monthlySalary < minSalary && monthlySalary > maxSalary) {
            alert("Within range")
            if (monthlySalary > minSalary) {
                msc = minMSC;
            } else{
                msc = maxMSC;
            }
        } else {
            alert("Outside range" + mscStep)
            msc = Math.round(monthlySalary / mscStep) * mscStep;
        }

        // Calculate regular contributions
        const baseAmount = Math.min(msc, wispThreshold)
        const employeeShare = baseAmount * regularEmployeeRate
        const employerShare = baseAmount * regularEmployerRate

        // Calculate EC
        const ecShare = msc <= ecThreshold ? ecLowRate : ecHighRate

        // Calculate WISP
        let wispEmployee = 0
        let wispEmployer = 0
        if (msc > wispThreshold) {
            const excess = msc - wispThreshold
            wispEmployee = excess * regularEmployeeRate
            wispEmployer = excess * regularEmployerRate
        }

        // Calculate total
        const total = employeeShare + employerShare + ecShare + wispEmployee + wispEmployer

        setResults({
            msc,
            employeeShare,
            employerShare,
            ecShare,
            wispEmployee,
            wispEmployer,
            total
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        calculateSSS(Number(salary))
    }

    return (
        <Card className="w-full max-w-3xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-6 w-6" />
                    SSS Contribution Calculator
                </CardTitle>
                <CardDescription>
                    Calculate SSS contributions based on monthly salary
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="salary">Monthly Salary</Label>
                        <Input
                            id="salary"
                            placeholder="Enter monthly salary"
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit">Calculate</Button>
                </form>

                {results && (
                    <Table className="mt-6">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Monthly Salary Credit (MSC)</TableCell>
                                <TableCell className="text-right">₱{results.msc.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Employee Share ({sssData.regularEmployeeRate * 100}%)</TableCell>
                                <TableCell className="text-right">₱{results.employeeShare.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Employer Share ({sssData.regularEmployerRate * 100}%)</TableCell>
                                <TableCell className="text-right">₱{results.employerShare.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>EC Share</TableCell>
                                <TableCell className="text-right">₱{results.ecShare.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>WISP Employee Share</TableCell>
                                <TableCell className="text-right">₱{results.wispEmployee.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>WISP Employer Share</TableCell>
                                <TableCell className="text-right">₱{results.wispEmployer.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow className="font-medium">
                                <TableCell>Total Contribution</TableCell>
                                <TableCell className="text-right">₱{results.total.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                )}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
                Note: This is a simplified calculation. Please refer to the official SSS website for the most accurate and up-to-date computation.
            </CardFooter>
        </Card>
    )
}