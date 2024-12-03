import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { PayslipRow } from './PayslipRow';
import {ListItem} from "@/types/payslip/types";

const styles = StyleSheet.create({
    section: {
        marginBottom: 20,
    },
    title: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    total: {
        marginTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#000',
    },
});

interface Props {
    title: string;
    items: ListItem[];
    total: number;
}

export const PayslipSection = ({ title, items, total }: Props) => (
    <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        {items.map((item, index) => (
            <PayslipRow
                key={index}
                label={item.label}
                amount={parseFloat(item.amount || item.number).toLocaleString()}
            />
        ))}
        <View style={styles.total}>
            <PayslipRow
                label=""
                amount={total.toLocaleString()}
            />
        </View>
    </View>
);