import { Document, Page, StyleSheet, View } from '@react-pdf/renderer';
import { PayslipHeader } from './PayslipHeader';
import { PayslipSection } from './PayslipSection';
import { PayslipRow } from './PayslipRow';
import { PayslipFooter } from './PayslipFooter';
import {ViewPayslipType} from "@/types/payslip/types";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
    },
    netPay: {
        marginTop: 20,
    },
});

interface Props {
    payslip: ViewPayslipType;
}

export const Payslip = ({ payslip }: Props) => (
    <Document>
        <Page size={[5.5 * 72, 8.5 * 72]} style={styles.page}>
            <PayslipHeader
                data={payslip.data}
                period="December 1-15, 2024"
            />

            <View style={styles.content}>
                <PayslipSection
                    title="Earnings"
                    items={payslip.earnings.list}
                    total={payslip.earnings.total}
                />

                <PayslipSection
                    title="Deductions"
                    items={payslip.deductions.list}
                    total={payslip.deductions.total}
                />

                <View style={styles.netPay}>
                    <PayslipRow
                        label="Net Pay"
                        amount={`₱ ${payslip.net.toLocaleString()}`}
                    />
                </View>
            </View>

            <PayslipFooter
                preparedBy="Cuello, John Rey"
                receivedBy={payslip.data.name}
            />
        </Page>
    </Document>
);