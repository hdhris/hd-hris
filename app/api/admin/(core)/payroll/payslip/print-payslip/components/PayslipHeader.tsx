import { Text, View, StyleSheet } from '@react-pdf/renderer';
import {PayslipData} from "@/types/payslip/types";
import Logo from "@/components/common/Logo";

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    period: {
        fontSize: 12,
        color: '#666',
        marginBottom: 15,
    },
    employeeInfo: {
        fontSize: 14,
        marginBottom: 3,
        fontWeight: 'bold',
    },
    role: {
        fontSize: 12,
        color: '#666',
    },
});

interface Props {
    data: PayslipData;
    period: string;
}

export const PayslipHeader = ({ data, period }: Props) => (
    <View style={styles.header}>
        <Logo />
        <Text style={styles.title}>PAYSLIP</Text>
        <Text style={styles.period}>{period}</Text>
        <Text style={styles.employeeInfo}>{data.name}</Text>
        <Text style={styles.role}>{data.role}</Text>
    </View>
);