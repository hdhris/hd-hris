import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
    },
    label: {
        flex: 1,
        fontSize: 10,
        paddingLeft: 10,
    },
    colon: {
        width: 10,
        fontSize: 10,
        textAlign: 'center',
    },
    amount: {
        width: 80,
        fontSize: 10,
        textAlign: 'right',
        paddingRight: 10,
    },
    spacer: {
        width: 10,
    },
});

interface Props {
    label: string;
    amount: string | number;
}

export const PayslipRow = ({ label, amount }: Props) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={styles.amount}>{amount}</Text>
        <Text style={styles.colon}>:</Text>
    </View>
);