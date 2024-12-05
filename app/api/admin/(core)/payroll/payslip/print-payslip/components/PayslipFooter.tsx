import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    footer: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 0.5,
        borderTopColor: '#ccc',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    column: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        color: '#666',
        marginBottom: 5,
    },
    value: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});

interface Props {
    preparedBy: string;
    receivedBy: string;
}

export const PayslipFooter = ({ preparedBy, receivedBy }: Props) => (
    <View style={styles.footer}>
        <View style={styles.row}>
            <View style={styles.column}>
                <Text style={styles.label}>Prepared by:</Text>
                <Text style={styles.value}>{preparedBy}</Text>
            </View>
            <View style={styles.column}>
                <Text style={styles.label}>Received by:</Text>
                <Text style={styles.value}>{receivedBy}</Text>
            </View>
        </View>
    </View>
);