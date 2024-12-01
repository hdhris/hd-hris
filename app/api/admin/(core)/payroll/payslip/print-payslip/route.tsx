import { NextResponse } from "next/server";
import ReactPDF, { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {Card, CardBody, CardFooter, CardHeader} from "@nextui-org/react";
import {toGMT8} from "@/lib/utils/toGMT8";
import {numberWithCommas} from "@/lib/utils/numberFormat";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import React from "react";
import {Divider} from "@nextui-org/divider";
import {ViewPayslipType} from "@/types/payslip/types";

// Define the payslip data type
// Styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 10,
        fontFamily: "Helvetica",
    },
    header: {
        textAlign: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 12,
        fontWeight: "semibold",
        marginBottom: 5,
    },
    section: {
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        borderBottomStyle: "solid",
        paddingVertical: 2,
    },
    footer: {
        marginTop: 5,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        borderTopStyle: "solid",
        paddingTop: 5,
    },
    bold: {
        fontWeight: "bold",
    },
});

// PayStub Component
const PayStub = ({ data }: { data: ViewPayslipType & { date: string } }) => {
    if (!data || !data.data || !data.earnings || !data.deductions) {
        return <Text>Error: Invalid data provided</Text>;
    }

    const { name, role } = data.data;
    const { earnings, deductions, net } = data;
    const earningsList = earnings.list || [];
    const deductionsList = deductions.list || [];

    return (
        <Document>
            <Page size={{ width: 300, height: "auto" }} style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>PAYSLIP</Text>
                    <Text style={{
                        fontSize: 10,
                        color: "#393939",
                        marginBottom: 5
                    }}>{data.date || "N/A"}</Text>
                    <Text style={{
                        fontWeight: "bold",
                        marginBottom: 5
                    }}>{name || "N/A"}</Text>
                    <Text>{role || "N/A"}</Text>
                </View>

                {/* Earnings Section */}
                <View style={styles.section}>
                    <Text style={styles.bold}>Earnings</Text>
                    {earningsList.map((item, index) => (
                        <View style={styles.row} key={index}>
                            <Text>{item.label || "N/A"}</Text>
                            <Text>{item.number || "N/A"}</Text>
                            <Text>{item.amount || "0.00"}</Text>
                        </View>
                    ))}
                    <View style={styles.row}>
                        <Text>Total Earnings</Text>
                        <Text />
                        <Text style={styles.bold}>{earnings.total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Deductions Section */}
                <View style={styles.section}>
                    <Text style={styles.bold}>Deductions</Text>
                    {deductionsList.map((item, index) => (
                        <View style={styles.row} key={index}>
                            <Text>{item.label || "N/A"}</Text>
                            <Text>{item.number || "N/A"}</Text>
                            <Text>{item.amount || "0.00"}</Text>
                        </View>
                    ))}
                    <View style={styles.row}>
                        <Text>Total Deductions</Text>
                        <Text />
                        <Text style={styles.bold}>{deductions.total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Net Pay */}
                <View style={styles.footer}>
                    <Text style={styles.bold}>Net Pay: {net.toFixed(2)}</Text>
                </View>
            </Page>
        </Document>
    );
};
export async function POST(req: Request) {
    try {
        // Parse the incoming payslip data
        const payslipData: ViewPayslipType & { date: string } = await req.json();

        // Render the PDF to a stream
        const pdfStream = await ReactPDF.renderToStream(<PayStub data={payslipData} />);

        // Return the PDF as a downloadable response
        return new NextResponse(pdfStream as unknown as ReadableStream, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${payslipData.data.name+"-"+payslipData.date}-Payslip.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return NextResponse.error();
    }
}
