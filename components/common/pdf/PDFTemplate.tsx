import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#E4E4E4',
        padding: 30,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    content: {
        fontSize: 12,
        lineHeight: 1.5,
    },
})

interface PDFTemplateProps {
    title: string
    content: string
}

export default function PDFTemplate({ title, content }: PDFTemplateProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View>
                    <Text style={styles.title} >{title}</Text>
                    <Text style={styles.content}>{content}</Text>
                </View>
            </Page>
        </Document>
    )
}
